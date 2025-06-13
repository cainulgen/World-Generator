// main.js
// Basic Three.js setup
let scene, camera, renderer, controls;
let planeMesh;
let perlinNoiseGenerator;
let globalSettings;
let voronoiGenerator;

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 400, 400);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    // OrbitControls for camera interaction
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.listenToKeyEvents(window);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 100;
    controls.maxDistance = 1000;
    controls.maxPolarAngle = Math.PI / 2;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(200, 500, 300);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Initialize generators (they also populate their UI in their constructors)
    globalSettings = new GlobalSettings();
    voronoiGenerator = new VoronoiGenerator();
    perlinNoiseGenerator = new PerlinNoiseGenerator(); // PerlinNoiseGenerator UI is handled here

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

    // Event listeners for Perlin Noise & Distortion panel
    // These elements exist in index.html, so we can set up listeners directly
    const noiseEnabledToggle = document.getElementById('noiseEnabled');
    const noiseScaleInput = document.getElementById('noiseScale');
    const heightScaleInput = document.getElementById('heightScale');
    const octavesInput = document.getElementById('octaves');
    const persistenceInput = document.getElementById('persistence');
    const lacunarityInput = document.getElementById('lacunarity');

    const noiseScaleValue = noiseScaleInput.nextElementSibling;
    const heightScaleValue = heightScaleInput.nextElementSibling;
    const octavesValue = octavesInput.nextElementSibling;
    const persistenceValue = persistenceInput.nextElementSibling;
    const lacunarityValue = lacunarityInput.nextElementSibling;


    // Helper function to update all Perlin Noise parameters and regenerate terrain
    function updatePerlinNoiseAndGenerate() {
        perlinNoiseGenerator.updateParameters(
            parseFloat(noiseScaleInput.value),
            parseFloat(heightScaleInput.value),
            noiseEnabledToggle.checked,
            parseInt(octavesInput.value),
            parseFloat(persistenceInput.value),
            parseFloat(lacunarityInput.value)
        );
        generateTerrain();
    }

    // Set initial values on UI to match generator defaults (important for first render)
    noiseScaleInput.value = perlinNoiseGenerator.scale;
    noiseScaleValue.textContent = perlinNoiseGenerator.scale.toFixed(1);
    heightScaleInput.value = perlinNoiseGenerator.heightScale;
    heightScaleValue.textContent = perlinNoiseGenerator.heightScale.toFixed(1);
    noiseEnabledToggle.checked = perlinNoiseGenerator.enabled;
    octavesInput.value = perlinNoiseGenerator.octaves;
    octavesValue.textContent = perlinNoiseGenerator.octaves;
    persistenceInput.value = perlinNoiseGenerator.persistence;
    persistenceValue.textContent = perlinNoiseGenerator.persistence.toFixed(2);
    lacunarityInput.value = perlinNoiseGenerator.lacunarity;
    lacunarityValue.textContent = perlinNoiseGenerator.lacunarity.toFixed(1);


    // Add event listeners for Perlin noise controls
    noiseEnabledToggle.addEventListener('change', updatePerlinNoiseAndGenerate);
    noiseScaleInput.addEventListener('input', (e) => {
        noiseScaleValue.textContent = parseFloat(e.target.value).toFixed(1);
        updatePerlinNoiseAndGenerate();
    });
    heightScaleInput.addEventListener('input', (e) => {
        heightScaleValue.textContent = parseFloat(e.target.value).toFixed(1);
        updatePerlinNoiseAndGenerate();
    });
    octavesInput.addEventListener('input', (e) => {
        octavesValue.textContent = parseInt(e.target.value);
        updatePerlinNoiseAndGenerate();
    });
    persistenceInput.addEventListener('input', (e) => {
        persistenceValue.textContent = parseFloat(e.target.value).toFixed(2);
        updatePerlinNoiseAndGenerate();
    });
    lacunarityInput.addEventListener('input', (e) => {
        lacunarityValue.textContent = parseFloat(e.target.value).toFixed(1);
        updatePerlinNoiseAndGenerate();
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
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00, flatShading: true });

    planeMesh = new THREE.Mesh(geometry, material);
    scene.add(planeMesh);
}

function updatePlaneGeometry(segments) {
    if (planeMesh) {
        scene.remove(planeMesh);
        planeMesh.geometry.dispose();
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
    const segments = Math.sqrt(vertexCount) - 1;

    const voronoiHeightMap = voronoiGenerator.generateHeightMap(segments + 1, segments + 1);
    const noiseHeightMap = perlinNoiseGenerator.generateHeightMap(segments + 1, segments + 1);

    for (let i = 0; i < vertexCount; i++) {
        positionAttribute.setY(i, voronoiHeightMap[i] + noiseHeightMap[i]);
    }
    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Panel Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
    // Call init here to ensure all UI components are initialized and injected into the DOM
    init(); // Moved init() call here, at the start of DOMContentLoaded

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
    // This must run *after* the sections have been populated by the generator constructors
    document.querySelectorAll('.panel-section .section-header').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.closest('.panel-section');
            section.classList.toggle('active');
        });
    });
});