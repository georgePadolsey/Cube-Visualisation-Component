import * as T from 'three';
import { ScalableSphereMesh } from './ScalableSphereMesh';

class MeshSphereBuilder {
  position: T.Vector3 = new T.Vector3();

  radius!: number;
  edges!: number;
  color!: T.Color;

  opacity = 1;

  withX(x: number) {
    this.position.x = x;
    return this;
  }

  withY(y: number) {
    this.position.y = y;
    return this;
  }

  withZ(z: number) {
    this.position.z = z;
    return this;
  }

  withRadius(radius: number) {
    this.radius = radius;
    return this;
  }

  withColor(color: T.Color) {
    this.color = color;
    return this;
  }

  withEdges(edges: number) {
    this.edges = edges;
    return this;
  }

  withOpacity(opacity: number) {
    this.opacity = opacity;
    return this;
  }

  build() {
    try {
      const geometry =
        new T.SphereGeometry(this.radius, this.edges, this.edges);
      const material = new T.MeshStandardMaterial(
        { color: this.color, transparent: true, opacity: 0.6 });
      const sphere = new ScalableSphereMesh(geometry, material);

      /**
       * We are ignoring typescript error here
       * as we all know that a 3d Vector will have 3 args
       * but TypeScript does not :(
       */
      // @ts-ignore
      sphere.position.set(...this.position.toArray());
      return sphere;
    } catch (e) {
      throw new Error('Undefined builder value: ' + e);
    }
  }
}

export { MeshSphereBuilder };