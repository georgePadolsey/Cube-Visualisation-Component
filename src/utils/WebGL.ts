/**
 * Adapted from:
 * https://github.com/mrdoob/three.js/blob/63eca7a87695703e23ccce326f95ffba259e8e19/examples/js/WebGL.js
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 * It was originally under an MIT license
 */
declare var window: { WebGLRenderingContext: any; };

const WEBGL = {

    isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(
                window.WebGLRenderingContext &&
                (canvas.getContext('webgl') ||
                    canvas.getContext('experimental-webgl')));

        } catch (e) {
            return false;
        }
    },

    getWebGLErrorMessage() {
        return this.getErrorMessage(1);
    },

    getErrorMessage() {

        let message =
            'Your $0 does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>';

        const element = document.createElement('div');
        element.id = 'webglmessage';
        element.style.fontFamily = 'monospace';
        element.style.fontSize = '13px';
        element.style.fontWeight = 'normal';
        element.style.textAlign = 'center';
        element.style.background = '#fff';
        element.style.color = '#000';
        element.style.padding = '1.5em';
        element.style.width = '400px';
        element.style.margin = '5em auto 0';

        if (window.WebGLRenderingContext) {
            message = message.replace('$0', 'graphics card');

        } else {
            message = message.replace('$0', 'browser');
        }

        element.innerHTML = message;

        return element;
    }

};

export { WEBGL };