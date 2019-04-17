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
 * @param magn scalar | array of max magnitude of the sine function in that dimension (e.g. if magn[0] = 1, max |f(x)| = 1)
 * If a scalar is used it repeats the value for all dimensions.
 * @param multX scalar | array of scalars to multiply the displacement of the sine wave. (For 3d: [x,y,z])
 * If a scalar is used it repeats the value for all dimensions.
 * @param multT scalar | array of scalars to multiply the time displacement of the sine wave. (For 3d: [x,y,z])
 * If a scalar is used it repeats the value for all dimensions.
 * @param insideConsts scalar | array of scalars to add inside the sine parameter.
 * If a scalar is used it repeats the value for all dimensions.
 * @param outsideConsts scalar | array of scalars to add outside the sine parameter.
 * If a scalar is used it repeats the value for all dimensions.
 * @param dims optional - amount of dimensions (default:3)
 */
export function sineEmitMaker(
  magn: number | number[],
  multX: number | number[],
  multT: number | number[],
  insideConsts: number | number[],
  outsideConsts: number | number[] = 0,
  dims = 3
): (x: number, t: number) => number[] {

  let sin = Math.sin;

  /**
   * If it is a constant, repeat it for all values of the array
   */
  let magnA = Array.isArray(magn) ? magn : Array(dims).fill(magn);
  let multXA = Array.isArray(multX) ? multX : Array(dims).fill(multX);
  let multTA = Array.isArray(multT) ? multT : Array(dims).fill(multT);
  let insideConstsA = Array.isArray(insideConsts) ? insideConsts : Array(dims).fill(insideConsts);
  let outsideConstsA = Array.isArray(outsideConsts) ? outsideConsts : Array(dims).fill(outsideConsts);


  /**
   * We are checking the length of the dimensions at runtime.
   * This is unfortunate as it would be great to see if this could be achieved
   * statically by TypeScript. Though I believe, if it was possible, it would
   * be far more complex then this simple runtime check which is only run once.
   */
  [magnA.length, multXA.length, multTA.length, insideConstsA.length, outsideConstsA.length].forEach((x, i) => {
    if (x !== dims) {
      throw new Error(`Invalid dimensions on argument ${i}.`);
    }
  });

  if (dims <= 0) {
    throw new Error('You can\'t have 0 or negative dimensions!')
  }

  /** Emitter Function */
  return (x: number[] | number, t: number) => {
    let xA = Array.isArray(x) ? x : Array(dims).fill(x);
    let emittedArgs = [];
    // for each dimension - generate the sine wave
    for (var dimI = 0; dimI < dims; dimI++) {
      emittedArgs.push(magnA[dimI] * sin(multXA[dimI] * xA[dimI] + multTA[dimI] * t + insideConstsA[dimI]) + outsideConstsA[dimI])
    }

    return emittedArgs;
  };
}

