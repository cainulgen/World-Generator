import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class WorldScene {
    constructor() {
        this.container = document.querySelector('#scene-container');
        this.scene = new THREE.Scene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.createLand();
        this.setupControls();
        this.animate();
    }

    setupCamera() {
        const fov = 60;
        const aspect = this.container.clientWidth / this.container.clientHeight;
        const near = 0.1;
        const far = 10000;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(0, 1000, 1000);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x87CEEB); // Sky blue background
        this.container.appendChild(this.renderer.domElement);
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1000, 1000, 1000);
        this.scene.add(directionalLight);
    }

    createLand() {
        const size = 2000;
        const geometry = new THREE.PlaneGeometry(size, size, 100, 100);
        const material = new THREE.MeshStandardMaterial({
            color: 0x3a7d44, // Forest green
            side: THREE.DoubleSide,
            flatShading: true
        });
        this.land = new THREE.Mesh(geometry, material);
        this.land.rotation.x = -Math.PI / 2;
        this.scene.add(this.land);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 100;
        this.controls.maxDistance = 2000;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going below ground
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
}

// Create the scene
const world = new WorldScene();

// Handle window resize
window.addEventListener('resize', () => world.onWindowResize()); 