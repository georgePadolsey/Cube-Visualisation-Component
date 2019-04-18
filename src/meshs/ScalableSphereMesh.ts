import * as T from 'three';

/**
 * Normal sphere mesh (or general mesh) which has a sclaring variable
 */
class ScalableSphereMesh extends T.Mesh {
  currentScale = 1;
}
export {ScalableSphereMesh};