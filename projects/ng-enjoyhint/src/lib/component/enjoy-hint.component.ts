import {
  Component,
  DestroyRef,
  HostBinding,
  NgZone,
  Signal,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  computed,
  effect,
  signal,
} from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { IEnjoyHintOptions } from '../lib.interfaces';
import { EnjoyHintRef } from '../support/EnjoyHintRef';
import {
  Observable,
  combineLatest,
  filter,
  from,
  fromEvent,
  map,
  switchMap,
} from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import {
  ConnectionPositionPair,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayPositionBuilder,
  OverlayRef,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { JsonPipe, NgClass } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { ArrowComponent } from '../support/arrow.component';
import { ForceFieldComponent } from '../support/force-field.component';
import { provideWindow } from '../util/dom-helpers';
import { DirectionPipe } from '../support/direction.pipe';
import { ALL_SIDES } from '../util/positions';
import { TextOrTemplateComponent } from '../support/text-or-template.component';

@Component({
  selector: 'lib-enjoyhint',
  standalone: true,
  imports: [
    ForceFieldComponent,
    ArrowComponent,
    JsonPipe,
    NgClass,
    DirectionPipe,
    TextOrTemplateComponent,
  ],
  templateUrl: './enjoy-hint.component.html',
  styleUrl: './enjoy-hint.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [style({ opacity: 0 }), animate(500)]),
    ]),
  ],
  providers: [provideWindow()]
})
export class EnjoyHintComponent {
  @ViewChild('instructions') instructions!: TemplateRef<any>;
  @HostBinding('style.opacity') readonly opacity: string;

  static readonly defaultOptions: IEnjoyHintOptions = {
    padding: 5,
    fontFamily: 'sans-serif',
    backdropColor: 'black',
    overlayZIndex: undefined,
    backdropOpacity: 0.75,
    foregroundColor: 'white',
    nextButton: { text: 'Next' },
    skipButton: { text: 'Skip' },
    previousButton: { text: 'Previous' },
  };
  readonly viewSize: Signal<{ width: number; height: number }>;
  readonly instructionsWidth = computed(() => this.viewSize().width / 4);
  readonly animating = signal(false);
  readonly focusElement = computed(() => {
    const step = this.ref.tutorial.step();
    if (!step?.selector) {
      return null;
    }
    return document.querySelector<HTMLElement>(step.selector);
  });
  readonly elementBounds = computed<DOMRect>(() => {
    const element = this.focusElement();
    if (!element) {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      } as DOMRect;
    }
    return element.getBoundingClientRect();
  });
  readonly ffPositions = computed(() => {
    const bounds = this.elementBounds();
    const size = this.viewSize();
    return {
      left: {
        x: -1 * size.width + bounds.x - this.options.padding,
        y: 0,
      },
      right: {
        x: bounds.x + bounds.width + this.options.padding,
        y: 0,
      },
      top: {
        x: 0,
        y: -1 * size.height + bounds.y - this.options.padding,
      },
      bottom: {
        x: 0,
        y: bounds.y + bounds.height + this.options.padding,
      },
    };
  });
  readonly step = computed(() => this.ref.tutorial.step());
  readonly options: IEnjoyHintOptions;
  
  private overlayRef: OverlayRef | null = null;
  readonly positionStrategy = computed(() => {
    const element = this.focusElement();
    if (!element) {
      return this.overlayPositionBuilder
        .global()
        .centerHorizontally()
        .centerVertically();
    }
    return this.overlayPositionBuilder
      .flexibleConnectedTo(element)
      .withFlexibleDimensions(false)
      .withPositions(ALL_SIDES);
  });
  readonly position = signal<ConnectionPositionPair | undefined>(undefined);
  thisIsDestroyed: Observable<void>;

  constructor(
    public readonly ref: EnjoyHintRef,
    window: Window,
    private readonly overlayPositionBuilder: OverlayPositionBuilder,
    private readonly overlay: Overlay,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly destroyedRef: DestroyRef,
    private readonly zone: NgZone
  ) {
    this.options = {
      ...EnjoyHintComponent.defaultOptions,
      ...ref.options,
    };
    this.opacity = this.options.backdropOpacity.toString();
    const getSize = () => ({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    this.viewSize = toSignal(fromEvent(window, 'resize').pipe(map(getSize)), {
      initialValue: getSize(),
    });

    this.thisIsDestroyed = from(
      new Promise<void>((resolve) =>
        this.destroyedRef.onDestroy(() => resolve())
      )
    );

    combineLatest([toObservable(this.focusElement), toObservable(this.step)])
      .pipe(
        takeUntil(this.thisIsDestroyed),
        filter(([e, s]) => !!e && !!s),
        switchMap(([element, step]) => fromEvent(element!, step!.event))
      )
      .subscribe(() => {
        this.ref.tutorial.nextStep();
        if (!this.step()) {
          this.close(true);
        }
      });

    effect(
      () => {
        this.step(); // even though we don't use it, this is how we make the effect dependent on the step
        const overlayRef = this.overlayRef;
        overlayRef?.detach();
        overlayRef?.dispose();
        this.animating.set(true);
        setTimeout(() => this.createOverlay(), 750);
      },
      { allowSignalWrites: true }
    );
  }

  createOverlay() {
    const step = this.step();
    const positionStrategy = this.positionStrategy();
    const element = this.focusElement();
    if (!step || !positionStrategy) {
      return;
    }

    if (positionStrategy instanceof FlexibleConnectedPositionStrategy) {
      positionStrategy.positionChanges
        .pipe(takeUntil(this.thisIsDestroyed))
        .subscribe((x) => {
          this.zone.run(() => this.position.set(x.connectionPair));
        });
    }

    const overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
    });

    const zIndex = this.options.overlayZIndex;
    if (zIndex !== undefined) {
      const globalOverlayWrapper = overlayRef.hostElement;
      globalOverlayWrapper.style.setProperty('z-index', zIndex.toString());
    }

    const overlayComponent = new TemplatePortal(
      this.instructions,
      this.viewContainerRef
    );
    overlayRef.attach(overlayComponent);
    this.overlayRef = overlayRef;
    this.animating.set(false);
  }

  previous() {
    this.ref.tutorial.previousStep();
  }
  next() {
    this.ref.tutorial.nextStep();
    if (!this.step()) {
      this.close(true);
    }
  }
  skip() {
    this.close(false);
  }
  close(result = false) {
    this.ref.close(result);
  }
}
