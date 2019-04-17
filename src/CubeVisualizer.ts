import {cloneDeep, merge, random} from 'lodash';
import * as T from 'three';
import {MeshLine, MeshLineMaterial} from 'three.meshline';

import {SphereBuilder} from './SphereBuilder';
import {iterateCube} from './utils/3DIterator';
import {sineEmitMaker} from './utils/sineF';
import {WebGL} from './utils/WebGL';

interface CubeVisualizerConfig {
  cubeSize: number;
  sphereRadius: number;
  sphereGap: number;
  numberOfLines: number;
  backgroundClear?: number;
}

const defaultCubeVisualizerConfig = {
  cubeSize: 9,
  sphereGap: 8.5,
  sphereRadius: 5,
  numberOfLines: 6,
  backgroundClear: 0x000111
};

function params<T>(o: T): Partial<T> {
  return o;
}

/**
 * CubeVisualizer class - a framework agnostic cube visualization with sine wave
 * lines which trace out the square randomly.
 */
export class CubeVisualizer {
  scene: T.Scene;
  camera: T.PerspectiveCamera;
  renderer: T.WebGLRenderer;



  /** Config */
  _config: CubeVisualizerConfig = defaultCubeVisualizerConfig;

  set config(config: CubeVisualizerConfig) {
    this._config = config;
    this.updateConfig();
  }
  get config(): CubeVisualizerConfig {
    return this._config;
  }

  // frame counter for update function
  frame = 0;

  /**
   * functions which emit the x,y,z verticies of the line
   *  from a displacement value(x) and time value(t)
   */
  lineEmitters: Array<(x: number, t: number) => number[]> = [];

  /**
   * Rendered objects
   */
  renderedLines: T.Mesh[] = [];
  renderedSpheres: T.Mesh[] = [];


  /** Dimensions */
  set width(width: number) {
    this._width = width;
    this.updateDimensions();
  }
  get width() {
    return this._width;
  }

  set height(height: number) {
    this._height = height;
    this.updateDimensions();
  }
  get height() {
    return this._height;
  }

  _height: number;
  _width: number;

  // container where the visualizer is contained
  container: HTMLElement;

  /** The setInterval id for the update function */
  interval?: number;

  /**
   * Bounded functions:
   * These are bounded in the constructor to the current instance.
   * This is so they don't need ot be continuously rebound
   */
  boundRender: (time: number) => void;
  boundUpdate: () => void;
  cubeLength: number;

  /**
   * CubeVisualizer class - a framework agnostic cube visualization with sine
   * wave lines which trace out the square randomly. It appends itself to the
   * DOM element passed in. It has width and height as passed in.
   *
   * @param container the DOM element to append itself to
   * @param width the width of the visualization
   * @param height the height of the visualization
   * @param config further optional configuration (See CubeVisualizerConfig
   * documentation)
   */
  constructor(
      container: HTMLElement, width: number, height: number,
      config: Partial<CubeVisualizerConfig> =
          cloneDeep(defaultCubeVisualizerConfig)) {
    this.container = container;

    // bypass set dimensions
    this._width = width;
    this._height = height;
    this.config = merge({}, defaultCubeVisualizerConfig, config || {});

    /**
     * A bound function is used so `this` is in scope.
     * The bound function is cached here so it is not re-bound
     * on every new animation frame.
     */
    this.boundRender = this.render.bind(this);
    this.boundUpdate = this.update.bind(this);

    this.setupScene();
  }

  /**
   * Update calculated value of cubeLength
   */
  private updateConfig() {
    this.cubeLength = 2 * this.config.sphereRadius *
        (this.config.sphereGap * (this.config.cubeSize - 1) + 1);
  }

