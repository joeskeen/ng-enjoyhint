import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-force-field',
  standalone: true,
  template: ``,
  host: {
    '[style.width]': 'size.width + "px"',
    '[style.height]': 'size.height + "px"',
    '[style.minWidth]': 'size.width + "px"',
    '[style.minHeight]': 'size.height + "px"',
    '[style.maxWidth]': 'size.width + "px"',
    '[style.maxHeight]': 'size.height + "px"',
    '[style.top]': 'position.y + "px"',
    '[style.left]': 'position.x + "px"',
  },
  styles: [
    `
      :host {
        display: block;
        position: fixed;
        transition: top 500ms ease-in-out, left 500ms ease-in-out;
      }
    `,
  ],
})
export class ForceFieldComponent {
  @Input() size!: { width: number; height: number; };
  @Input() position!: { x: number; y: number; };
}
