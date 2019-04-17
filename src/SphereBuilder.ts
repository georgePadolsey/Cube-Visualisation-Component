import Builder from 'builder-pattern';
import * as T from 'three';

class SphereBuilder {
  position: T.Vector3 = new T.Vector3();

  radius!: number;
  edges!: number;
  color!: T.Color;

  opacity = 1;

  constructor() {}

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
          {color: this.color, transparent: true, opacity: 0.6});
      const sphere = new T.Mesh(geometry, material);
      sphere.position = this.position;
      return sphere;
    } catch (e) {
      throw new Error('Undefined builder value: ' + e);
    }
  }
}

export {SphereBuilder};