  /**
   * Setup the entire scene, including camera, lights, spheres / lines.
   */
  private setupScene() {
    this.scene = new T.Scene();

    /**
     * If WEBGL not available - end setup with error
     */
    if (!WebGL.isWebGLAvailable()) {
      const warning = WebGL.getWebGLErrorMessage();

      this.container.appendChild(warning);
      throw new Error('WebGL not supported!');
    }

    const hasBackground = !!this.config.backgroundClear;

    // Setup Renderer and attach to container
    this.renderer =
        new T.WebGLRenderer({antialias: true, alpha: !hasBackground});

    if (hasBackground) {
      this.renderer.setClearColor(this.config.backgroundClear);
    }

    // setup pixel ratio
    const DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1;
    this.renderer.setPixelRatio(DPR);

    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;

    this.renderer.setSize(this.width, this.height);
    this.container.appendChild(this.renderer.domElement);

    this.buildLights();
    this.buildCamera();
    this.buildSpheres();
    this.buildLines();

    this.startRender();
  }

  /**
   * Randomly generate numbers for the line parameters
   */
  private buildLines() {
    // randomly generate a matrix of dimension (dims) with values between -1 ->
    // 1 (float)
    const randIdent = (dims: number) =>
        new Array(dims).fill(0).map(x => random(-1, 1, true));

    for (let i = 0; i < this.config.numberOfLines; i++) {
      // fill sine parameters with all [-1,1] floats
      this.lineEmitters.push(sineEmitMaker(
          this.config.cubeSize - 2, randIdent(3), randIdent(3), randIdent(3)));
    }
  }

  /**
   * Build the camera and attach it to the scene
   * Setup a temporarily position and point it at the middle of the cube
   */
  private buildCamera() {
    const aspectRatio = this.width / this.height;

    // basic camera setup
    this.camera = new T.PerspectiveCamera(60, aspectRatio, 0.1, 2000);

    // temp positioning (will be update quickly in update function)
    this.camera.position.x = -100;
    this.camera.position.y = this.cubeLength / 2;
    this.camera.position.z = -100;

    // look at middle of cube
    this.camera.lookAt(new T.Vector3(
        this.cubeLength / 2, this.cubeLength / 2, this.cubeLength / 2));
  }

  /**
   * Setup ambient light as well as a spot light
   */
  private buildLights() {
    const light = new T.AmbientLight(0x404040);  // soft white light
    this.scene.add(light);


    const spotlight = new T.SpotLight('#fff', 1);
    spotlight.position.x = -this.cubeLength;
    spotlight.position.z = -this.cubeLength;
    spotlight.position.y = this.cubeLength / 2;

    spotlight.angle = 0.3;
    spotlight.decay = 0.5;
    spotlight.penumbra = 1;
    spotlight.shadow.camera.near = 10;
    spotlight.shadow.camera.far = 1000;
    spotlight.shadow.camera.fov = 30;


    spotlight.lookAt(new T.Vector3(
        this.cubeLength / 2, this.cubeLength / 2, this.cubeLength / 2));
    this.scene.add(spotlight);

    /**
     * Note these lights are `not` stored in the class as instance variables
     * This is because they are not needed anywhere else!
     */
  }

  private buildSpheres() {
    /**
     * iterate over the entire cube coordinates (integers) and create spheres
     * with colours depending on their position
     */
    iterateCube((x, y, z) => {
      const sphere =
          new SphereBuilder()
              .withX(
                  this.config.sphereRadius *
                  (1 + 2 * this.config.sphereGap * x))
              .withY(
                  this.config.sphereRadius *
                  (1 + 2 * this.config.sphereGap * y))
              .withZ(
                  this.config.sphereRadius *
                  (1 + 2 * this.config.sphereGap * z))
              .withColor(new T.Color().setHSL(
                  (x + y + z) / (this.config.cubeSize * 3), 0.75, 0.5))
              .withRadius(this.config.sphereRadius)
              .withEdges(8)
              .build();
      this.renderedSpheres.push(sphere);
      this.scene.add(sphere);
    }, this.config.cubeSize);
  }

