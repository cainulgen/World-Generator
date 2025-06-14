import { setupScene, animate } from './scene.js';
import { setupUI } from './ui.js';

// --- INITIALIZATION ---
function init() {
    // 1. Setup the basic 3D scene, camera, and renderer
    setupScene();
    
    // 2. Setup all UI controls, event listeners, and initial landscape generation
    setupUI();
    
    // 3. Start the animation loop
    animate();
}

// Run the application
init();