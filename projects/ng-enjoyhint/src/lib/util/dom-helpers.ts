export class Elements {
  get appRoot() {
    return document.querySelector<HTMLElement>('[ng-version]');
  }
  get body() {
    return document.body;
  }
}

export function provideWindow() {
  return { provide: Window, useValue: window };
}
