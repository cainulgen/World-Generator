import * as THREE from 'https://cdn.skypack.dev/three@0.129.0';
import { Delaunay } from 'https://cdn.skypack.dev/d3-delaunay@6';
import { scene, camera, renderer, controls, plane } from './scene.js';
import { palettes, getColorFromPalette } from './colors.js';

// --- UI Elements ---
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const collapsibles = document.getElementsByClassName("collapsible-header");
// Mesh
const meshDetailSlider = document.getElementById('mesh-detail');
const meshDetailValue = document.getElementById('mesh-detail-value');
const wireframeToggle = document.getElementById('wireframe-toggle');
// Terrain Noise
const noiseScaleSlider = document.getElementById('noise-scale');
const noiseScaleValue = document.getElementById('noise-scale-value');
const noiseHeightSlider = document.getElementById('noise-height');
const noiseHeightValue = document.getElementById('noise-height-value');
const ridgedNoiseToggle = document.getElementById('ridged-noise-toggle');
// Rock Formation
const rocksEnabledToggle = document.getElementById('rocks-enabled');
const rockStyleSelect = document.getElementById('rock-style');
const rockDensitySlider = document.getElementById('rock-density');
const rockDensityValue = document.getElementById('rock-density-value');
const rockSizeSlider = document.getElementById('rock-size');
const rockSizeValue = document.getElementById('rock-size-value');
const rockMinHeightSlider = document.getElementById('rock-min-height');
const rockMinHeightValue = document.getElementById('rock-min-height-value');
const rockMaxHeightSlider = document.getElementById('rock-max-height');
const rockMaxHeightValue = document.getElementById('rock-max-height-value');
const mesaFlatnessSlider = document.getElementById('mesa-flatness');
const mesaFlatnessValue = document.getElementById('mesa-flatness-value');
const rockFalloffSlider = document.getElementById('rock-falloff');
const rockFalloffValue = document.getElementById('rock-falloff-value');
const rockScaleSlider = document.getElementById('rock-scale');
const rockScaleValue = document.getElementById('rock-scale-value');
const clusteringEnabledToggle = document.getElementById('clustering-enabled');
const clusterScaleSlider = document.getElementById('cluster-scale');
const clusterScaleValue = document.getElementById('cluster-scale-value');
const clusterThresholdSlider = document.getElementById('cluster-threshold');
const clusterThresholdValue = document.getElementById('cluster-threshold-value');
const seedInput = document.getElementById('random-seed');
const randomizeSeedBtn = document.getElementById('randomize-seed-btn');
// Color
const colorPaletteContainer = document.getElementById('color-palette-container');
let activePalette = palettes[0];

// --- PERLIN & RANDOM LIBS (FROM YOUR CODE) ---
function mulberry32(a) { return function() { var t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; } }
const Perlin = function() { this.gradients = {}; this.memory = {}; this.prng = Math.random; };
Perlin.prototype = { rand_vect: function() { let theta = this.prng() * 2 * Math.PI; return { x: Math.cos(theta), y: Math.sin(theta) }; }, dot_prod_grid: function(x, y, vx, vy) { let g_vect; let d_vect = { x: x - vx, y: y - vy }; if (this.gradients[[vx, vy]]) { g_vect = this.gradients[[vx, vy]]; } else { g_vect = this.rand_vect(); this.gradients[[vx, vy]] = g_vect; } return d_vect.x * g_vect.x + d_vect.y * g_vect.y; }, smootherstep: function(x) { return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3; }, interp: function(x, a, b) { return a + this.smootherstep(x) * (b - a); }, seed: function(seedValue) { this.prng = seedValue ? mulberry32(seedValue) : Math.random; this.gradients = {}; this.memory = {}; }, get: function(x, y) { if (this.memory.hasOwnProperty([x, y])) return this.memory[[x, y]]; let xf = Math.floor(x); let yf = Math.floor(y); let tl = this.dot_prod_grid(x, y, xf, yf); let tr = this.dot_prod_grid(x, y, xf + 1, yf); let bl = this.dot_prod_grid(x, y, xf, yf + 1); let br = this.dot_prod_grid(x, y, xf + 1, yf + 1); let xt = this.interp(x - xf, tl, tr); let xb = this.interp(x - xf, bl, br); let v = this.interp(y - yf, xt, xb); this.memory[[x, y]] = v; return v; } };
const terrainNoise = new Perlin();
const rockColorNoise = new Perlin();
const clusterPerlin = new Perlin(); // Added for consistency with old project

