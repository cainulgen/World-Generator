import { sceneState } from './scene.js';
import { generateLandscape } from './landscape.js';
import { palettes } from './config.js';

// --- STATE ---
let isPanelOpen = true;
let updateTimeout;
let randomPaletteCount = 0;
let lastHarmony = 'analogous';

// --- CORE FUNCTIONS ---

/**
 * Handles any change in a control input, triggering a regeneration.
 */
function handleControlChange(event) {
    if (event.target.type !== 'text' && event.target.type !== 'button') {
        updateValueDisplay(event.target);
    }
    if (event.target.id === 'rockMinHeight' || event.target.id === 'rockMaxHeight') {
        enforceMinMaxHeight();
    }
    updateAllToggles();
    clearTimeout(updateTimeout);
    // Pass the current DOM settings to the landscape generator
    updateTimeout = setTimeout(() => generateLandscape(getSettingsFromDOM()), 100);
}

/**
 * Reads all values from the DOM controls and returns them in a settings object.
 * @returns {object} The current settings from the UI.
 */
function getSettingsFromDOM() {
    return {
        seed: document.getElementById('seed').value,
        worldSize: parseInt(document.getElementById('worldSize').value),
        detailLevel: parseInt(document.getElementById('detailLevel').value),
        noiseScale: parseFloat(document.getElementById('noiseScale').value),
        heightMultiplier: parseFloat(document.getElementById('heightMultiplier').value),
        noiseType: document.getElementById('noiseType').value,
        paletteId: document.getElementById('colorPalette').value,
        landFalloff: parseFloat(document.getElementById('landFalloff').value),
        ridgedOctaves: parseInt(document.getElementById('ridgedOctaves').value),
        ridgedLacunarity: parseFloat(document.getElementById('ridgedLacunarity').value),
        ridgedGain: parseFloat(document.getElementById('ridgedGain').value),
        rocksEnabled: document.getElementById('enableRocks').checked,
        rockStyle: document.getElementById('rockStyle').value,
        rockDensity: parseFloat(document.getElementById('rockDensity').value),
        rockSize: parseFloat(document.getElementById('rockSize').value),
        rockMinHeight: parseFloat(document.getElementById('rockMinHeight').value),
        rockMaxHeight: parseFloat(document.getElementById('rockMaxHeight').value),
        mesaFlatness: parseFloat(document.getElementById('mesaFlatness').value),
        rockFalloff: parseFloat(document.getElementById('rockFalloff').value),
        rockScale: parseFloat(document.getElementById('rockScale').value),
        clusteringEnabled: document.getElementById('enableClustering').checked,
        clusterScale: parseFloat(document.getElementById('clusterScale').value),
        clusterThreshold: parseFloat(document.getElementById('clusterThreshold').value),
        textureDetail: parseFloat(document.getElementById('textureDetail').value),
        colorStops: parseInt(document.getElementById('colorStops').value),
        rockColorVariety: parseInt(document.getElementById('rockColorVariety').value),
        lockHarmony: document.getElementById('lockHarmony').checked,
    };
}


/**
 * Generates a new random color palette and applies it.
 */
