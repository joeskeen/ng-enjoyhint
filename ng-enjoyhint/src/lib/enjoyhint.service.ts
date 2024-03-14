import { Injectable, Injector } from '@angular/core';
import { EnjoyHintComponent } from './component/enjoy-hint.component';
import { firstValueFrom, zip } from 'rxjs';
import { EnjoyHintRef } from './support/EnjoyHintRef';
import { Elements } from './util/dom-helpers';
import { IEnjoyHintOptions, ITutorialStep } from './lib.interfaces';
import { Tutorial } from './support/Tutorial';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

@Injectable({
  providedIn: 'root',
  deps: [Overlay],
  useFactory: (overlay: Overlay) =>
    new EnjoyHintService(
      overlay,
      new Elements(),
      getComputedStyle(document.body).overflow
    ),
})
export class EnjoyHintService {
  /** @ignore */
  constructor(
    private readonly overlay: Overlay,
    private readonly elements: Elements,
    private readonly originalOverflow: string
  ) {}

  /**
   * Run an interactive tutorial
   * @param steps the tutorial steps to run
   * @param options optional object to override the default behavior
   * @returns a promise resolving when the tutorial is closed; resolves to `true` if the tutorial was completed, `false` if it was skipped
   */
  async runTutorial(
    steps: ITutorialStep[],
    options?: Partial<IEnjoyHintOptions>
  ): Promise<boolean> {
    const tutorial = new Tutorial(steps);

    const enjoyHintRef = new EnjoyHintRef(tutorial, options);
    const overlayRef = this.overlay.create({
      hasBackdrop: false,
      disposeOnNavigation: true,
      positionStrategy: this.overlay.position().global(),
      panelClass: 'ng-enjoyhint-overlay',
    });
    const zIndex = options?.overlayZIndex;
    if (zIndex !== undefined) {
      const globalOverlayWrapper = overlayRef.hostElement;
      const cdkOverlayContainer = globalOverlayWrapper.parentElement;
      [globalOverlayWrapper, cdkOverlayContainer].forEach((e) =>
        e?.style.setProperty('z-index', zIndex.toString())
      );
    }
    const portal = new ComponentPortal(
      EnjoyHintComponent,
      null,
      Injector.create({
        providers: [{ provide: EnjoyHintRef, useValue: enjoyHintRef }],
      })
    );

    try {
      this.elements.body.style.overflow = 'hidden';
      overlayRef.attach(portal);
      return await firstValueFrom(enjoyHintRef.onClose);
    } finally {
      this.elements.body.style.overflow = this.originalOverflow;
      overlayRef.detach();
      overlayRef.dispose();
    }
  }
}