  private startRender() {
    /**
     * Update function is decoupled from render animation.
     * This is as we want the speed of the visualization to be generally
     * consistent between computers. No matter how fast the computers graphics
     * are.
     */
    requestAnimationFrame(this.boundRender);
    this.interval = setInterval(this.boundUpdate, 1000 / 60);
  }

  private update() {
    this.frame++;
    const f = this.frame;

    let i = 0;

    // reset all spheres (particurly those that have been changed) back to
    // default color / opacity/ transparency
    iterateCube((x, y, z) => {
      const curSphere = this.renderedSpheres[i++];
      curSphere.material.color.set(new T.Color(`hsl(${
          (x * y * z) / Math.pow(this.config.cubeSize, 3) *
          360}, 75 %, 50 %)`));
      curSphere.material.opacity = 0.6;
      curSphere.material.transparent = true;
    }, this.config.cubeSize);

    // modifier to slow down the update speed!
    const frameMod = 1 / 500;

    this.camera.position.x =
        (this.cubeLength +
         this.config.sphereRadius * this.config.sphereGap * 20) *
            Math.sin(f * frameMod) +
        this.cubeLength / 2;
    this.camera.position.y = this.cubeLength / 2;
    this.camera.position.z =
        (this.cubeLength +
         this.config.sphereRadius * this.config.sphereGap * 20) *
            Math.cos(f * frameMod) +
        this.cubeLength / 2;
    this.camera.lookAt(new T.Vector3(
        this.cubeLength / 2, this.cubeLength / 2, this.cubeLength / 2));



    // Generate the vertices of the line using the line functions we have from
    // earlier see this.lineEmitters
    for (let i = 0; i < this.lineEmitters.length; i++) {
      const lineExpr = this.lineEmitters[i];
      const geometry = new Float32Array(this.config.cubeSize * 3);

      for (let d = 0; d < this.config.cubeSize; d++) {
        let vertexCoords = lineExpr(d, f * frameMod * 2);
        vertexCoords = vertexCoords.map(
            x => x / 2 + (this.config.cubeSize - 2) / 2 + 1 | 0);

        const [x, y, z] =
            vertexCoords.map(x => this.config.sphereGap * 2 * x + 1)
                .map(x => x * this.config.sphereRadius);
        geometry[d * 3] = x;
        geometry[d * 3 + 1] = y;
        geometry[d * 3 + 2] = z;

        const relevantSphere = this.renderedSpheres[this.config.cubeSize ** 2 * vertexCoords[0] + vertexCoords[1] * this.config.cubeSize + vertexCoords[2]];
        relevantSphere.material.color.set(new T.Color(`hsl(${
            (vertexCoords[0] * vertexCoords[1] * vertexCoords[2]) /
            Math.pow(this.config.cubeSize, 3) * 360}, 100%, 50 %)`));
        relevantSphere.material.opacity = 1;
        relevantSphere.material.transparent = false;
      }


      const line = new MeshLine();
      line.setGeometry(geometry, (p: number) => this.config.sphereRadius / 2);


      // if there are already enough lines
      // just change the geometry of an already available line (more performant)
      if (i > this.renderedLines.length - 1) {
        const material = new MeshLineMaterial({
          useMap: false,
          opacity: 1,
          sizeAttenuation: !false,
          near: this.camera.near,
          far: this.camera.far,
          color: new T.Color(
              `hsl(${i / this.lineEmitters.length * 360}, 100 %, 50 %)`),
          resolution: new T.Vector2(this.width, this.height)
        });
        const mesh = new T.Mesh(line.geometry, material);
        this.renderedLines.push(mesh);

        this.scene.add(mesh);
      } else {
        // REMEMBER GC!
        this.renderedLines[i].geometry.dispose();
        this.renderedLines[i].geometry = line.geometry;
      }
    }
  }


  setSize(width: number, height: number) {
    this._width = width;
    this._height = height;
    this.updateDimensions();
  }

  private updateDimensions() {
    this.renderer.setSize(this.width, this.height);
  }

  private render() {
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.boundRender);
  }
}