// --- [ADDED] RIDGED NOISE FUNCTION FROM OLD PROJECT ---
function ridgedFBM(x, y, octaves, lacunarity, gain) {
    let total = 0, f = 1.0, a = 1.0, w = 1.0;
    for (let i = 0; i < octaves; i++) {
        let n = 1.0 - Math.abs(terrainNoise.get(x * f, y * f));
        n *= n;
        n *= w;
        w = Math.max(0.0, Math.min(1.0, n * gain));
        total += n * a;
        f *= lacunarity;
        a *= gain;
    }
    return total;
}

// --- [CORRECTED] ROCK GENERATION LOGIC ---
function generateRockData(seed, settings) {
    if (!settings.rocksEnabled) return { sites: [], delaunay: null };
    
    const rockPrng = mulberry32(seed + 2);
    clusterPerlin.seed(seed + 3);

    const rockSites = [];
    const effectiveRockSize = settings.rockSize * settings.rockScale;
    const worldSize = settings.worldSize;

    if (settings.clusteringEnabled) {
        // This grid-based approach matches your old project.
        // The step calculation is now proportional to the world size, fixing the bug.
        const minStep = worldSize * 0.005; // A minimum step of 0.5% of the world size.
        const step = Math.max(minStep, effectiveRockSize / 4); 
        
        for (let x = -worldSize / 2; x < worldSize / 2; x += step) {
            for (let y = -worldSize / 2; y < worldSize / 2; y += step) {
                const noiseVal = (clusterPerlin.get(x / settings.clusterScale, y / settings.clusterScale) + 1) / 2;
                if (noiseVal > settings.clusterThreshold && rockPrng() < settings.rockDensity) {
                    rockSites.push({ 
                        x: x + (rockPrng() - 0.5) * step, 
                        y: y + (rockPrng() - 0.5) * step, 
                        height: settings.rockMinHeight + rockPrng() * (settings.rockMaxHeight - settings.rockMinHeight) 
                    });
                }
            }
        }
    } else {
        const numSites = Math.floor((worldSize * worldSize * settings.rockDensity) / (Math.max(1, effectiveRockSize) * Math.max(1, effectiveRockSize) * Math.PI));
        for (let i = 0; i < numSites; i++) {
            rockSites.push({ 
                x: (rockPrng() * worldSize) - worldSize / 2, 
                y: (rockPrng() * worldSize) - worldSize / 2, 
                height: settings.rockMinHeight + rockPrng() * (settings.rockMaxHeight - settings.rockMinHeight) 
            });
        }
    }
    const delaunay = rockSites.length > 0 ? Delaunay.from(rockSites.map(s => [s.x, s.y])) : null;
    return { sites: rockSites, delaunay };
}


// --- ROCK SHAPING (UNMODIFIED, AS IT WAS ALREADY CORRECT) ---
function getRockHeightAndFactorAt(x, y, sites, delaunay, settings) {
    if (!delaunay || sites.length === 0) return { height: 0, factor: 0 };
    const siteIndex = delaunay.find(x, y);
    if (siteIndex === undefined) return { height: 0, factor: 0 };
    const site = sites[siteIndex];
    const dx = site.x - x;
    const dy = site.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const effectiveCellSize = settings.rockSize * settings.rockScale;
    let falloff = Math.min(1.0, dist / effectiveCellSize);
    let rockBumpFactor = 0;
    
    // This logic for mesa/smooth was identical in both projects.
    if (settings.rockStyle === 'angular' || settings.rockStyle === 'voronoi') {
        if (falloff < settings.mesaFlatness) {
            rockBumpFactor = 1.0;
        } else {
            const edgeRegion = 1.0 - settings.mesaFlatness;
            const progressInEdge = (falloff - settings.mesaFlatness) / (edgeRegion > 0.001 ? edgeRegion : 1);
            rockBumpFactor = 1.0 - Math.pow(progressInEdge, settings.rockFalloff);
        }
    } else { // 'smooth' style
        falloff = Math.pow(falloff, settings.rockFalloff);
        rockBumpFactor = 1.0 - Perlin.prototype.smootherstep(falloff);
    }
    
    const rockHeight = Math.max(0, rockBumpFactor) * site.height * settings.rockScale;
    const totalFactor = rockHeight / (Math.max(1, settings.rockMaxHeight * settings.rockScale)); // More reliable factor calculation
    
    return { height: rockHeight, factor: totalFactor };
}