function generateRandomPalette() {
    const settings = getSettingsFromDOM();
    const baseHue = Math.random();
    const baseSat = 0.5 + Math.random() * 0.4;
    const baseLight = 0.4 + Math.random() * 0.3;

    const newPalette = { colors: [], rockColors: [] };
    let harmony;
    if (settings.lockHarmony) {
        harmony = lastHarmony;
    } else {
        harmony = ['analogous', 'triadic', 'complementary'][Math.floor(Math.random() * 3)];
        lastHarmony = harmony;
    }

    let hues = [baseHue];
    if (harmony === 'analogous') { hues.push((baseHue + 0.083) % 1, (baseHue - 0.083 + 1) % 1); }
    else if (harmony === 'triadic') { hues.push((baseHue + 0.333) % 1, (baseHue - 0.333 + 1) % 1); }
    else { hues.push((baseHue + 0.5) % 1); }

    for (let i = 0; i < settings.colorStops; i++) {
        const stopPosition = -1.0 + (2.0 * i / (settings.colorStops - 1));
        const hue = hues[i % hues.length];
        const sat = baseSat * (0.8 + Math.random() * 0.4);
        const light = baseLight * (0.5 + Math.random() * 1.5);
        newPalette.colors.push({ stop: stopPosition, color: new THREE.Color().setHSL(hue, sat, light) });
    }
    newPalette.colors.sort((a, b) => a.stop - b.stop);

    const rockBaseHue = (baseHue + 0.5 + (Math.random() - 0.5) * 0.2) % 1;
    for (let i = 0; i < settings.rockColorVariety; i++) {
        newPalette.rockColors.push(new THREE.Color().setHSL(
            (rockBaseHue + (Math.random() - 0.5) * 0.1 + 1) % 1,
            baseSat * (0.2 + Math.random() * 0.3),
            baseLight * (0.4 + Math.random() * 0.4)
        ));
    }

    randomPaletteCount++;
    const paletteId = `random_${randomPaletteCount}`;
    const paletteName = `Random #${randomPaletteCount}`;
    palettes[paletteId] = newPalette;
    
    const select = document.getElementById('colorPalette');
    Array.from(select.options).forEach(opt => {
        if (opt.value.startsWith('random_')) {
            select.remove(opt.index);
        }
    });
    const newOption = new Option(paletteName, paletteId);
    select.add(newOption);
    select.value = paletteId;

    // Trigger regeneration by dispatching an input event
    const event = new Event('input', { bubbles: true });
    select.dispatchEvent(event);
}


function randomizeSettings() {
    const exclude = ['worldSize', 'detailLevel'];
    document.getElementById('seed').value = Math.floor(Math.random() * 1000000);
    
    document.querySelectorAll('input[type="range"]').forEach(s => {
        if (exclude.includes(s.id)) return;
        const min = parseFloat(s.min);
        const max = parseFloat(s.max);
        s.value = min + Math.random() * (max - min);
        updateValueDisplay(s);
    });

    document.querySelectorAll('select:not(#colorPalette)').forEach(s => {
        if (exclude.includes(s.id)) return;
        s.selectedIndex = Math.floor(Math.random() * s.options.length);
    });

    document.querySelectorAll('input[type="checkbox"]').forEach(c => {
        if (exclude.includes(c.id)) return;
        c.checked = Math.random() < 0.5;
    });

    enforceMinMaxHeight();
    updateAllToggles();
    generateRandomPalette(); // This will trigger the final landscape update
}


// --- UI HELPER FUNCTIONS ---

function enforceMinMaxHeight() {
    const min = document.getElementById('rockMinHeight');
    const max = document.getElementById('rockMaxHeight');
    if (parseFloat(min.value) > parseFloat(max.value)) {
        min.value = max.value;
    }
    updateValueDisplay(min);
    updateValueDisplay(max);
}

function updateValueDisplay(element) {
    const displaySpan = document.getElementById(element.id + 'Value');
    if (displaySpan) {
        let val = parseFloat(element.value);
        let dec = (element.step && element.step.includes('.')) ? element.step.split('.')[1].length : 0;
        displaySpan.textContent = val.toFixed(dec);
    }
}

function updateAllToggles() {
    const rockStyle = document.getElementById('rockStyle').value;
    const mesaControls = document.getElementById('mesa-controls');
    if (mesaControls) {
        mesaControls.style.display = (rockStyle === 'angular' || rockStyle === 'voronoi') ? 'block' : 'none';
    }
    
    const isStandard = document.getElementById('noiseType').value === 'standard';
    document.getElementById('standard-controls').style.display = isStandard ? 'block' : 'none';
    document.getElementById('ridged-controls').style.display = isStandard ? 'none' : 'block';
}

function updatePanelState() {
    const panelWidth = 320;
    const controlsEl = document.getElementById('controls');
    const container = document.getElementById('container');
    if (isPanelOpen) {
        controlsEl.classList.remove('closed');
        container.style.transform = `translateX(-${panelWidth / 2}px)`;
        document.getElementById('close-icon').classList.add('active');
        document.getElementById('menu-icon').classList.remove('active');
    } else {
        controlsEl.classList.add('closed');
        container.style.transform = 'translateX(0)';
        document.getElementById('close-icon').classList.remove('active');
        document.getElementById('menu-icon').classList.add('active');
    }
}


/**
 * Sets up all event listeners for