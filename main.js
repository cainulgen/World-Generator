// Scene setup
const container = document.querySelector('#scene-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// Camera setup
const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    10000
);
camera.position.set(0, 1000, 1000);
camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Create the landscape plane (2000m x 2000m)
const planeGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a7e4f,
    side: THREE.DoubleSide,
    flatShading: true
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(500, 1000, 500);
scene.add(directionalLight);

// Add OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 100;
controls.maxDistance = 2000;
controls.maxPolarAngle = Math.PI / 2;

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Terrain Options Panel Functionality
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('terrain-options-toggle');
    const closeButton = document.getElementById('terrain-options-close');
    const panel = document.getElementById('terrain-options-panel');
    const sections = document.querySelectorAll('.panel-section');

    // Toggle main panel
    toggleButton.addEventListener('mousedown', () => {
        panel.classList.add('active');
        toggleButton.style.display = 'none';
    });

    // Close panel
    closeButton.addEventListener('mousedown', () => {
        panel.classList.remove('active');
        toggleButton.style.display = 'flex';
    });

    // Toggle individual sections
    sections.forEach(section => {
        const header = section.querySelector('.section-header');
        header.addEventListener('mousedown', () => {
            section.classList.toggle('active');
        });
    });
}); 