// --- [UPDATED] MAIN GENERATION FUNCTION ---
function generateTerrain() {
    const seed = parseInt(seedInput.value, 10) || 0;
    terrainNoise.seed(seed);
    rockColorNoise.seed(seed + 1);

    const settings = {
        worldSize: plane.geometry.parameters.width,
        noiseScale: parseFloat(noiseScaleSlider.value),
        noiseHeight: parseFloat(noiseHeightSlider.value),
        
        noiseType: ridgedNoiseToggle.checked ? 'ridged' : 'standard',
        ridgedOctaves: 8,      
        ridgedLacunarity: 2.0, 
        ridgedGain: 0.5,       

        rocksEnabled: rocksEnabledToggle.checked,
        rockStyle: rockStyleSelect.value,
        rockDensity: parseFloat(rockDensitySlider.value),
        rockSize: parseFloat(rockSizeSlider.value),
        rockMinHeight: parseFloat(rockMinHeightSlider.value),
        rockMaxHeight: parseFloat(rockMaxHeightSlider.value),
        mesaFlatness: parseFloat(mesaFlatnessSlider.value),
        rockFalloff: parseFloat(rockFalloffSlider.value),
        rockScale: parseFloat(rockScaleSlider.value),
        clusteringEnabled: clusteringEnabledToggle.checked,
        clusterScale: parseFloat(clusterScaleSlider.value),
        clusterThreshold: parseFloat(clusterThresholdSlider.value),
    };

    // --- START OF FIX ---
    // Pre-warm the Perlin noise generator to ensure a deterministic gradient field.
    // This forces the gradients to be created in a consistent order, regardless of
    // the vertex order that comes from the THREE.PlaneGeometry.
    const maxGridCoord = Math.ceil((settings.worldSize / 2 / settings.noiseScale) + 1);
    for (let gy = -maxGridCoord; gy <= maxGridCoord; gy++) {
        for (let gx = -maxGridCoord; gx <= maxGridCoord; gx++) {
            // By calling .get() once for each grid cell, we force the underlying
            // random gradients to be calculated and cached in a fixed order.
            terrainNoise.get(gx, gy);
        }
    }
    // --- END OF FIX ---

    const { sites, delaunay } = generateRockData(seed, settings);
    const positions = plane.geometry.attributes.position.array;
    const colors = new Float32Array(positions.length);
    const vertexData = [];
    let minHeight = Infinity, maxHeight = -Infinity;

    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        
        let baseNoise;
        if (settings.noiseType === 'ridged') {
            baseNoise = ridgedFBM(x / settings.noiseScale, y / settings.noiseScale, settings.ridgedOctaves, settings.ridgedLacunarity, settings.ridgedGain);
        } else {
            baseNoise = terrainNoise.get(x / settings.noiseScale, y / settings.noiseScale);
        }
        const baseHeight = baseNoise * settings.noiseHeight;

        const { height: rockHeight, factor: rockFactor } = getRockHeightAndFactorAt(x, y, sites, delaunay, settings);
        const finalHeight = baseHeight + rockHeight;
        
        positions[i + 2] = finalHeight;
        vertexData.push({ height: finalHeight, rockFactor });
        if (finalHeight < minHeight) minHeight = finalHeight;
        if (finalHeight > maxHeight) maxHeight = finalHeight;
    }

    const heightRange = (maxHeight - minHeight === 0) ? 1 : (maxHeight - minHeight);
    for (let i = 0; i < vertexData.length; i++) {
        const { height, rockFactor } = vertexData[i];
        
        const normalizedHeight = -1 + (2 * (height - minHeight) / heightRange);
        const paletteT = (normalizedHeight + 1) / 2;
        
        let finalColor = getColorFromPalette(paletteT, activePalette);
        
        if (rockFactor > 0.01 && activePalette.rockColors.length > 0) {
            const rockColorNoiseVal = (rockColorNoise.get(positions[i * 3] / 5, positions[i * 3 + 1] / 5) + 1) / 2;
            const rockColorIndex = Math.floor(rockColorNoiseVal * activePalette.rockColors.length);
            const targetRockColor = activePalette.rockColors[rockColorIndex];
            finalColor.lerp(targetRockColor, Math.min(1, rockFactor * 1.5));
        }
        colors[i * 3] = finalColor.r;
        colors[i * 3 + 1] = finalColor.g;
        colors[i * 3 + 2] = finalColor.b;
    }
    plane.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    plane.geometry.attributes.position.needsUpdate = true;
    plane.geometry.computeVertexNormals();
}

