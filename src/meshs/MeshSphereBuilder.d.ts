import * as T from 'three';
import { ScalableSphereMesh } from './ScalableSphereMesh';
/**
 * Opinionated - MeshSphereBuilder
 */
declare class MeshSphereBuilder {
    position: T.Vector3;
    radius: number;
    edges: number;
    color: T.Color;
    opacity: number;
    withX(x: number): this;
    withY(y: number): this;
    withZ(z: number): this;
    withRadius(radius: number): this;
    withColor(color: T.Color): this;
    withEdges(edges: number): this;
    withOpacity(opacity: number): this;
    build(): ScalableSphereMesh;
}
export { MeshSphereBuilder };
