import {
  Component,
  DestroyRef,
  HostBinding,
  NgZone,
  Signal,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  WritableSignal,
  computed,
  effect,
  signal,
} from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { IEnjoyHintOptions, ITutorialStep } from '../lib.interfaces';
import { EnjoyHintRef } from '../support/EnjoyHintRef';
import {
  Observable,
  combineLatest,
  filter,
  from,
  fromEvent,
  map,
  pairwise,
  switchMap,
  startWith,
} from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import {
  ConnectionPositionPair,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayPositionBuilder,
  OverlayRef,
  PositionStrategy,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgClass } from '@angular/common';
import { debounceTime, first, takeUntil } from 'rxjs/operators';
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
  providers: [provideWindow()],
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
  readonly ffSize = computed(() => ({
    width: this.viewSize().width + this.options.padding,
    height: this.viewSize().height + this.options.padding,
  }));
  readonly instructionsWidth = computed(() => this.viewSize().width / 4);
  readonly animating = signal(false);
  readonly focusElement = computed(() => {
    const step = this.step();
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
        y: -1 * this.options.padding,
      },
      right: {
        x: bounds.x + bounds.width,
        y: -1 * this.options.padding,
      },
      top: {
        x: -1 * this.options.padding,
        y: -1 * size.height + bounds.y - this.options.padding,
      },
      bottom: {
        x: -1 * this.options.padding,
        y: bounds.y + bounds.height,
      },
    };
  });
  readonly step: Signal<ITutorialStep | undefined>;
  readonly options: IEnjoyHintOptions;

  private overlayRef: OverlayRef | null = null;
  readonly positionStrategy: Signal<PositionStrategy> = computed(() => {
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
  readonly position: WritableSignal<ConnectionPositionPair | undefined> =
    signal(undefined);
  thisIsDestroyed: Observable<void>;
  /**
   * instead of doing actual padding around the focus element (which would allow clicks)
   * outside of the focus element), we'll add some glow around wht focus element but still
   * on the force field
   *
   * white must be used as anything semi-transparent or transparent will not show up
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow#length
   */
  readonly focusElementHighlight = computed(() => {
    const padding = this.options.padding;
    const boxShadow = `0 0 ${padding / 2}px ${padding}px white`;
    return boxShadow;
  });

  constructor(
    public readonly ref: EnjoyHintRef,
    window: Window,
    private readonly overlayPositionBuilder: OverlayPositionBuilder,
    private readonly overlay: Overlay,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly destroyedRef: DestroyRef,
    private readonly zone: NgZone
  ) {
    // Consider both the current and previous steps with transitioning state
    // The new step is only effective once it is no longer transitioning
    const step$ = combineLatest([
      toObservable(this.ref.tutorial.step).pipe(
        startWith(undefined),
        pairwise()
      ),
      toObservable(this.ref.tutorial.transitioning)
    ]).pipe(
      debounceTime(50), // since both start and end hooks set this, make sure it's done with all transitioning
      map(([[prev, curr], transition]) => {
        if (transition === 'start') {
          return prev;
        }
        return curr;
      })
    );

    // Convert back to a signal
    this.step = toSignal(step$, { initialValue: undefined });

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
        switchMap(([element, step]) =>
          fromEvent(element!, step!.event).pipe(
            filter(() => !this.animating()),
            first()
          )
        )
      )
      .subscribe(async () => {
        await this.ref.tutorial.nextStep();
        if (!this.step()) {
          this.close(true);
        }
      });

    effect(
      () => {
        const currentStep = this.step(); // even though we don't use it, this is how we make the effect dependent on the step
        if (!currentStep) {
          return;
        }
        console.log({ currentStep });
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
    console.log('creating overlay...');
    const step = this.step();
    const positionStrategy = this.positionStrategy();
    this.focusElement();
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

    this.overlayRef?.detach();
    this.overlayRef?.dispose();
    this.overlayRef = null;
    
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

  previous(event: Event) {
    this.eventBlackHole(event);

    this.ref.tutorial.previousStep();
  }

  async next(event: Event) {
    this.eventBlackHole(event);

    await this.ref.tutorial.nextStep();
    if (!this.step()) {
      this.close(true);
    }
  }
  skip(event: Event) {
    this.eventBlackHole(event);

    this.close(false);
  }
  close(result = false) {
    this.ref.close(result);
  }

  eventBlackHole(event: Event) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();
  }
}
