import { AfterViewInit, Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { EnjoyHintService, ITemplateWithContext } from 'ng-enjoyhint';

type MyTemplateContext = { myValue: {foo: string} };

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, JsonPipe],
  template: `
    <ng-template #template1><span class="templateValue">Details is an ng-template</span></ng-template>
    <ng-template #template2 let-myValue="myValue"><div class="templateValue">Details is an ng-template with custom context: <pre><code>{{myValue | json}}</code></pre></div></ng-template>
  `,
  styles: `
    :host {
      width: 100%;
      height: 100%;
    }
    .templateValue {
      background-color: rgba(255, 255, 255, 0.5);
      padding: 1rem;
    }`,
})
export class AppComponent implements AfterViewInit {
  title = 'ng-enjoyhint';

  @ViewChild('template1', { static: true, read: TemplateRef })
  template1!: TemplateRef<never>;
  
  @ViewChild('template2', { static: true, read: TemplateRef })
  template2!: TemplateRef<MyTemplateContext>;

  constructor(
    private readonly host: ElementRef,
    private readonly enjoyHintService: EnjoyHintService
  ) {}

  async ngAfterViewInit() {
    const elements = this.spawnElements();

    console.info('Starting tutorial...');

    const toStep = (element: HTMLElement) => ({
      selector: `#${element.id}`,
      event: 'click',
      description: `Click ${element.id}`,
      stepStart: () => element.style.setProperty('z-index', '10'),
      stepEnd: () => element.style.setProperty('z-index', null),
    });

    await this.enjoyHintService.runTutorial([
      {
        ...toStep(elements[0]),
        details: 'Details is a string',
      },
      {
        ...toStep(elements[1]),
        details: this.template1,
      },
      {
        ...toStep(elements[2]),
        details: {template: this.template2, context: { myValue: {foo: 'bar'}}} as ITemplateWithContext<MyTemplateContext>,
      },
      {
        description: 'Steps can have asynchronous start and end hooks',
        event: 'click',
        selector: `#dynamic-element`,
        stepStart: async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const dynamicElement = document.createElement('div');
          dynamicElement.id = 'dynamic-element';
          dynamicElement.style.position = 'fixed';
          dynamicElement.style.top = '50%';
          dynamicElement.style.left = '50%';
          dynamicElement.style.transform = 'translate(-50%, -50%)';
          dynamicElement.style.width = '200px';
          dynamicElement.style.height = '200px';
          dynamicElement.style.backgroundColor = 'red';
          dynamicElement.style.transition = 'opacity 1s';
          dynamicElement.style.opacity = '0';
          document.body.appendChild(dynamicElement);
          await new Promise(resolve => setTimeout(resolve, 50));
          dynamicElement.style.opacity = '1';
          await new Promise(resolve => setTimeout(resolve, 1000));
        },
        stepEnd: async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const dynamicElement = document.querySelector<HTMLElement>('#dynamic-element');
          if (!dynamicElement) return;

          dynamicElement.style.opacity = '0';
          await new Promise(resolve => setTimeout(resolve, 1000));
          dynamicElement?.remove();
        }
      },
      ...elements.slice(3).map(toStep)
    ]
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
