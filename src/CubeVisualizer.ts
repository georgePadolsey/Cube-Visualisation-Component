import { sineEmitMaker } from "./utils/sineF";
import * as T from 'three';
import { MeshLine, MeshLineMaterial } from 'three.meshline';
import { merge, cloneDeep, random } from 'lodash';
import WebGL from './utils/WebGL';
import { iterateCube } from './utils/3DIterator';

interface CubeVisualizerConfig {
    cubeSize: number,
    sphereRadius: number,
    sphereGap: number,
    numberOfLines: number,
    backgroundClear?: number
}

const DefaultCubeVisualizerConfig = {
    cubeSize: 9,
    sphereGap: 8.5,
    sphereRadius: 5,
    numberOfLines: 6,
    backgroundClear: 0x000111
}

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

    spotlight: T.SpotLight;
    _config: CubeVisualizerConfig = DefaultCubeVisualizerConfig;
    set config(config: CubeVisualizerConfig) {
        this._config = config;
        this.updateConfig();
    }
    get config(): CubeVisualizerConfig {
        return this._config;
    }
    frame: number = 0;

    lineEmitters: ((x: number, t: number) => number[])[] = [];
    renderedLines: any = [];
    renderedSpheres: any = [];

    set width(width: number) {
        this._width = width;
        this.updateDimensions();
    }
    get width() { return this._width };
    set height(height: number) {
        this._height = height;
        this.updateDimensions();
    }

    get height() { return this._height };
    _height: number;
    _width: number;
    container: HTMLElement;
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
     * CubeVisualizer class - a framework agnostic cube visualization with sine wave
     * lines which trace out the square randomly.
     * It appends itself to the DOM element passed in.
     * It has width and height as passed in.
     * 
     * @param container the DOM element to append itself to
     * @param width the width of the visualization
     * @param height the height of the visualization
     * @param config further optional configuration (See CubeVisualizerConfig documentation)
     */
    constructor(container: HTMLElement,
        width: number,
        height: number,
        config: Partial<CubeVisualizerConfig> = cloneDeep(DefaultCubeVisualizerConfig)) {

        this.container = container;

        // bypass set dimensions
        this._width = width;
        this._height = height;
        this.config = merge({}, DefaultCubeVisualizerConfig, config || {});

        /**
         * A bound function is used so `this` is in scope.
         * The bound function is cached here so it is not re-bound
         * on every new animation frame.
         */
        this.boundRender = this.render.bind(this);
        this.boundUpdate = this.update.bind(this);

        this.setupScene();

    }

    private updateConfig() {
        this.cubeLength = 2 * this.config.sphereRadius * (this.config.sphereGap * (this.config.cubeSize - 1) + 1);
    }

    private setupScene() {
        this.scene = new T.Scene();

        /**
         * If WEBGL not available - end setup with error
         */
        if (!WebGL.isWebGLAvailable()) {

            let warning = WebGL.getWebGLErrorMessage();

            this.container.appendChild(warning);
            throw new Error('WebGL not supported!');
        }

        let hasBackground = !!this.config.backgroundClear;

        // Setup Renderer and attach to container
        this.renderer = new T.WebGLRenderer({ antialias: true, alpha: !hasBackground });

        if (hasBackground) {
            this.renderer.setClearColor(this.config.backgroundClear)
        }

        // setup pixel ratio
        let DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1;
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

    private buildLines() {

        const randIdent = (dims: number) => Array(dims).fill(0).map(x => random(-1, 1, true))

        for (var i = 0; i < this.config.numberOfLines; i++) {
            // fill sine parameters with all [-1,1] floats
            this.lineEmitters.push(sineEmitMaker(this.config.cubeSize - 2,
                randIdent(3),
                randIdent(3),
                randIdent(3)));
        }
    }

    private buildCamera() {
        let aspectRatio = this.width / this.height;
        this.camera = new T.PerspectiveCamera(60, aspectRatio, 0.1, 2000);


        this.camera.position.x = -100;
        this.camera.position.y = this.cubeLength / 2
        this.camera.position.z = -100;
        this.camera.lookAt(new T.Vector3(this.cubeLength / 2, this.cubeLength / 2, this.cubeLength / 2));
    }

    private buildLights() {
        var light = new T.AmbientLight(0x404040); // soft white light
        this.scene.add(light);


        this.spotlight = new T.SpotLight('#fff', 1);
        this.spotlight.position.x = -this.cubeLength;
        this.spotlight.position.z = -this.cubeLength;
        this.spotlight.position.y = this.cubeLength / 2;

        this.spotlight.angle = 0.3;
        this.spotlight.decay = 0.5;
        this.spotlight.penumbra = 1;
        this.spotlight.shadow.camera.near = 10;
        this.spotlight.shadow.camera.far = 1000;
        this.spotlight.shadow.camera.fov = 30;


        this.spotlight.lookAt(new T.Vector3(this.cubeLength / 2, this.cubeLength / 2, this.cubeLength / 2));
        this.scene.add(this.spotlight);
    }

    private buildSpheres() {

        iterateCube((x, y, z) => {
            let geometry = new T.SphereGeometry(this.config.sphereRadius, 8, 8);
            var nonActiveColor = new T.Color(`hsl(${(x + y + z) / (this.config.cubeSize * 3) * 360}, 75%, 50%)`);
            let material = new T.MeshStandardMaterial({ color: nonActiveColor, transparent: true, opacity: 0.6 });
            let sphere = new T.Mesh(geometry, material);
            sphere.position.x = this.config.sphereRadius + this.config.sphereRadius * 2 * this.config.sphereGap * x;
            sphere.position.y = this.config.sphereRadius + this.config.sphereRadius * 2 * this.config.sphereGap * y;
            sphere.position.z = this.config.sphereRadius + this.config.sphereRadius * 2 * this.config.sphereGap * z;
            this.renderedSpheres.push(sphere);
            this.scene.add(sphere);
        }, this.config.cubeSize);

    }

    private startRender() {
        requestAnimationFrame(this.boundRender);
        this.interval = setInterval(this.boundUpdate, 1000 / 60);
    }

    private update() {
        this.frame++;
        let f = this.frame;

        var i = 0;
        iterateCube((x, y, z) => {
            this.renderedSpheres[i].material.color.set(new T.Color(`hsl(${(x * y * z) / Math.pow(this.config.cubeSize, 3) * 360}, 75%, 50%)`));
            this.renderedSpheres[i].material.opacity = 0.6;
            this.renderedSpheres[i].material.transparent = true;
            i++;

        }, this.config.cubeSize);
        const frameMod = 1 / 500;



        this.camera.position.x = (this.cubeLength + this.config.sphereRadius * this.config.sphereGap * 20) * Math.sin(f * frameMod) + this.cubeLength / 2;
        this.camera.position.y = this.cubeLength / 2
        this.camera.position.z = (this.cubeLength + this.config.sphereRadius * this.config.sphereGap * 20) * Math.cos(f * frameMod) + this.cubeLength / 2;
        this.camera.lookAt(new T.Vector3(this.cubeLength / 2, this.cubeLength / 2, this.cubeLength / 2));



        for (var i = 0; i < this.lineEmitters.length; i++) {
            let lineExpr = this.lineEmitters[i];
            let color = new T.Color(`hsl(${i / this.lineEmitters.length * 360}, 100%, 50%)`);
            var geometry = new Float32Array(this.config.cubeSize * 3);

            var lastGeo;
            for (let x = 0; x < this.config.cubeSize; x++) {
                let exprV = lineExpr(x, f * frameMod * 2);
                exprV = exprV.map(x => x / 2 + (this.config.cubeSize - 2) / 2 + 1 | 0)

                let exprG = exprV.map(x => this.config.sphereGap * 2 * x + 1);
                let exprRad = exprG.map(x => x * this.config.sphereRadius)
                geometry[x * 3] = exprRad[0];
                geometry[x * 3 + 1] = exprRad[1];
                geometry[x * 3 + 2] = exprRad[2];

                let relevantSphere = this.renderedSpheres[this.config.cubeSize ** 2 * exprV[0] + exprV[1] * this.config.cubeSize + exprV[2]];
                relevantSphere.material.color.set(
                    new T.Color(`hsl(${(exprV[0] * exprV[1] * exprV[2]) / Math.pow(this.config.cubeSize, 3) * 360}, 100%, 50%)`));
                relevantSphere.material.opacity = 1;
                relevantSphere.material.transparent = false;
            }


            let line = new MeshLine();
            line.setGeometry(geometry, (p: number) => this.config.sphereRadius / 2);

            if (i > this.renderedLines.length - 1) {

                let material = new MeshLineMaterial({
                    useMap: false,
                    opacity: 1,
                    sizeAttenuation: !false,
                    near: this.camera.near,
                    far: this.camera.far,
                    color,
                    resolution: new T.Vector2(this.width, this.height)
                });
                let mesh = new T.Mesh(line.geometry, material);
                this.renderedLines.push(mesh);
                // console.log('added')
                this.scene.add(mesh);
            } else {
                this.renderedLines[i].geometry.dispose();
                this.renderedLines[i].geometry = line.geometry;
            }

        }

    }


    public setSize(width: number, height: number) {
        this._width = width;
        this._height = height;
        this.updateDimensions();
    }

    private updateDimensions() {
        this.renderer.setSize(this.width, this.height);
    }

    private render() {

        this.update();

        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.boundRender);
    }

}