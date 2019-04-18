/**
 * Utility function to iterate through all vertices in a cube.
 * For every vertex it calls the function passed in with (x,y,z)
 * coordinates.
 *
 * @param expr function to be called of form f(x,y,z) for each vertex
 * @param length length of side of cube
 */
export declare function iterateCube(expr: (x: number, y: number, z: number) => void, length: number): void;
