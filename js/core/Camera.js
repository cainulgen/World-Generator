import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CameraManager {
    constructor(container) {
        const { width, height } = container.getBoundingClientRect();
        this.camera = new THREE.PerspectiveCamera(60, width / height, 10, 5000);
        this.camera.position.set(1000, 800, 1000);
        this.controls = new OrbitControls(this.camera, null);
        this.controls.target.set(0, 0, 0);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 200;
        this.controls.maxDistance = 2500;
        this.controls.maxPolarAngle = Math.PI / 2.1;
    }

    attachDomElement(dom) {
        this.controls.domElement = dom;
    }

    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}
