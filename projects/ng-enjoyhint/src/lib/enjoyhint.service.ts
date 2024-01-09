import {
  ApplicationRef,
  Injectable,
  Injector,
  createComponent,
} from '@angular/core';
import { TutorialComponent } from './tutorial/tutorial.component';
import { firstValueFrom } from 'rxjs';
import { EnjoyHintRef } from './support/EnjoyHintRef';
import { Elements } from './util/dom-helpers';
import { IEnjoyHintOptions, ITutorialStep } from './lib.interfaces';
import { Tutorial } from './tutorial/Tutorial';

@Injectable({
  providedIn: 'root',
  deps: [ApplicationRef],
  useFactory: (appRef: ApplicationRef) =>
    new EnjoyhintService(
      appRef,
      new Elements(),
      getComputedStyle(document.body).overflow
    ),
})
export class EnjoyhintService {
  constructor(
    private readonly appRef: ApplicationRef,
    private readonly elements: Elements,
    private readonly originalOverflow: string
  ) {}

  async runTutorial(steps: ITutorialStep[], options?: IEnjoyHintOptions) {
    const appRoot = this.elements.appRoot;
    if (!appRoot) {
      throw new Error('Root element not found');
    }

    const tutorial = new Tutorial(steps);

    const ref = new EnjoyHintRef(tutorial, options);
    const componentInstance = createComponent(TutorialComponent, {
      elementInjector: Injector.create({
        providers: [{ provide: EnjoyHintRef, useValue: ref }],
      }),
      environmentInjector: this.appRef.injector,
    });
    try {
      this.elements.body.style.overflow = 'hidden';
      this.appRef.attachView(componentInstance.hostView);
      appRoot.appendChild(componentInstance.location.nativeElement);
      await firstValueFrom(ref.onClose);
    } finally {
      this.elements.body.style.overflow = this.originalOverflow;
      componentInstance.destroy();
    }
  }
}
