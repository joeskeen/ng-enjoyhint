import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { Pipe } from '@angular/core';

export type Direction = 'top' | 'bottom' | 'left' | 'right';

export function getDirection(
  position?: ConnectionPositionPair
): Direction | undefined {
  if (!position) {
    return undefined;
  }

  if (position.originX === 'start' && position.originY === 'center') {
    return 'left';
  }

  if (position.originX === 'end' && position.originY === 'center') {
    return 'right';
  }

  if (position.originX === 'center' && position.originY === 'top') {
    return 'top';
  }

  if (position.originX === 'center' && position.originY === 'bottom') {
    return 'bottom';
  }

  console.warn('Unknown position', position);
  return undefined;
}

@Pipe({
  name: 'direction',
  standalone: true,
  pure: true,
})
export class DirectionPipe {
  transform(position?: ConnectionPositionPair): Direction | undefined {
    return getDirection(position);
  }
}
