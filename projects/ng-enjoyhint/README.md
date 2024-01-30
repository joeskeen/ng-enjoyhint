# Ng-EnjoyHint

**EnjoyHint** is a web-tool that provides the simplest way to create interactive tutorials and hints for your site or web-application. It can also be used to highlight and sign application elements.

**Ng-EnjoyHint** is an rewrite of EnjoyHint that removes jQuery and brings a native Angular experience.

## Installation

```bash
npm install ng-enjoyhint
```

## Usage

- Inject the `NgEnjoyHintService` into your component.
  ```ts
  private readonly enjoyHintService = inject(NgEnjoyHintService);
  ```
- Call `runTutorial()` to run the tutorial.
  ```ts
  await this.enjoyHintService.runTutorial(
    [
      {
        selector: ".my-element",
        event: "click",
        description: "Click on this element",
      },
      {
        selector: ".my-other-element",
        event: "click",
        description: "Now click over here",
      },
    ]
  );
  ```

## How it works

When running a tutorial, an overlay is added to the page. Four semi-transparent elements, one on each side of the target element, de-emphasize
the rest of the page and block user input. A description is shown on the side of the target element. The user can complete the configured event
(normally a click) on the target element to advance to the next step of the tutorial. When the last step is completed, the overlay is removed.

## License

MIT

## API

### Contents

- [Classes](README.md#classes)
    - [EnjoyHintService](README.md#EnjoyHintService)
- [Interfaces](README.md#interfaces)
    - [IButtonOptions](README.md#IButtonOptions)
    - [IEnjoyHintOptions](README.md#IEnjoyHintOptions)
    - [ITemplateWithContext](README.md#ITemplateWithContextT)
    - [ITutorialStep](README.md#ITutorialStep)

<a id="EnjoyHintService" name="EnjoyHintService"></a>

### EnjoyHintService

#### Methods

<a id="runTutorial" name="runTutorial"></a>

##### runTutorial()

> **runTutorial**(`steps`, `options`?): `Promise`\<`boolean`\>

Run an interactive tutorial

###### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `steps` | [`ITutorialStep`](README.md#ITutorialStep)[] | the tutorial steps to run |
| `options`? | `Partial`\<[`IEnjoyHintOptions`](README.md#IEnjoyHintOptions)\> | optional object to override the default behavior |

###### Returns

`Promise`\<`boolean`\>

a promise resolving when the tutorial is closed; resolves to `true` if the tutorial was completed, `false` if it was skipped

###### Source

[lib/enjoyhint.service.ts:35](https://github.com/joeskeen/ng-enjoyhint/blob/8fa5134/projects/ng-enjoyhint/src/lib/enjoyhint.service.ts#L35)

***

<a id="IButtonOptions" name="IButtonOptions"></a>

### IButtonOptions

Custom settings for a tutorial button

#### Properties

| Property | Type | Description |
| :------ | :------ | :------ |
| <a id="className" name="className"></a> `className?` | `string` | Custom CSS class to apply to the button |
| <a id="text" name="text"></a> `text` | `string` | Text to display on the button |

***

<a id="IEnjoyHintOptions" name="IEnjoyHintOptions"></a>

### IEnjoyHintOptions

#### Properties

| Property | Type | Description |
| :------ | :------ | :------ |
| <a id="backdropColor" name="backdropColor"></a> `backdropColor` | `string` | Color of the backdrop overlay. Accepts any valid CSS color value.<br /><br />**Default**<br />` 'black' ` |
| <a id="backdropOpacity" name="backdropOpacity"></a> `backdropOpacity` | `number` | Opacity of the backdrop overlay. Higher values makes text more readable.<br /><br />**Default**<br />` 0.75 ` |
| <a id="fontFamily" name="fontFamily"></a> `fontFamily` | `string` | Font family to use for the tutorial text and buttons.<br /><br />**Default**<br />` 'sans-serif' ` |
| <a id="foregroundColor" name="foregroundColor"></a> `foregroundColor` | `string` | Color of text and arrow elements.<br /><br />**Default**<br />` 'white' ` |
| <a id="nextButton" name="nextButton"></a> `nextButton` | [`IButtonOptions`](README.md#IButtonOptions) | Custom settings for the "Next" button.<br /><br />**Default**<br />` { text: 'Next' } ` |
| <a id="overlayZIndex" name="overlayZIndex"></a> `overlayZIndex?` | `number` | Z-index of the backdrop.<br /><br />**Default**<br />` 1000 (from @angular/cdk/overlay) ` |
| <a id="padding" name="padding"></a> `padding` | `number` | Amount of space between the edge of the current step's target element and the backdrop (in pixels)<br /><br />**Default**<br />` 5 ` |
| <a id="previousButton" name="previousButton"></a> `previousButton` | [`IButtonOptions`](README.md#IButtonOptions) | Custom settings for the "Previous" button.<br /><br />**Default**<br />` { text: 'Previous' } ` |
| <a id="skipButton" name="skipButton"></a> `skipButton` | [`IButtonOptions`](README.md#IButtonOptions) | Custom settings for the "Skip" button.<br /><br />**Default**<br />` { text: 'Skip' } ` |

***

<a id="ITemplateWithContextT" name="ITemplateWithContextT"></a>

### ITemplateWithContext\<T\>

#### Type parameters

| Type parameter | Value |
| :------ | :------ |
| `T` | `unknown` |

#### Properties

| Property | Type |
| :------ | :------ |
| <a id="context" name="context"></a> `context` | `T` |
| <a id="template" name="template"></a> `template` | `TemplateRef`\<`T`\> |

***

<a id="ITutorialStep" name="ITutorialStep"></a>

### ITutorialStep

#### Properties

| Property | Type | Description |
| :------ | :------ | :------ |
| <a id="description" name="description"></a> `description` | `string` \| `TemplateRef`\<`any`\> | The main instructions for the step. Keep this short. |
| <a id="details" name="details"></a> `details?` | `string` \| `TemplateRef`\<`any`\> \| [`ITemplateWithContext`](README.md#ITemplateWithContextT)\<`unknown`\> | Additional text displayed in a smaller font under the description. <br />May be longer (but not too long). |
| <a id="event" name="event"></a> `event` | `string` | The event to listen for on the element to move onto the next step.<br />Accepts any valid DOM event name, or 'next' to move on when the "Next" button is clicked. |
| <a id="hideSkip" name="hideSkip"></a> `hideSkip?` | `boolean` | Whether or not to hide the "Skip" button.<br /><br />**Default**<br />` false ` |
| <a id="nextButton-1" name="nextButton-1"></a> `nextButton?` | [`IButtonOptions`](README.md#IButtonOptions) | Custom settings for the "Next" button. |
| <a id="previousButton-1" name="previousButton-1"></a> `previousButton?` | [`IButtonOptions`](README.md#IButtonOptions) | Custom settings for the "Previous" button. |
| <a id="selector" name="selector"></a> `selector?` | `string` | The CSS selector for the element to focus on. If not specified, the <br />provided instructions will display in the center of the screen. |
| <a id="skipButton-1" name="skipButton-1"></a> `skipButton?` | [`IButtonOptions`](README.md#IButtonOptions) | Custom settings for the "Skip" button. |
| <a id="stepEnd" name="stepEnd"></a> `stepEnd?` | () => `void` | Callback to execute when the step is ended. |
| <a id="stepStart" name="stepStart"></a> `stepStart?` | () => `void` | Callback to execute when the step is started. |

***

Generated using [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown) and [TypeDoc](https://typedoc.org/)
