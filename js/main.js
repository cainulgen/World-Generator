import * as THREE from 'https://cdn.skypack.dev/three@0.129.0';
import { createNoise2D } from 'https://cdn.skypack.dev/simplex-noise';
import { scene, camera, renderer, controls, plane, wireframeMaterial, solidMaterial } from './scene.js'; // Import materials

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


// --- Noise Generator ---
const noise2D = createNoise2D();

// --- Terrain Generation Function ---
function generateTerrain() {
    const scale = parseFloat(noiseScaleSlider.value);
    const amplitude = parseFloat(noiseHeightSlider.value);
    const vertices = plane.geometry.attributes.position.array;

    for (let i = 0; i <= vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];

        vertices[i + 2] = noise2D(x / scale, y / scale) * amplitude;
    }

    plane.geometry.attributes.position.needsUpdate = true;
    plane.geometry.computeVertexNormals();
}


// --- UI Event Listeners ---

// Toggle Settings Panel
settingsBtn.addEventListener('mousedown', () => {
    settingsPanel.classList.toggle('open');
    settingsBtn.classList.toggle('active');
});

// Accordion-style collapsible sections
for (let i = 0; i < collapsibles.length; i++) {
    collapsibles[i].addEventListener("mousedown", function() {
        this.classList.toggle("active");
        const content = this.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
}

// Mesh Detail Slider
meshDetailSlider.addEventListener('input', () => {
    const detail = parseInt(meshDetailSlider.value);
    meshDetailValue.textContent = detail;

    plane.geometry.dispose();
    plane.geometry = new THREE.PlaneGeometry(10, 10, detail, detail);
    
    generateTerrain();
});

// Noise Scale Slider
noiseScaleSlider.addEventListener('input', () => {
    const scale = parseFloat(noiseScaleSlider.value);
    noiseScaleValue.textContent = scale.toFixed(1);
    
    generateTerrain();
});

// Noise Height Slider
noiseHeightSlider.addEventListener('input', () => {
    const height = parseFloat(noiseHeightSlider.value);
    noiseHeightValue.textContent = height.toFixed(1);

    generateTerrain();
});

// Wireframe Toggle
wireframeToggle.addEventListener('change', () => {
    if (wireframeToggle.checked) {
        plane.material = wireframeMaterial;
    } else {
        plane.material = solidMaterial;
    }
});


// --- Initial Terrain Generation ---
generateTerrain();


// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();