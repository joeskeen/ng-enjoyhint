import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ContentChild,
  Input,
  TemplateRef,
  computed,
  signal,
} from '@angular/core';

type TemplateWithContext = { template: TemplateRef<unknown>; context: unknown };
type TextOrTemplateValue =
  | string
  | TemplateRef<unknown>
  | TemplateWithContext
  | undefined;

@Component({
  selector: 'lib-text-or-template',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @if (templateValue(); as template) {
    <ng-container
      *ngTemplateOutlet="template.template; context: template.context"
    ></ng-container>
    } @else if (stringValue() && defaultTextTemplate) {
    <ng-container
      *ngTemplateOutlet="
        defaultTextTemplate;
        context: { $implicit: stringValue() }
      "
    ></ng-container>
    } @else if (stringValue()) {
    <span>{{ stringValue() }}</span>
    }
  `,
  styles: ``,
})
export class TextOrTemplateComponent {
  private readonly _value = signal<TextOrTemplateValue>(undefined);
  @Input()
  public get value(): TextOrTemplateValue {
    return this._value();
  }
  public set value(value: TextOrTemplateValue) {
    this._value.set(value);
  }

  @ContentChild(TemplateRef)
  defaultTextTemplate?: TemplateRef<{ $implicit: string | undefined }>;

  readonly stringValue = computed<string | undefined>(() => {
    const value = this._value();
    return typeof value === 'string' ? value : undefined;
  });
  readonly templateValue = computed<TemplateWithContext | undefined>(() => {
    const value = this._value();
    if (value instanceof TemplateRef) {
      return { template: value, context: { $implicit: undefined } };
    }
    if (value instanceof Object && value.template instanceof TemplateRef) {
      return { template: value.template, context: value.context };
    }
    return undefined;
  });
}
