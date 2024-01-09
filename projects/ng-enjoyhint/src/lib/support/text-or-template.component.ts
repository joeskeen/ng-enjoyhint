import { NgTemplateOutlet } from "@angular/common";
import { Component, ContentChild, Input, TemplateRef, computed, signal } from "@angular/core";

@Component({
    selector: 'lib-text-or-template',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (templateValue(); as template) {
            <ng-container *ngTemplateOutlet="template"></ng-container>
        } @else if (stringValue() && defaultTextTemplate) {
            <ng-container *ngTemplateOutlet="defaultTextTemplate; context: {$implicit: stringValue()}"></ng-container>
        } @else if (stringValue()) {
            <span>{{stringValue()}}</span>
        }
    `,
    styles: ``
})
export class TextOrTemplateComponent {
    private readonly _value = signal<string | TemplateRef<any> | undefined>(undefined);
    @Input()
    public get value(): string | TemplateRef<any> | undefined {
        return this._value();
    }
    public set value(value: string | TemplateRef<any> | undefined) {
        this._value.set(value);
    }

    @ContentChild(TemplateRef)
    defaultTextTemplate?: TemplateRef<any>;

    readonly stringValue = computed<string | undefined>(() => {
        const value = this._value();
        return typeof value === 'string' ? value : undefined
    });
    readonly templateValue = computed<TemplateRef<any> | undefined>(() => {
        const value = this._value();
        return value instanceof TemplateRef ? value : undefined;
    });
}