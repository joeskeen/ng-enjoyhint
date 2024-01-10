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
