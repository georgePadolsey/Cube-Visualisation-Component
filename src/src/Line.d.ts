import * as T from 'three';
import { LineEmitter } from '~utils/sineEmitMaker';
/**
 * Container object for a line function with color
 */
export declare class Line {
    emitter: LineEmitter;
    color: T.Color;
    constructor(emitter: LineEmitter, color?: T.Color);
}
