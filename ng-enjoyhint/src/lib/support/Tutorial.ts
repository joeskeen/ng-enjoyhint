import { Signal, computed, signal } from '@angular/core';
import { ITutorialStep } from '../lib.interfaces';

export type Transition = 'start' | 'end' | null;

export class Tutorial {
  private readonly _stepIndex = signal(0);
  private readonly _transitioning = signal<Transition>(null);
  readonly stepIndex: Signal<number> = this._stepIndex.asReadonly();
  readonly transitioning: Signal<Transition> = this._transitioning.asReadonly();
  readonly step: Signal<ITutorialStep | undefined> = computed(
    () => this.steps[this.stepIndex()]
  );
  readonly hasPrevious = computed(() => this.stepIndex() > 0);
  readonly steps: ITutorialStep[];

  constructor(steps: ITutorialStep[]) {
    const lastStep = steps.at(-1);
    if (lastStep) {
      lastStep.nextButton = {
        text: 'Finish',
        ...(lastStep.nextButton ?? {}),
      };
      if (lastStep.event === 'next') {
        lastStep.hideSkip = lastStep.hideSkip ?? true;
      }
    }
    this.steps = steps;
    this.startHook();
  }

  reset() {
    this._stepIndex.set(0);
  }

  setStepIndex(index: number) {
    const normalizedIndex = Math.max(0, Math.min(index, this.steps.length - 1));
    this._stepIndex.set(normalizedIndex);
  }

  async nextStep() {
    await this.endHook();
    this._stepIndex.update((index) => index + 1);
    while (this.step() && await this.shouldSkip()) {
      this._stepIndex.update((index) => index + 1);
    }
    await this.startHook();
  }

  private async shouldSkip() {
    // return false;
    const currentStep = this.step();
    if (!currentStep) {
      return false;
    }
    const shouldSkipFn = currentStep.shouldSkip;
    if (typeof shouldSkipFn !== 'function') {
      return !!shouldSkipFn;
    }
    const result = await shouldSkipFn();
    return !!result;
  }

  private async startHook() {
    const currentStep = this.step();
    if (typeof currentStep?.stepStart === 'function') {
      try {
        this._transitioning.set('start');
        await currentStep.stepStart();
      } catch (e) {
        const currentStepIndex = this._stepIndex();
        console.error(
          `Error executing stepStart hook for step ${currentStepIndex}`,
          e,
          { currentStep }
        );
      } finally {
        this._transitioning.set(null);
      }
    }
  }

  private async endHook() {
    const newStep = this.step();
    if (typeof newStep?.stepEnd === 'function') {
      try {
        this._transitioning.set('end');
        await newStep.stepEnd();
      } catch (e) {
        const newStepIndex = this._stepIndex();
        console.error(
          `Error executing stepEnd hook for step ${newStepIndex}`,
          e,
          { newStep }
        );
      } finally {
        this._transitioning.set(null);
      }
    }
  }

  previousStep() {
    this._stepIndex.update((index) => index - 1);
  }
}
