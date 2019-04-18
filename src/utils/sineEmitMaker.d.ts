export interface LineEmitter {
    (x: number, t: number): number[];
}
/**
 * Returns an emitter which outputs this custom nd-sine function equivalent to:
 *
 * [
 *  floor(magn * sin( multX[0] * x + multT[0] * t + c_i[0])),
 *  floor(magn * sin( multX[1] * x + multT[1] * t + c_i[1])),
 *  floor(magn * sin( multX[2] * x + multT[2] * t + c_i[2])),
 *  ... for how many dimensions (default 3)
 * ]
 *
 * @param magn scalar | array of max magnitude of the sine function in that
 * dimension (e.g. if magn[0] = 1, max |f(x)| = 1) If a scalar is used it
 * repeats the value for all dimensions.
 * @param multX scalar | array of scalars to multiply the displacement of the
 * sine wave. (For 3d: [x,y,z]) If a scalar is used it repeats the value for all
 * dimensions.
 * @param multT scalar | array of scalars to multiply the time displacement of
 * the sine wave. (For 3d: [x,y,z]) If a scalar is used it repeats the value for
 * all dimensions.
 * @param insideConsts scalar | array of scalars to add inside the sine
 * parameter. If a scalar is used it repeats the value for all dimensions.
 * @param outsideConsts scalar | array of scalars to add outside the sine
 * parameter. If a scalar is used it repeats the value for all dimensions.
 * @param dims optional - amount of dimensions (default:3)
 *
 * @throws when dims < 0 OR not all arrays passed in have same length
 */
export declare function sineEmitMaker(magn: number | number[], multX: number | number[], multT: number | number[], insideConsts: number | number[], outsideConsts?: number | number[], dims?: number): LineEmitter;
