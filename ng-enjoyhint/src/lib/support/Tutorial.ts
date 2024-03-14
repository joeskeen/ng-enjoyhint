import { Signal, computed, signal } from '@angular/core';
import { ITutorialStep } from '../lib.interfaces';

export class Tutorial {
  private readonly _stepIndex = signal(0);
  readonly stepIndex: Signal<number> = this._stepIndex.asReadonly();
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

  nextStep() {
    this.endHook();
    this._stepIndex.update((index) => index + 1);
    this.startHook();
  }

  private startHook() {
    const currentStepIndex = this._stepIndex();
    const currentStep = this.step();
    try {
      currentStep?.stepStart?.();
    } catch (e) {
      console.error(
        `Error executing stepEnd hook for step ${currentStepIndex}`,
        e,
        { currentStep }
      );
    }
  }

  private endHook() {
    const newStepIndex = this._stepIndex();
    const newStep = this.step();
    try {
      newStep?.stepEnd?.();
    } catch (e) {
      console.error(
        `Error executing stepStart hook for step ${newStepIndex}`,
        e,
        { newStep }
      );
    }
  }

  previousStep() {
    this._stepIndex.update((index) => index - 1);
  }
}
