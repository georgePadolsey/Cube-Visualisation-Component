import * as T from 'three';
/**
 * Opinionated-Builder utility class to make MeshLines
 * from line Geometry
 *
 * @example ```new MeshLineBuilder()
 *              .withResolution(res)
 *              .withCamera(camera)
 *              .withColor(color)
 *              .withLineGeometry(geometry)
 *              .build()```
 */
declare class MeshLineBuilder {
    resolution: T.Vector2;
    camera: T.PerspectiveCamera;
    color: T.Color;
    geometry: T.Geometry;
    withResolution(resolution: T.Vector2): this;
    withCamera(camera: T.PerspectiveCamera): this;
    withColor(color: T.Color): this;
    withLineGeometry(geometry: T.Geometry): this;
    build(): T.Mesh;
}
export { MeshLineBuilder };
