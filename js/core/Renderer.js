import * as THREE from 'three';

export class Renderer {
    constructor(container) {
        this.container = container;
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);
    }

    setSize(width, height) {
        this.renderer.setSize(width, height);
    }
}
