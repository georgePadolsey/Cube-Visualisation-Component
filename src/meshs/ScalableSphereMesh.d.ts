import * as T from 'three';
/**
 * Normal sphere mesh (or general mesh) which has a sclaring variable
 */
declare class ScalableSphereMesh extends T.Mesh {
    currentScale: number;
}
export { ScalableSphereMesh };
