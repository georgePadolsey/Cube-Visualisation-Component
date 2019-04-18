import * as T from 'three';
import { Line } from '~Line';
import { ScalableSphereMesh } from '~meshs/ScalableSphereMesh';
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
/**
 * CubeVisualizer class - a framework agnostic cube visualization with sine wave
 * lines which trace out the square randomly.
 */
export declare class Visualizer {
    scene: T.Scene;
    camera: T.PerspectiveCamera;
    renderer: T.WebGLRenderer;
    /** Config */
    private _config;
    cubeLength: number;
    config: CubeVisualizerConfig;
    frame: number;
    /**
     * functions which emit the x,y,z verticies of the line
     *  from a displacement value(x) and time value(t)
     */
    lines: Line[];
    /**
     * Rendered objects
     */
    renderedLines: T.Mesh[];
    renderedSpheres: ScalableSphereMesh[];
    /** Dimensions */
    width: number;
    height: number;
    private _height;
    private _width;
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
    constructor(container: HTMLElement, width: number, height: number, config?: Partial<CubeVisualizerConfig>);
    /**
     * Update calculated value of cubeLength
     */
    private updateConfig;
    /**
     * Setup the entire scene, including camera, lights, spheres / lines.
     */
    private setupScene;
    /**
     * Randomly generate numbers for the line parameters
     */
    private buildLines;
    /**
     * Build the camera and attach it to the scene
     * Setup a temporarily position and point it at the middle of the cube
     */
    private buildCamera;
    /**
     * Setup ambient light
     */
    private buildLights;
    /**
     * iterate over the entire cube coordinates (integers) and create spheres
     * with colours depending on their position
     */
    private buildSpheres;
    private startRender;
    private update;
    setSize(width: number, height: number): void;
    private updateDimensions;
    private render;
}
export {};
