// --- State ---
// We export the sceneState object so other modules can access core Three.js components.
export const sceneState = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    mesh: null,
};

/**
 * Initializes the entire Three.js scene, camera, renderer, and lights.
 */
export function setupScene() {
    const container = document.getElementById('container');

    // Scene and Fog
    sceneState.scene = new THREE.Scene();
    sceneState.scene.fog = new THREE.Fog(0x1e293b, 800, 3000);

    // Camera
    sceneState.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    sceneState.camera.position.set(400, 300, 500);

    // Renderer
    sceneState.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    sceneState.renderer.setSize(window.innerWidth, window.innerHeight);
    sceneState.renderer.setClearColor(0x1e293b);
    container.appendChild(sceneState.renderer.domElement);

    // Lighting
    sceneState.scene.add(new THREE.AmbientLight(0x9ca3af, 0.6));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(200, 300, 200);
    sceneState.scene.add(directionalLight);

    // Controls
    sceneState.controls = new THREE.OrbitControls(sceneState.camera, sceneState.renderer.domElement);
    sceneState.controls.enableDamping = true;
    sceneState.controls.dampingFactor = 0.05;
    sceneState.controls.minDistance = 50;
    sceneState.controls.maxDistance = 2000;
    sceneState.controls.maxPolarAngle = Math.PI / 2.05;
}

/**
 * The animation loop.
 */
export function animate() {
    requestAnimationFrame(animate);
    sceneState.controls.update();
    sceneState.renderer.render(sceneState.scene, sceneState.camera);
}