// Scene setup
const container = document.querySelector('#scene-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// Initialize Global Settings
const globalSettings = new GlobalSettings();

// Initialize Noise Generator
// The initial heightScale is now part of the noiseGenerator's internal state.
const noiseGenerator = new NoiseGenerator();

// Camera setup
const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    10000
);
camera.position.set(0, 1500, 1500);
camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Create the landscape plane (2000m x 2000m)
let planeGeometry = new THREE.PlaneGeometry(2000, 2000, globalSettings.getMeshDetail(), globalSettings.getMeshDetail());
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a7e4f,
    side: THREE.DoubleSide,
    flatShading: true
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Function to update plane geometry based on mesh detail
function updatePlaneGeometry() {
    const segments = globalSettings.getMeshDetail();

    plane.geometry.dispose();
    planeGeometry = new THREE.PlaneGeometry(2000, 2000, segments, segments);
    plane.geometry = planeGeometry;

    applyNoiseToGeometry();
}

// Function to apply noise to the geometry
function applyNoiseToGeometry() {
    const segments = globalSettings.getMeshDetail();
    // noiseGenerator.generateHeightMap now directly returns the final height value
    // including both noiseScale and heightScale effects.
    const heightMap = noiseGenerator.generateHeightMap(segments + 1, segments + 1);
    const vertices = plane.geometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
        const x = Math.floor((i / 3) % (segments + 1));
        const y = Math.floor((i / 3) / (segments + 1));
        const height = heightMap[y * (segments + 1) + x]; // Use the value directly
        vertices[i + 2] = height;
    }

    plane.geometry.attributes.position.needsUpdate = true;
    plane.geometry.computeVertexNormals();
}

// Initialize noise controls
function initializeNoiseControls() {
    const noiseSection = document.querySelector('[data-section="noise-distortion"] .section-content');
    const noiseScaleInput = noiseSection.querySelector('#noiseScale');
    const heightScaleInput = noiseSection.querySelector('#heightScale');

    // Set initial UI values to match NoiseGenerator's constructor defaults
    noiseScaleInput.value = noiseGenerator.scale;
    noiseScaleInput.nextElementSibling.textContent = noiseGenerator.scale.toFixed(1);
    heightScaleInput.value = noiseGenerator.heightScale;
    heightScaleInput.nextElementSibling.textContent = noiseGenerator.heightScale.toFixed(1);


    function updateNoise() {
        const noiseScale = parseFloat(noiseScaleInput.value);
        const heightScale = parseFloat(heightScaleInput.value);
        noiseGenerator.updateParameters(noiseScale, heightScale); // Pass both
        applyNoiseToGeometry();
    }

    // Add event listeners for both sliders
    noiseScaleInput.addEventListener('input', (e) => {
        e.target.nextElementSibling.textContent = parseFloat(e.target.value).toFixed(1);
        updateNoise();
    });

    heightScaleInput.addEventListener('input', (e) => {
        e.target.nextElementSibling.textContent = parseFloat(e.target.value).toFixed(1);
        updateNoise();
    });

    // Initial noise application
    updateNoise();
}

// Listen for global settings changes
document.addEventListener('globalSettingsChanged', (event) => {
    const { meshDetail, textureDetail } = event.detail;

    if (meshDetail) {
        updatePlaneGeometry();
    }

    if (textureDetail) {
        console.log('Texture detail changed to:', textureDetail);
    }
});

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

// Initialize noise controls and UI listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeNoiseControls();

    const toggleButton = document.getElementById('terrain-options-toggle');
    const closeButton = document.getElementById('terrain-options-close');
    const panel = document.getElementById('terrain-options-panel');
    const sections = document.querySelectorAll('.panel-section');

    toggleButton.addEventListener('mousedown', () => {
        panel.classList.add('active');
        toggleButton.style.display = 'none';
    });

    closeButton.addEventListener('mousedown', () => {
        panel.classList.remove('active');
        toggleButton.style.display = 'flex';
    });

    sections.forEach(section => {
        const header = section.querySelector('.section-header');
        header.addEventListener('mousedown', () => {
            section.classList.toggle('active');
        });
    });

    updatePlaneGeometry();
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();