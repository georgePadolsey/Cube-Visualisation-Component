import * as T from 'three';
import {LineEmitter} from '~utils/sineF';

/**
 * Container object for a line function with color
 */
export class Line {
  emitter: LineEmitter;
  color: T.Color = new T.Color('white');

  constructor(emitter: LineEmitter, color?: T.Color) {
    this.emitter = emitter;
    if (color) {
      this.color = color;
    }
  }
}