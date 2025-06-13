// main.js
// Basic Three.js setup
let scene, camera, renderer, controls;
let planeMesh;
let perlinNoiseGenerator;
let globalSettings;
let voronoiGenerator;
let colorGenerator;

// Define a fixed, global height range for consistent coloring.
// This ensures that "sea level" is always at the same altitude.
const GLOBAL_MIN_HEIGHT = -100;
const GLOBAL_MAX_HEIGHT = 200;


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
    perlinNoiseGenerator = new PerlinNoiseGenerator();
    colorGenerator = new ColorGenerator();

    // Event listeners for settings changes
    document.addEventListener('globalSettingsChanged', (e) => {
        const { meshDetail } = e.detail;
        console.log('Global settings changed:', meshDetail);
        updatePlaneGeometry(meshDetail);
        generateTerrain();
    });

    document.addEventListener('voronoiSettingsChanged', (e) => {
        console.log('Voronoi settings changed');
        generateTerrain();
    });

    document.addEventListener('colorSettingsChanged', (e) => {
        console.log('Color settings changed');
        // Only the material needs updating, not the geometry
        updateTerrainMaterial();
    });

    // Event listeners for Perlin Noise & Distortion panel
    const noiseEnabledToggle = document.getElementById('noiseEnabled');
    const noiseScaleInput = document.getElementById('noiseScale');
    const heightScaleInput = document.getElementById('heightScale');
    const octavesInput = document.getElementById('octaves');
    const persistenceInput = document.getElementById('persistence');
    const lacunarityInput = document.getElementById('lacunarity');
    const isRidgedToggle = document.getElementById('isRidged');

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
            parseFloat(lacunarityInput.value),
            isRidgedToggle.checked
        );
        generateTerrain();
    }

    // Set initial values on UI to match generator defaults
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
    isRidgedToggle.checked = perlinNoiseGenerator.isRidged;


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
    isRidgedToggle.addEventListener('change', updatePerlinNoiseAndGenerate);


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

    // Use a standard material; color/texture will be controlled by updateTerrainMaterial
    const material = new THREE.MeshPhongMaterial({
        flatShading: true,
    });

    planeMesh = new THREE.Mesh(geometry, material);
    scene.add(planeMesh);
}

function updatePlaneGeometry(segments) {
    if (planeMesh) {
        // Dispose of the old geometry to free up memory
        planeMesh.geometry.dispose();
        // Create new geometry and assign it to the existing mesh
        planeMesh.geometry = new THREE.PlaneGeometry(1000, 1000, segments, segments);
        planeMesh.geometry.rotateX(-Math.PI / 2);
    }
}

function generateTerrain() {
    const geometry = planeMesh.geometry;
    const positionAttribute = geometry.attributes.position;
    const vertexCount = positionAttribute.count;
    const segments = Math.sqrt(vertexCount) - 1;

    // Generate heightmaps based on the mesh detail
    const voronoiHeightMap = voronoiGenerator.generateHeightMap(segments + 1, segments + 1);
    const noiseHeightMap = perlinNoiseGenerator.generateHeightMap(segments + 1, segments + 1);

    for (let i = 0; i < vertexCount; i++) {
        positionAttribute.setY(i, voronoiHeightMap[i] + noiseHeightMap[i]);
    }
    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();

    // After updating the geometry, update the material (color/texture)
    updateTerrainMaterial();
}

