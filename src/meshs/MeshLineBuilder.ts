import * as T from 'three';
import {MeshLineMaterial} from 'three.meshline';

class MeshLineBuilder {
  resolution!: T.Vector2;
  camera!: T.PerspectiveCamera;
  color!: T.Color;
  geometry!: T.Geometry;


  withResolution(resolution: T.Vector2) {
    this.resolution = resolution;
    return this;
  }

  withCamera(camera: T.PerspectiveCamera) {
    this.camera = camera;
    return this;
  }


  withColor(color: T.Color) {
    this.color = color;
    return this;
  }

  withLineGeometry(geometry: T.Geometry) {
    this.geometry = geometry;
    return this;
  }

  build(): T.Mesh {
    const material = new MeshLineMaterial({
      useMap: false,
      opacity: 1,
      sizeAttenuation: !false,
      near: this.camera.near,
      far: this.camera.far,

      color: this.color,
      resolution: this.resolution
    });

    const mesh = new T.Mesh(this.geometry, material);
    return mesh;
  }
}
export {MeshLineBuilder};