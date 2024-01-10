import { AfterViewInit, Component, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { EnjoyHintService } from 'ng-enjoyhint';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: ``,
  styles: `
    :host {
      width: 100%;
      height: 100%;
    }`,
})
export class AppComponent implements AfterViewInit {
  title = 'ng-enjoyhint';

  constructor(
    private readonly host: ElementRef,
    private readonly enjoyHintService: EnjoyHintService
  ) {}

  async ngAfterViewInit() {
    const elements = this.spawnElements();

    console.info('Starting tutorial...');

    await this.enjoyHintService.runTutorial(
      elements.map((e) => ({
        selector: `#${e.id}`,
        event: 'click',
        description: `Click ${e.id}`,
        stepStart: () => e.style.setProperty('z-index', '10'),
        stepEnd: () => e.style.setProperty('z-index', null),
      }))
    );

    console.info('Tutorial complete!');
  }

  spawnElements() {
    const random = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min)) + min;
    const elementCount = 100;
    const elements = [];

    for (let i = 0; i < elementCount; i++) {
      const element = document.createElement('div');
      element.style.position = 'fixed';
      element.style.top = `${random(0, 100)}vh`;
      element.style.left = `${random(0, 100)}vw`;
      element.style.width = `${random(10, 100)}px`;
      element.style.height = `${random(10, 100)}px`;
      element.style.backgroundColor = `rgb(
          ${random(0, 255)},
          ${random(0, 255)},
          ${random(0, 255)}
        )`;
      element.id = `element-${i}`;
      this.host.nativeElement.appendChild(element);
      elements.push(element);
    }

    return elements;
  }
}
