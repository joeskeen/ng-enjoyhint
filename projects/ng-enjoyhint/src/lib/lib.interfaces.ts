import { TemplateRef } from "@angular/core";

export interface IEnjoyHintOptions {
  padding: number;
  fontFamily: string;
  backdropColor: string;
  overlayZIndex: number;
}

export interface ITutorialStep {
  event: string;
  description: string | TemplateRef<any>;
  selector?: string;
  details?: string | TemplateRef<any>;
  nextButton?: {
    text: string;
    className?: string;
  };
  skipButton?: {
    text: string;
    className?: string;
  };
  previousButton?: {
    text: string;
    className?: string;
  };
  hideSkip?: boolean;
}