// --- UI INITIALIZATION (UNMODIFIED) ---
function populateColorUI() {
    palettes.forEach((palette, index) => {
        const container = document.createElement('div');
        container.classList.add('radio-item');
        const input = document.createElement('input');
        input.type = 'radio';
        input.id = `palette-${index}`;
        input.name = 'color-palette';
        input.value = index;
        if (index === 0) input.checked = true;
        const label = document.createElement('label');
        label.htmlFor = `palette-${index}`;
        label.textContent = palette.name;
        container.appendChild(input);
        container.appendChild(label);
        colorPaletteContainer.appendChild(container);

        input.addEventListener('change', () => {
            if (input.checked) {
                activePalette = palettes[index];
                generateTerrain();
            }
        });
    });
}

// --- UI EVENT LISTENERS (UNMODIFIED) ---
function setupEventListeners() {
    settingsBtn.addEventListener('mousedown', () => { settingsPanel.classList.toggle('open'); settingsBtn.classList.toggle('active'); });

    for (let i = 0; i < collapsibles.length; i++) {
        collapsibles[i].addEventListener("mousedown", function() {
            this.classList.toggle("active");
            const content = this.nextElementSibling;
            content.style.display = (content.style.display === "block") ? "none" : "block";
        });
    }

    const simpleUpdate = () => generateTerrain();
    const sliders = [
        { el: noiseScaleSlider, valEl: noiseScaleValue, fixed: 1 }, { el: noiseHeightSlider, valEl: noiseHeightValue, fixed: 1 },
        { el: rockDensitySlider, valEl: rockDensityValue, fixed: 2 }, { el: rockSizeSlider, valEl: rockSizeValue, fixed: 1 },
        { el: rockMinHeightSlider, valEl: rockMinHeightValue, fixed: 1 }, { el: rockMaxHeightSlider, valEl: rockMaxHeightValue, fixed: 1 },
        { el: mesaFlatnessSlider, valEl: mesaFlatnessValue, fixed: 2 }, { el: rockFalloffSlider, valEl: rockFalloffValue, fixed: 1 },
        { el: rockScaleSlider, valEl: rockScaleValue, fixed: 1 }, { el: clusterScaleSlider, valEl: clusterScaleValue, fixed: 1 },
        { el: clusterThresholdSlider, valEl: clusterThresholdValue, fixed: 2 },
    ];
    sliders.forEach(s => s.el.addEventListener('input', () => { s.valEl.textContent = parseFloat(s.el.value).toFixed(s.fixed); simpleUpdate(); }));

    meshDetailSlider.addEventListener('input', () => { meshDetailValue.textContent = parseInt(meshDetailSlider.value); });
    meshDetailSlider.addEventListener('change', () => { const detail = parseInt(meshDetailSlider.value); plane.geometry.dispose(); plane.geometry = new THREE.PlaneGeometry(10, 10, detail, detail); simpleUpdate(); });

    wireframeToggle.addEventListener('change', () => {
        plane.material.wireframe = wireframeToggle.checked;
    });

    ridgedNoiseToggle.addEventListener('change', simpleUpdate);

    [rocksEnabledToggle, clusteringEnabledToggle, rockStyleSelect, seedInput].forEach(el => el.addEventListener('change', simpleUpdate));
    randomizeSeedBtn.addEventListener('mousedown', () => { seedInput.value = Math.floor(Math.random() * 100000); simpleUpdate(); });
}

// --- INITIALIZATION ---
populateColorUI();
setupEventListeners();
generateTerrain();
function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
animate();