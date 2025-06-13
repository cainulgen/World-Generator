import * as THREE from 'three';

export function addDefaultLighting(scene) {
    const ambientLight = new THREE.AmbientLight(0xaaaaaa, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(500, 1000, 300);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}
