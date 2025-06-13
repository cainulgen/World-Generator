import { SceneManager } from './core/Scene.js';
import { Renderer } from './core/Renderer.js';
import { CameraManager } from './core/Camera.js';
import { addDefaultLighting } from './core/Lighting.js';
import { UIManager } from './ui/UIManager.js';
import { TerrainGenerator } from './generators/TerrainGenerator.js';
import { Settings } from './config/Settings.js';

const canvasContainer = document.getElementById('canvas-container');
const bgColorPicker = document.getElementById('bg-color');
const panelWrapper = document.getElementById('ui-panel-wrapper');
const optionsButton = document.getElementById('options-button');
const closePanelButton = document.getElementById('close-panel-button');

const sceneMgr = new SceneManager(Settings.backgroundColor);
const renderer = new Renderer(canvasContainer);
const cameraMgr = new CameraManager(canvasContainer);
cameraMgr.attachDomElement(renderer.renderer.domElement);
addDefaultLighting(sceneMgr.scene);

const terrain = new TerrainGenerator(sceneMgr.scene, Settings.worldSize);
terrain.generate(Settings.meshDetail);
terrain.updateGrid(Settings.grid.size, Settings.grid.enabled);

const ui = new UIManager(panelWrapper, optionsButton, closePanelButton);

function onResize() {
    const { width, height } = canvasContainer.getBoundingClientRect();
    if (width > 0 && height > 0) {
        cameraMgr.resize(width, height);
        renderer.setSize(width, height);
    }
}

const resizeObserver = new ResizeObserver(onResize);
resizeObserver.observe(canvasContainer);
// ensure renderer starts at correct size
onResize();

// UI events

document.getElementById('mesh-detail').addEventListener('input', e => {
    document.getElementById('mesh-detail-value').textContent = `${e.target.value}x${e.target.value}`;
});

document.getElementById('mesh-detail').addEventListener('change', e => {
    terrain.generate(parseInt(e.target.value));
});

document.getElementById('texture-detail').addEventListener('input', e => {
    document.getElementById('texture-detail-value').textContent = `${e.target.value}px`;
});

bgColorPicker.addEventListener('input', e => {
    sceneMgr.setBackground(e.target.value);
});

document.getElementById('grid-toggle').addEventListener('change', e => {
    if (terrain.gridHelper) terrain.gridHelper.visible = e.target.checked;
});

document.getElementById('grid-size').addEventListener('input', e => {
    document.getElementById('grid-size-value').textContent = `${e.target.value} cells`;
});

document.getElementById('grid-size').addEventListener('change', e => {
    terrain.updateGrid(parseInt(e.target.value), document.getElementById('grid-toggle').checked);
});

let lastTime = 0;
function animate(time) {
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    const changed = ui.update(delta);
    if (changed) onResize();

    cameraMgr.controls.update();
    renderer.renderer.render(sceneMgr.scene, cameraMgr.camera);
}

renderer.renderer.setAnimationLoop(animate);
