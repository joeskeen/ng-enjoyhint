import { EventEmitter } from '@angular/core';
import { Tutorial } from './Tutorial';
import { IEnjoyHintOptions } from '../lib.interfaces';

export class EnjoyHintRef {
  constructor(public readonly tutorial: Tutorial, public readonly options: Partial<IEnjoyHintOptions> = {}) { }

  readonly onClose = new EventEmitter<boolean>();

  close(completed = false) {
    this.onClose.emit(completed);
  }
}
