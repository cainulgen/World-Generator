// main.js
// Basic Three.js setup
let scene, camera, renderer, controls;
let planeMesh;
let perlinNoiseGenerator; // Renamed variable
let globalSettings;
let voronoiGenerator;

function init() {
    // Scene setup
    scene = new THREE.Scene();
    // Reverting background color to default or black if not explicitly set by user.
    // Assuming the original 'styles.css' body background color was intended.
    scene.background = new THREE.Color(0x000000); // Black background as per initial styles.css

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 400, 400); // Adjust camera position to see the plane

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    // OrbitControls for camera interaction
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.listenToKeyEvents(window); // Optional: Enable keyboard controls
    controls.enableDamping = true; // An animation loop is required when damping is enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 100;
    controls.maxDistance = 1000;
    controls.maxPolarAngle = Math.PI / 2; // Prevent camera from going below the ground

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(200, 500, 300);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Initialize generators
    perlinNoiseGenerator = new PerlinNoiseGenerator(); // Renamed instantiation
    globalSettings = new GlobalSettings();
    voronoiGenerator = new VoronoiGenerator();

    // Event listeners for settings changes
    document.addEventListener('globalSettingsChanged', (e) => {
        const { meshDetail, textureDetail } = e.detail;
        console.log('Global settings changed:', meshDetail, textureDetail);
        updatePlaneGeometry(meshDetail);
        generateTerrain();
    });

    document.addEventListener('voronoiSettingsChanged', (e) => {
        const { enabled, numCells, heightMultiplier, smoothness, cellJitter } = e.detail;
        console.log('Voronoi settings changed:', enabled, numCells, heightMultiplier, smoothness, cellJitter);
        generateTerrain();
    });

    // Event listeners for Noise & Distortion panel
    const noiseEnabledToggle = document.getElementById('noiseEnabled');
    const noiseScaleInput = document.getElementById('noiseScale');
    const heightScaleInput = document.getElementById('heightScale');

    const noiseScaleValue = noiseScaleInput.nextElementSibling;
    const heightScaleValue = heightScaleInput.nextElementSibling;

    noiseEnabledToggle.addEventListener('change', (e) => {
        perlinNoiseGenerator.updateParameters( // Renamed usage
            parseFloat(noiseScaleInput.value),
            parseFloat(heightScaleInput.value),
            e.target.checked
        );
        generateTerrain();
    });

    noiseScaleInput.addEventListener('input', (e) => {
        perlinNoiseGenerator.updateParameters( // Renamed usage
            parseFloat(e.target.value),
            parseFloat(heightScaleInput.value),
            noiseEnabledToggle.checked
        );
        noiseScaleValue.textContent = parseFloat(e.target.value).toFixed(1);
        generateTerrain();
    });

    heightScaleInput.addEventListener('input', (e) => {
        perlinNoiseGenerator.updateParameters( // Renamed usage
            parseFloat(noiseScaleInput.value),
            parseFloat(e.target.value),
            noiseEnabledToggle.checked
        );
        heightScaleValue.textContent = parseFloat(e.target.value).toFixed(1);
        generateTerrain();
    });

    createPlane();
    generateTerrain();
    animate();

    // Handle window resizing
    window.addEventListener('resize', onWindowResize, false);
}

function createPlane() {
    const segments = globalSettings.getMeshDetail();
    const geometry = new THREE.PlaneGeometry(1000, 1000, segments, segments);
    geometry.rotateX(-Math.PI / 2); // Rotate to be flat on XZ plane

    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00, flatShading: true }); // Use PhongMaterial for lighting

    planeMesh = new THREE.Mesh(geometry, material);
    scene.add(planeMesh);
}

function updatePlaneGeometry(segments) {
    if (planeMesh) {
        scene.remove(planeMesh);
        planeMesh.geometry.dispose(); // Dispose old geometry to free up memory
    }
    const geometry = new THREE.PlaneGeometry(1000, 1000, segments, segments);
    geometry.rotateX(-Math.PI / 2);
    planeMesh = new THREE.Mesh(geometry, planeMesh.material);
    scene.add(planeMesh);
}

function generateTerrain() {
    const geometry = planeMesh.geometry;
    const positionAttribute = geometry.attributes.position;
    const vertexCount = positionAttribute.count;
    // Calculate segments based on vertex count for square plane
    const segments = Math.sqrt(vertexCount) - 1;

    // Generate height maps from both generators
    const voronoiHeightMap = voronoiGenerator.generateHeightMap(segments + 1, segments + 1);
    const noiseHeightMap = perlinNoiseGenerator.generateHeightMap(segments + 1, segments + 1); // Renamed usage

    // Combine heights
    for (let i = 0; i < vertexCount; i++) {
        // Add Voronoi height and noise height
        positionAttribute.setY(i, voronoiHeightMap[i] + noiseHeightMap[i]);
    }
    positionAttribute.needsUpdate = true; // Tell Three.js that the vertex positions have changed
    geometry.computeVertexNormals(); // Recalculate normals for correct lighting
}

function animate() {
    requestAnimationFrame(animate);
    controls.update(); // only required if controls.enableDamping is set to true
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Panel Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
    const terrainOptionsToggle = document.getElementById('terrain-options-toggle');
    const terrainOptionsPanel = document.getElementById('terrain-options-panel');
    const terrainOptionsClose = document.getElementById('terrain-options-close');

    terrainOptionsToggle.addEventListener('click', () => {
        terrainOptionsPanel.classList.add('active');
    });

    terrainOptionsClose.addEventListener('click', () => {
        terrainOptionsPanel.classList.remove('active');
    });

    // Accordion functionality for panel sections
    document.querySelectorAll('.panel-section .section-header').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.closest('.panel-section');
            section.classList.toggle('active');
        });
    });

    // Initialize the Three.js scene and terrain generation
    init();
});