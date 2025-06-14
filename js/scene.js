import * as THREE from 'https://cdn.skypack.dev/three@0.129.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';

// --- Basic Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-container').appendChild(renderer.domElement);

// Enable shadows in the renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- Lights ---
const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Slightly increased intensity
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Slightly increased intensity
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;

// --- Land Plane ---
const initialDetail = 32;
const geometry = new THREE.PlaneGeometry(10, 10, initialDetail, initialDetail);

// MODIFICATION: The solid material now uses vertexColors.
const wireframeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true });
const solidMaterial = new THREE.MeshStandardMaterial({ 
    roughness: 0.8, 
    metalness: 0.1, 
    vertexColors: true // This is the key change to enable height-based color
});

// Initialize with wireframe material
const plane = new THREE.Mesh(geometry, wireframeMaterial); 
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
plane.castShadow = true;
scene.add(plane);

// --- Camera Position ---
camera.position.set(5, 5, 5);
camera.lookAt(plane.position);

// --- Resize Listener ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Export scene components ---
export { scene, camera, renderer, controls, plane, wireframeMaterial, solidMaterial };