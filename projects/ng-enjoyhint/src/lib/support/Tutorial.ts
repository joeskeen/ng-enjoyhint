import { computed, signal } from '@angular/core';
import { ITutorialStep } from '../lib.interfaces';

export class Tutorial {
  private readonly _stepIndex = signal(0);
  readonly stepIndex = this._stepIndex.asReadonly();
  readonly step = computed<ITutorialStep | undefined>(
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
      }
      if (lastStep.event === 'next') {
        lastStep.hideSkip = lastStep.hideSkip ?? true;
      }
    }
    this.steps = steps;
  }

  reset() {
    this._stepIndex.set(0);
  }

  setStepIndex(index: number) {
    const normalizedIndex = Math.max(0, Math.min(index, this.steps.length - 1));
    this._stepIndex.set(normalizedIndex);
  }

  nextStep() {
    this._stepIndex.update((index) => index + 1);
  }

  previousStep() {
    this._stepIndex.update((index) => index - 1);
  }
}
