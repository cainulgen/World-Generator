import * as THREE from 'three';

export class SceneManager {
    constructor(color) {
        const c = new THREE.Color(color);
        this.scene = new THREE.Scene();
        this.scene.background = c;
        this.scene.fog = new THREE.Fog(c, 1500, 4000);
    }

    setBackground(color) {
        const c = new THREE.Color(color);
        this.scene.background = c;
        if (this.scene.fog) this.scene.fog.color = c;
    }
}
