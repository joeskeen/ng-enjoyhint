import {
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  Signal,
  computed,
  signal,
} from '@angular/core';
import { Direction } from './direction.pipe';

@Component({
  selector: 'lib-arrow',
  standalone: true,
  template: `
    <svg [attr.viewBox]="viewBox()">
      <defs>
        <marker
          id="arrowMarker"
          viewBox="0 0 36 21"
          refX="21"
          refY="10"
          markerUnits="strokeWidth"
          orient="auto"
          markerWidth="16"
          markerHeight="12"
        >
          <path id="polyline" d="M0,0 c30,11 30,9 0,20" />
        </marker>
      </defs>
      <path [attr.d]="pathData()" marker-end="url(#arrowMarker)" />
    </svg>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100px;
    }
    path {
      fill: none;
      stroke: white;
      stroke-width: 2;
    }
  `,
})
export class ArrowComponent implements OnDestroy {
  private readonly _direction = signal<Direction | undefined>(undefined);
  @Input()
  public get direction(): Direction | undefined {
    return this._direction();
  }
  public set direction(value: Direction | undefined) {
    this._direction.set(value);
  }

  private readonly _pointToElement = signal<HTMLElement | null>(null);
  @Input()
  public get pointToElement(): HTMLElement | null {
    return this._pointToElement();
  }
  public set pointToElement(value: HTMLElement | null) {
    this._pointToElement.set(value);
  }

  readonly viewBox = computed(() => {
    const bounds = this.bounds();
    if (!bounds) {
      return `0 0 0 0`;
    }
    return `0 0 ${bounds.width} ${bounds.height}`;
  });

  readonly pathData: Signal<string> = computed(() => {
    const bounds = this.bounds() ?? { x: 0, y: 0, width: 0, height: 0 };
    const absCenterX = bounds.x + bounds.width / 2;
    const absCenterY = bounds.y + bounds.height / 2;

    const padding = 5;
    const minX = padding;
    const minY = padding;
    const maxX = bounds.width - padding;
    const maxY = bounds.height - padding;
    const width = maxX - minX;
    const height = maxY - minY;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const direction = this._direction();
    const pointToElement = this._pointToElement();
    const elementCenterPoint = pointToElement?.getBoundingClientRect() ?? {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
    const elementCenterX = elementCenterPoint.x + elementCenterPoint.width / 2;
    const elementCenterY = elementCenterPoint.y + elementCenterPoint.height / 2;

    const dx = elementCenterX - absCenterX;
    const dy = elementCenterY - absCenterY;

    let fromX = 0,
      fromY = 0,
      toX = 0,
      toY = 0,
      controlPointX = 0,
      controlPointY = 0;

    switch (direction) {
      case 'top':
        fromX = halfWidth;
        fromY = minY;
        toX = halfWidth + dx;
        toY = maxY;
        controlPointX = halfWidth;
        controlPointY = halfHeight;
        break;
      case 'bottom':
        fromX = halfWidth;
        fromY = maxY;
        toX = halfWidth + dx;
        toY = minY;
        controlPointX = halfWidth;
        controlPointY = halfHeight;
        break;
      case 'left':
        fromX = halfWidth;
        fromY = minY;
        toX = maxX;
        toY = halfHeight + dy;
        controlPointX = halfWidth;
        controlPointY = halfHeight;
        break;
      case 'right':
        fromX = halfWidth;
        fromY = minY;
        toX = minX;
        toY = halfHeight + dy;
        controlPointX = halfWidth;
        controlPointY = halfHeight;
        break;
    }

    toX = Math.max(minX, Math.min(maxX, toX));
    toY = Math.max(minY, Math.min(maxY, toY));

    return `M${fromX},${fromY} Q${controlPointX},${controlPointY} ${toX},${toY}`;
  });

  private readonly bounds = signal<DOMRect | undefined>(undefined);
  private readonly resizeObserver: ResizeObserver;

  constructor(private readonly host: ElementRef<SVGElement>, zone: NgZone) {
    const observer = new ResizeObserver(() => {
      zone.run(() => {
        this.bounds.set(host.nativeElement.getBoundingClientRect());
      });
    });
    observer.observe(host.nativeElement);
    this.resizeObserver = observer;
  }

  ngOnDestroy() {
    this.resizeObserver.unobserve(this.host.nativeElement);
    this.resizeObserver.disconnect();
  }
}
