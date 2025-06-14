import * as THREE from 'https://cdn.skypack.dev/three@0.129.0';
import { scene, camera, renderer, controls, plane } from './scene.js';

// --- UI Elements ---
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const collapsibles = document.getElementsByClassName("collapsible-header");
const meshDetailSlider = document.getElementById('mesh-detail');
const meshDetailValue = document.getElementById('mesh-detail-value');

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

    // Dispose of the old geometry to free up memory
    plane.geometry.dispose();
    
    // Create new geometry with updated detail and apply it to the plane
    plane.geometry = new THREE.PlaneGeometry(10, 10, detail, detail);
});


// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();