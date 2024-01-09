import { ConnectedPosition } from "@angular/cdk/overlay";

export const rightCenter: ConnectedPosition = {
  // right center
  originX: 'end',
  overlayX: 'start',
  originY: 'center',
  overlayY: 'center',
};
export const rightTop: ConnectedPosition = {
  // right top
  originX: 'end',
  overlayX: 'start',
  originY: 'top',
  overlayY: 'bottom',
};
export const rightBottom: ConnectedPosition = {
  // right bottom
  originX: 'end',
  overlayX: 'start',
  originY: 'bottom',
  overlayY: 'top',
};
export const leftCenter: ConnectedPosition = {
  // left center
  originX: 'start',
  overlayX: 'end',
  originY: 'center',
  overlayY: 'center',
};
export const leftTop: ConnectedPosition = {
  // left top
  originX: 'start',
  overlayX: 'end',
  originY: 'top',
  overlayY: 'bottom',
};
export const leftBottom: ConnectedPosition = {
  // left bottom
  originX: 'start',
  overlayX: 'end',
  originY: 'bottom',
  overlayY: 'top',
};
export const topCenter: ConnectedPosition = {
  // top center
  originX: 'center',
  overlayX: 'center',
  originY: 'top',
  overlayY: 'bottom',
};
export const bottomCenter: ConnectedPosition = {
  // bottom center
  originX: 'center',
  overlayX: 'center',
  originY: 'bottom',
  overlayY: 'top',
};

export const ALL_POSITIONS = [
  rightCenter,
  rightTop,
  rightBottom,
  leftCenter,
  leftTop,
  leftBottom,
  topCenter,
  bottomCenter,
];

export const ALL_SIDES = [rightCenter, leftCenter, topCenter, bottomCenter];
