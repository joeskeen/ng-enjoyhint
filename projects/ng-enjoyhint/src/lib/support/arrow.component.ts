import { Component, Input, computed, signal } from '@angular/core';
import { Direction } from './direction.pipe';

@Component({
  selector: 'lib-arrow',
  standalone: true,
  template: `
    <svg viewBox="-10 -10 110 110">
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
      width: 100px;
      height: 100px;
    }
    path {
      fill: none;
      stroke: white;
      stroke-width: 2;
    }
  `,
})
export class ArrowComponent {
  private readonly _direction = signal<Direction | undefined>(undefined);
  @Input()
  public get direction(): Direction | undefined {
    return this._direction();
  }
  public set direction(value: Direction | undefined) {
    this._direction.set(value);
  }

  readonly pathData = computed(() => {
    const direction = this._direction();

    let fromX = 0,
      fromY = 0,
      toX = 0,
      toY = 0,
      controlPointX = 0,
      controlPointY = 0;

    switch (direction) {
      case 'top':
        fromX = 50;
        fromY = 0;
        toX = 50;
        toY = 100;
        controlPointX = 50;
        controlPointY = 50;
        break;
      case 'bottom':
        fromX = 50;
        fromY = 100;
        toX = 50;
        toY = 0;
        controlPointX = 50;
        controlPointY = 50;
        break;
      case 'left':
        fromX = 0;
        fromY = 0;
        toX = 100;
        toY = 50;
        controlPointX = 0;
        controlPointY = 50;
        break;
      case 'right':
        fromX = 100;
        fromY = 0;
        toX = 0;
        toY = 50;
        controlPointX = 100;
        controlPointY = 50;
        break;
    }

    return `M${fromX},${fromY} Q${controlPointX},${controlPointY} ${toX},${toY}`;
  });
}
