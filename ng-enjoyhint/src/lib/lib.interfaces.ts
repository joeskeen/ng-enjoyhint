import { TemplateRef } from '@angular/core';

export interface IEnjoyHintOptions {
  /**
   * Amount of space between the edge of the current step's target element and the backdrop (in pixels)
   * @default 5
   */
  padding: number;
  /**
   * Font family to use for the tutorial text and buttons.
   * @default 'sans-serif'
   */
  fontFamily: string;
  /**
   * Color of the backdrop overlay. Accepts any valid CSS color value.
   * @default 'black'
   */
  backdropColor: string;
  /**
   * Opacity of the backdrop overlay. Higher values makes text more readable.
   * @default 0.75
   */
  backdropOpacity: number;
  /**
   * Color of text and arrow elements.
   * @default 'white'
   */
  foregroundColor: string;
  /**
   * Custom settings for the "Next" button.
   * @default { text: 'Next' }
   */
  nextButton: IButtonOptions;
  /**
   * Custom settings for the "Skip" button.
   * @default { text: 'Skip' }
   */
  skipButton: IButtonOptions;
  /** 
   * Custom settings for the "Previous" button.
   * @default { text: 'Previous' }
   */
  previousButton: IButtonOptions;
  /**
   * Z-index of the backdrop.
   * @default 1000 (from @angular/cdk/overlay)
   */
  overlayZIndex?: number;
}

export interface ITutorialStep {
  /**
   * The event to listen for on the element to move onto the next step.
   * Accepts any valid DOM event name, or 'next' to move on when the "Next" button is clicked.
   */
  event: string;
  /**
   * The main instructions for the step. Keep this short.
   */
  description: string | TemplateRef<any>;
  /**
   * The CSS selector for the element to focus on. If not specified, the 
   * provided instructions will display in the center of the screen.
   */
  selector?: string;
  /**
   * Additional text displayed in a smaller font under the description. 
   * May be longer (but not too long).
   */
  details?: string | TemplateRef<any> | ITemplateWithContext;
  /**
   * Custom settings for the "Next" button.
   */
  nextButton?: IButtonOptions;
  /**
   * Custom settings for the "Skip" button.
   */
  skipButton?: IButtonOptions;
  /** 
   * Custom settings for the "Previous" button.
   */
  previousButton?: IButtonOptions;
  /**
   * Whether or not to hide the "Skip" button.
   * @default false
   */
  hideSkip?: boolean;
  /**
   * Whether or not to hide the "Previous" button.
   * @default false
   */
  hidePrevious?: boolean;
  /**
   * Callback to execute when the step is started.
   */
  stepStart?: () => Promise<void> | void;
  /**
   * Callback to execute when the step is ended.
   */
  stepEnd?: () => Promise<void> | void;
}

export interface ITemplateWithContext<T = unknown> {
  template: TemplateRef<T>; 
  context: T;
}

/** Custom settings for a tutorial button */
export interface IButtonOptions {
  /** Text to display on the button */
  text: string;
  /** Custom CSS class to apply to the button */
  className?: string;
}
