import {isArray} from 'lodash';

// cache math sin function as is used a lot (+ more convenient)
const sin = Math.sin;

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
export function sineEmitMaker(
    magn: number|number[], multX: number|number[], multT: number|number[],
    insideConsts: number|number[], outsideConsts: number|number[] = 0,
    dims = 3): (x: number, t: number) => number[] {
  /**
   * If it is a constant, repeat it for all values of the array
   */
  const magnA = isArray(magn) ? magn : new Array(dims).fill(magn);
  const multXA = isArray(multX) ? multX : new Array(dims).fill(multX);
  const multTA = isArray(multT) ? multT : new Array(dims).fill(multT);
  const insideConstsA =
      isArray(insideConsts) ? insideConsts : new Array(dims).fill(insideConsts);
  const outsideConstsA = isArray(outsideConsts) ?
      outsideConsts :
      new Array(dims).fill(outsideConsts);


  /**
   * We are checking the length of the dimensions at runtime.
   * This is unfortunate as it would be great to see if this could be achieved
   * statically by TypeScript. Though I believe, if it was possible, it would
   * be far more complex then this simple runtime check which is only run once.
   */
  [magnA.length, multXA.length, multTA.length, insideConstsA.length,
   outsideConstsA.length]
      .forEach((x, i) => {
        if (x !== dims) {
          throw new Error(`Invalid dimensions on argument ${i}.`);
        }
      });

  if (dims <= 0) {
    throw new Error('You can\'t have 0 or negative dimensions!');
  }

  // Emitter Function
  return (x: number[]|number, t: number) => {
    const xA = isArray(x) ? x : new Array(dims).fill(x);
    const emittedArgs = [];
    // for each dimension - generate the 3d sine wave
    for (let dimI = 0; dimI < dims; dimI++) {
      emittedArgs.push(
          magnA[dimI] *
              sin(multXA[dimI] * xA[dimI] + multTA[dimI] * t +
                  insideConstsA[dimI]) +
          outsideConstsA[dimI]);
    }

    return emittedArgs;
  };
}
