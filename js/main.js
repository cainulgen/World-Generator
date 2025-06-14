import * as THREE from 'https://cdn.skypack.dev/three@0.129.0';
import { createNoise2D } from 'https://cdn.skypack.dev/simplex-noise';
import { scene, camera, renderer, controls, plane, wireframeMaterial, solidMaterial } from './scene.js';
import { palettes, getColorFromPalette } from './colors.js';

// --- UI Elements ---
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const collapsibles = document.getElementsByClassName("collapsible-header");
const meshDetailSlider = document.getElementById('mesh-detail');
const meshDetailValue = document.getElementById('mesh-detail-value');
const noiseScaleSlider = document.getElementById('noise-scale');
const noiseScaleValue = document.getElementById('noise-scale-value');
const noiseHeightSlider = document.getElementById('noise-height');
const noiseHeightValue = document.getElementById('noise-height-value');
const wireframeToggle = document.getElementById('wireframe-toggle');
const colorPaletteContainer = document.getElementById('color-palette-container');

// --- State ---
let activePalette = palettes[0]; // Set the first palette as default

// --- Noise Generator ---
const noise2D = createNoise2D();

// --- Color Application ---
function applyColors() {
    const positions = plane.geometry.attributes.position.array;
    const colors = new Float32Array(positions.length);

    // Find the actual min and max height in the current geometry for accurate normalization
    let minHeight = Infinity;
    let maxHeight = -Infinity;
    for (let i = 2; i < positions.length; i += 3) {
        const h = positions[i];
        if (h < minHeight) minHeight = h;
        if (h > maxHeight) maxHeight = h;
    }
    const heightRange = (maxHeight - minHeight === 0) ? 1 : (maxHeight - minHeight);

    // Apply colors based on normalized height
    for (let i = 0; i < positions.length; i += 3) {
        const height = positions[i + 2];
        const normalizedHeight = (height - minHeight) / heightRange;
        const color = getColorFromPalette(normalizedHeight, activePalette);

        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }

    plane.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

// --- Terrain Generation ---
function generateTerrain() {
    const scale = parseFloat(noiseScaleSlider.value);
    const amplitude = parseFloat(noiseHeightSlider.value);
    const vertices = plane.geometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        vertices[i + 2] = noise2D(x / scale, y / scale) * amplitude;
    }

    plane.geometry.attributes.position.needsUpdate = true;
    plane.geometry.computeVertexNormals();
    
    // After generating new heights, apply the colors
    applyColors();
}

// --- UI Initialization ---
function populateColorUI() {
    palettes.forEach((palette, index) => {
        const container = document.createElement('div');
        container.classList.add('radio-item');

        const input = document.createElement('input');
        input.type = 'radio';
        input.id = `palette-${index}`;
        input.name = 'color-palette';
        input.value = index;
        if (index === 0) input.checked = true; // Default check

        const label = document.createElement('label');
        label.htmlFor = `palette-${index}`;
        label.textContent = palette.name;

        container.appendChild(input);
        container.appendChild(label);
        colorPaletteContainer.appendChild(container);

        input.addEventListener('change', () => {
            if (input.checked) {
                activePalette = palettes[index];
                applyColors(); // Re-apply colors without regenerating terrain
            }
        });
    });
}

// --- UI Event Listeners ---
settingsBtn.addEventListener('mousedown', () => {
    settingsPanel.classList.toggle('open');
    settingsBtn.classList.toggle('active');
});

for (let i = 0; i < collapsibles.length; i++) {
    collapsibles[i].addEventListener("mousedown", function() {
        this.classList.toggle("active");
        const content = this.nextElementSibling;
        content.style.display = (content.style.display === "block") ? "none" : "block";
    });
}

meshDetailSlider.addEventListener('input', () => {
    meshDetailValue.textContent = parseInt(meshDetailSlider.value);
});
meshDetailSlider.addEventListener('change', () => {
    const detail = parseInt(meshDetailSlider.value);
    plane.geometry.dispose();
    plane.geometry = new THREE.PlaneGeometry(10, 10, detail, detail);
    generateTerrain();
});

noiseScaleSlider.addEventListener('input', () => {
    noiseScaleValue.textContent = parseFloat(noiseScaleSlider.value).toFixed(1);
    generateTerrain();
});

noiseHeightSlider.addEventListener('input', () => {
    noiseHeightValue.textContent = parseFloat(noiseHeightSlider.value).toFixed(1);
    generateTerrain();
});

wireframeToggle.addEventListener('change', () => {
    plane.material = wireframeToggle.checked ? wireframeMaterial : solidMaterial;
});

// --- Initial Setup ---
populateColorUI();
generateTerrain();

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();