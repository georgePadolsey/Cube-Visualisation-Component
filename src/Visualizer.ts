import { cloneDeep, merge, random } from 'lodash';
import * as T from 'three';
import { MeshLine } from 'three.meshline';
import { Line } from '~Line';
import { MeshLineBuilder } from '~meshs/MeshLineBuilder';
import { MeshSphereBuilder } from '~meshs/MeshSphereBuilder';
import { ScalableSphereMesh } from '~meshs/ScalableSphereMesh';
import { iterateCube } from '~utils/3DIterator';
import { sineEmitMaker } from '~utils/sineEmitMaker';
import { WebGL } from '~utils/WebGL';

interface CubeVisualizerConfig {
  /**
   * Controls length of cube (amount of spheres that make it up)
   */
  cubeSize: number;
  /**
   * Controls radius of spheres
   */
  sphereRadius: number;
  /**
   * Gap between spheres in terms of gap radius
   */
  sphereGap: number;
  /**
   * Amount of moving sine lines
   */
  numberOfLines: number;
  /**
   * Background clear colour - if not defined - is transparent
   */
  backgroundClear: number;
  /**
   * The decay rate of the active spheres scale
   * Active spheres are ones close to lines
   */
  radiusDecayRate: number;
  /**
   * Scaling radius of the active sphere.
   * Active spheres are ones close to lines
   */
  closeSphereScale: number;
  /**
   * The factor which time is multiplied by
   * (So like sin(factor * time))
   */
  timeFactor: number;
}

const defaultCubeVisualizerConfig = {
  cubeSize: 7,
  sphereGap: 8,
  sphereRadius: 5,
  numberOfLines: 6,
  backgroundClear: 0x000111,
  closeSphereScale: 3,
  radiusDecayRate: 0.99,
  timeFactor: 1 / 200
};
/**
 * CubeVisualizer class - a framework agnostic cube visualization with sine wave
 * lines which trace out the square randomly.
 */
export class Visualizer {
  scene!: T.Scene;
  camera!: T.PerspectiveCamera;
  renderer!: T.WebGLRenderer;



  /** Config */
  private _config: CubeVisualizerConfig = defaultCubeVisualizerConfig;
  cubeLength!: number;

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
  lines: Line[] = [];

  /**
   * Rendered objects
   */
  renderedLines: T.Mesh[] = [];
  renderedSpheres: ScalableSphereMesh[] = [];


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

  private _height: number;
  private _width: number;

  // container where the visualizer is contained
  container: HTMLElement;

  /** The setInterval id for the update function */
  interval?: NodeJS.Timeout | number;

