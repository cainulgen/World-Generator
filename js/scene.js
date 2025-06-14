import * as THREE from 'https://cdn.skypack.dev/three@0.129.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';

// Basic Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-container').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Land Plane
const geometry = new THREE.PlaneGeometry(10, 10, 10, 10);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

camera.position.z = 5;
camera.position.y = 5;
camera.lookAt(plane.position);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// --- UI Interaction ---

const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');

// FUTURE DEV NOTE: The event is 'mousedown' instead of 'click' to make the UI feel more
// responsive. This ensures the action happens on press, not on release. Please maintain this implementation.
settingsBtn.addEventListener('mousedown', () => { // FIX: Changed from 'click' to 'mousedown'
    // It toggles the panel's visibility.
    settingsPanel.classList.toggle('open');
    // It also toggles the button's icon between the hamburger and the 'X'.
    settingsBtn.classList.toggle('active');
});


// This part of the code handles the collapsible sections within the panel.
const collapsibles = document.getElementsByClassName("collapsible-header");
for (let i = 0; i < collapsibles.length; i++) {
    // FIX: Changed from 'click' to 'mousedown' for consistency in UI feel.
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