function updateTerrainMaterial() {
    const { enabled, paletteName, textureDetail } = colorGenerator.getSettings();
    const material = planeMesh.material;

    // If color is disabled, use a simple green color and remove any texture
    if (!enabled) {
        if (material.map) {
            material.map.dispose();
            material.map = null;
        }
        material.color.set(0x00ff00);
        material.needsUpdate = true;
        return;
    }

    // --- Generate a new texture for the terrain ---

    // 1. Generate height data at the desired texture resolution
    const texWidth = textureDetail;
    const texHeight = textureDetail;
    const voronoiTex = voronoiGenerator.generateHeightMap(texWidth, texHeight);
    const noiseTex = perlinNoiseGenerator.generateHeightMap(texWidth, texHeight);

    // 2. Combine height data
    const combinedHeightMap = new Float32Array(texWidth * texHeight);
    for (let i = 0; i < combinedHeightMap.length; i++) {
        const height = voronoiTex[i] + noiseTex[i];
        combinedHeightMap[i] = height;
    }

    // 3. Create the texture data array using the fixed global height range
    const heightRange = GLOBAL_MAX_HEIGHT - GLOBAL_MIN_HEIGHT;
    const palette = colorGenerator.palettes[paletteName];
    const textureData = new Uint8Array(texWidth * texHeight * 3); // *3 for R,G,B

    for (let i = 0; i < combinedHeightMap.length; i++) {
        const height = combinedHeightMap[i];
        
        // Normalize the height against the global range to get a value between 0 and 1.
        let alpha = (height - GLOBAL_MIN_HEIGHT) / heightRange;
        
        // Clamp the alpha value to ensure it's always within the [0, 1] range.
        alpha = Math.max(0, Math.min(1, alpha)); 

        const color = colorGenerator.getColorAt(palette, alpha);

        const index = i * 3;
        textureData[index] = color.r * 255;
        textureData[index + 1] = color.g * 255;
        textureData[index + 2] = color.b * 255;
    }
    
    // 4. Create and apply the new DataTexture
    if (material.map) material.map.dispose(); // Dispose old texture

    const texture = new THREE.DataTexture(textureData, texWidth, texHeight, THREE.RGBFormat);
    texture.needsUpdate = true;
    
    material.map = texture;
    material.color.set(0xffffff); // Use white so it doesn't tint the texture
    material.needsUpdate = true;
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
    const sceneContainer = document.getElementById('scene-container'); // Get scene container

    // IMPORTANT: Panel Toggle Logic - DO NOT MODIFY THIS SECTION WITHOUT CAREFUL REVIEW.
    // This handles the opening/closing of the side panel and the dynamic icon change
    // of the toggle button itself (from cog to 'X' and back).
    // The panel uses CSS transitions for smooth animation via the 'active' class.
    terrainOptionsToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents this click from bubbling up to the document click listener
        const icon = terrainOptionsToggle.querySelector('i'); // Get the Font Awesome icon element inside the button

        if (terrainOptionsPanel.classList.contains('active')) {
            // Panel is currently open, so close it
            terrainOptionsPanel.classList.remove('active');
            // Change icon from 'times' (X) back to 'cog'
            icon.classList.remove('fa-times');
            icon.classList.add('fa-cog');
            // Remove any state-specific classes from the toggle button if applied for styling
            terrainOptionsToggle.classList.remove('panel-open');
        } else {
            // Panel is currently closed, so open it
            terrainOptionsPanel.classList.add('active');
            // Change icon from 'cog' to 'times' (X)
            icon.classList.remove('fa-cog');
            icon.classList.add('fa-times');
            // Add a state-specific class for styling the toggle button when panel is open
            terrainOptionsToggle.classList.add('panel-open');
        }
    });

    // IMPORTANT: Click-outside-panel-to-close logic - DO NOT MODIFY WITHOUT CAREFUL REVIEW.
    // This listener closes the panel if a click occurs anywhere on the document
    // that is NOT inside the panel, the toggle button, OR the 3D scene container.
    document.addEventListener('click', (e) => {
        if (terrainOptionsPanel.classList.contains('active') &&
            !terrainOptionsPanel.contains(e.target) &&
            !terrainOptionsToggle.contains(e.target) &&
            !sceneContainer.contains(e.target)) { // <-- FIX: Prevent closing when clicking on the 3D scene
            // Panel is open and click was outside, so close it
            terrainOptionsPanel.classList.remove('active');
            // Reset the toggle button icon to 'cog' when closed by external click
            const icon = terrainOptionsToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-cog');
            // Remove state-specific class from toggle button
            terrainOptionsToggle.classList.remove('panel-open');
        }
    });

    // IMPORTANT: Prevent clicks inside panel from closing it - DO NOT MODIFY.
    // This prevents clicks *within* the panel's content from bubbling up to the
    // document's click listener and inadvertently closing the panel.
    terrainOptionsPanel.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // IMPORTANT: Accordion functionality for panel sections.
    // By default, all sections are initialized in an "active" (expanded) state directly in the HTML.
    // This logic handles the user-initiated toggling (collapsing/expanding) of these sections.
    // Do not add logic here that would automatically collapse panels, per user requirements.
    document.querySelectorAll('.panel-section .section-header').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.closest('.panel-section');
            section.classList.toggle('active');
        });
    });
});