  /**
   * Bounded functions:
   * These are bounded in the constructor to the current instance.
   * This is so they don't need ot be continuously rebound
   */
  boundRender: (time: number) => void;
  boundUpdate: () => void;

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
      new T.WebGLRenderer({ antialias: false, alpha: !hasBackground });

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
      // make it the cube size -2 as we want it to miss out the most outer layer
      this.lines.push(new Line(sineEmitMaker(
        this.config.cubeSize - 2, randIdent(3), randIdent(3), randIdent(3))));
    }
  }

  /**
   * Build the camera and attach it to the scene
   * Setup a temporarily position and point it at the middle of the cube
   */
  private buildCamera() {
    const aspectRatio = this.width / this.height;

    // basic camera setup
    this.camera = new T.PerspectiveCamera(60, aspectRatio, 5, 5000);

    // temp positioning (will be updated quickly in update function)
    this.camera.position.x = -100;
    this.camera.position.y = this.cubeLength / 2;
    this.camera.position.z = -100;

    // look at middle of cube
    this.camera.lookAt(new T.Vector3(
      this.cubeLength / 2, this.cubeLength / 2, this.cubeLength / 2));
  }

  /**
   * Setup ambient light
   */
  private buildLights() {
    const light = new T.AmbientLight(0x404040, 3);  // soft white light
    this.scene.add(light);

    /**
     * Note these light is `not` stored in the class as instance variables
     * This is because they are not needed anywhere else!
     */
  }
  /**
   * iterate over the entire cube coordinates (integers) and create spheres
   * with colours depending on their position
   */
  private buildSpheres() {
    iterateCube((x, y, z) => {
      const sphere =
        new MeshSphereBuilder()
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

    // reset all spheres (particularly those that have been changed) back to
    // default color / opacity/ transparency
    iterateCube((x, y, z) => {
      const curSphere = this.renderedSpheres[i++];

      const sphereMaterial = curSphere.material as T.MeshStandardMaterial;
      sphereMaterial.color.set(new T.Color().setHSL(
        (x * y * z) / Math.pow(this.config.cubeSize, 3), 0.75, 0.5));
      sphereMaterial.opacity = 0.5;
      sphereMaterial.transparent = true;


      var scalar: number;
      if (curSphere.currentScale > 1) {
        // decay sphere size
        scalar = this.config.radiusDecayRate;

        curSphere.geometry.scale(scalar, scalar, scalar)
        curSphere.currentScale *= scalar;
      } else if (curSphere.currentScale < 1) {
        // if too small - scale it back up
        scalar = 1 / curSphere.currentScale

        curSphere.geometry.scale(scalar, scalar, scalar)
        curSphere.currentScale *= scalar;
      }

    }, this.config.cubeSize);

    // modifier to slow down the update speed!
    const frameMod = this.config.timeFactor;



    /**
     * Update the camera position to be a circle motion
     * round the cube. Therefore x/z must have sine/ cos
     * y stays stationary at the middle of the cube
     */
    this.camera.position.x =
      (this.cubeLength +
        this.config.sphereRadius * this.config.sphereGap * 20) *
      Math.sin(f * frameMod) +
      this.cubeLength / 2 |
      0;
    this.camera.position.y = this.cubeLength / 2 | 0;
    this.camera.position.z =
      (this.cubeLength +
        this.config.sphereRadius * this.config.sphereGap * 20) *
      Math.cos(f * frameMod) +
      this.cubeLength / 2 |
      0;

    // always look at middle of cube
    this.camera.lookAt(new T.Vector3(
      this.cubeLength / 2, this.cubeLength / 2, this.cubeLength / 2));



    // Generate the vertices of the line using the line functions we have from
    // earlier see this.lines
    for (let i = 0; i < this.lines.length; i++) {
      const lineExpr = this.lines[i].emitter;
      const points = [];

      for (let d = 0; d < this.config.cubeSize; d++) {
        let vertexCoords = lineExpr(d, f * frameMod * 2);
        vertexCoords = vertexCoords.map(
          x => Math.round(x / 2 + (this.config.cubeSize - 2) / 2 + 1));

        const roundedVertexCoords = vertexCoords.map(x => Math.round(x));

        const point = new T.Vector3(
          ...vertexCoords.map(x => this.config.sphereGap * 2 * x + 1)
            .map(x => x * this.config.sphereRadius));
        points.push(point);

        // find closest sphere
        const relevantSphere = this.renderedSpheres[this.config.cubeSize ** 2 * roundedVertexCoords[0] + roundedVertexCoords[1] * this.config.cubeSize + roundedVertexCoords[2]];
        // if sphere is not scaled already scale it
        if (relevantSphere.currentScale <= 1) {
          relevantSphere.geometry.scale(this.config.closeSphereScale,
            this.config.closeSphereScale,
            this.config.closeSphereScale);
          relevantSphere.currentScale = this.config.closeSphereScale;
        }
        const relevantSphereMaterial =
          relevantSphere.material as T.MeshStandardMaterial;
        relevantSphereMaterial.color.set(this.lines[i].color);
        relevantSphereMaterial.opacity = 1;
        relevantSphereMaterial.transparent = false;
      }

      const curve = new T.CatmullRomCurve3(points);

      const acPoints = curve.getPoints(this.config.cubeSize ** 2);
      const g = new T.Geometry();

      acPoints.forEach(p => g.vertices.push(p));



      const line = new MeshLine();
      line.setGeometry(g, (p: number) => this.config.sphereRadius * 2);

      const genColor = new T.Color().setHSL(Math.random(), 0.8, 0.5);
      // if there are already enough lines
      // just change the geometry of an already available line (more performant)
      if (i > this.renderedLines.length - 1) {

        const color = new T.Color().setHSL(i / this.lines.length, 0.8, 0.5);

        const lineMesh =
          new MeshLineBuilder()
            .withResolution(new T.Vector2(this.width, this.height))
            .withCamera(this.camera)
            .withColor(color)
            .withLineGeometry(line.geometry)
            .build();

        this.lines[i].color = color;


        this.renderedLines.push(lineMesh);
        this.scene.add(lineMesh);
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