import { sceneState } from './scene.js';
import { palettes } from './config.js';
import { mulberry32, Perlin } from './utils.js';

// --- STATE ---
const terrainPerlin = new Perlin();
const colorPerlin = new Perlin();
const clusterPerlin = new Perlin();
const rockColorPerlin = new Perlin();
let rockSites = [];
let rockDelaunay = null;

/**
 * Main function to generate or regenerate the landscape mesh.
 * @param {object} settings - The settings object gathered from the UI.
 */
export function generateLandscape(settings) {
    const { scene } = sceneState;
    if (sceneState.mesh) {
        scene.remove(sceneState.mesh);
        sceneState.mesh.geometry.dispose();
        if (Array.isArray(sceneState.mesh.material)) {
            sceneState.mesh.material.forEach(m => m.dispose());
        } else {
            sceneState.mesh.material.dispose();
        }
    }

    let seed = parseInt(settings.seed);
    if (isNaN(seed)) {
        seed = Math.floor(Math.random() * 1000000);
        document.getElementById('seed').value = seed; // Update DOM for consistency
    }

    terrainPerlin.seed(seed);
    colorPerlin.seed(seed + 1);
    clusterPerlin.seed(seed + 3);
    rockColorPerlin.seed(seed + 4);
    const rockPrng = mulberry32(seed + 2);
    
    const currentPalette = palettes[settings.paletteId];

    // Generate rock sites
    rockSites = [];
    rockDelaunay = null;
    if (settings.rocksEnabled) {
        const effectiveRockSize = settings.rockSize * settings.rockScale;
        if (settings.clusteringEnabled) {
            const step = Math.max(10, effectiveRockSize / 4);
            for (let x = -settings.worldSize / 2; x < settings.worldSize / 2; x += step) {
                for (let y = -settings.worldSize / 2; y < settings.worldSize / 2; y += step) {
                    const noiseVal = (clusterPerlin.get(x / settings.clusterScale, y / settings.clusterScale) + 1) / 2;
                    if (noiseVal > settings.clusterThreshold && rockPrng() < settings.rockDensity) {
                        rockSites.push({ x: x + (rockPrng() - 0.5) * step, y: y + (rockPrng() - 0.5) * step, height: settings.rockMinHeight + rockPrng() * (settings.rockMaxHeight - settings.rockMinHeight) });
                    }
                }
            }
        } else {
            const numSites = Math.floor((settings.worldSize * settings.worldSize * settings.rockDensity) / (effectiveRockSize * effectiveRockSize * Math.PI));
            for(let i=0; i<numSites; i++) {
                rockSites.push({ x: (rockPrng() * settings.worldSize) - settings.worldSize / 2, y: (rockPrng() * settings.worldSize) - settings.worldSize / 2, height: settings.rockMinHeight + rockPrng() * (settings.rockMaxHeight - settings.rockMinHeight) });
            }
        }
        if (rockSites.length > 0) {
            rockDelaunay = d3.Delaunay.from(rockSites.map(s => [s.x, s.y]));
        }
    }
    
    const geometry = new THREE.PlaneGeometry(settings.worldSize, settings.worldSize, settings.detailLevel, settings.detailLevel);
    const vertices = geometry.attributes.position;
    const colors = new Float32Array(vertices.count * 3);
    let maxGeneratedHeight = -Infinity, minGeneratedHeight = Infinity;

    // First pass: Calculate height for all vertices
    for (let i = 0; i < vertices.count; i++) {
        const height = calculateHeight(vertices.getX(i), vertices.getY(i), settings);
        vertices.setZ(i, height);
        if (height > maxGeneratedHeight) maxGeneratedHeight = height;
        if (height < minGeneratedHeight) minGeneratedHeight = height;
    }

    // Second pass: Calculate colors based on final height range
    const colorNoiseScale = 50 / settings.textureDetail;
    const rockColorNoiseScale = 75 / settings.textureDetail;

    for (let i = 0; i < vertices.count; i++) {
        const height = vertices.getZ(i);
        const range = maxGeneratedHeight - minGeneratedHeight;
        let normalizedHeight = -1 + (2 * (height - minGeneratedHeight) / (range || 1));
        normalizedHeight += colorPerlin.get(vertices.getX(i) / colorNoiseScale, vertices.getY(i) / colorNoiseScale) * 0.1;
        
        let finalColor = getColorFromPalette(Math.max(-1.0, Math.min(1.0, normalizedHeight)), currentPalette.colors);
        
        const rockFactor = getRockBumpFactor(vertices.getX(i), vertices.getY(i), settings) / (settings.rockMaxHeight * settings.rockScale);
        if (rockFactor > 0.01 && currentPalette.rockColors && currentPalette.rockColors.length > 0) {
            const rockPalette = currentPalette.rockColors;
            const rockColorNoise = (rockColorPerlin.get(vertices.getX(i) / rockColorNoiseScale, vertices.getY(i) / rockColorNoiseScale) + 1) / 2;
            const rockColorIndex = Math.floor(rockColorNoise * rockPalette.length);
            const targetRockColor = rockPalette[rockColorIndex % rockPalette.length];
            finalColor.lerp(targetRockColor, Math.min(1, rockFactor * 1.5));
        }
        
        finalColor.toArray(colors, i * 3);
    }
    
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    sceneState.mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0.1 }));
    sceneState.mesh.rotation.x = -Math.PI / 2;
    scene.add(sceneState.mesh);
}

// --- TERRAIN CALCULATION HELPERS ---

function calculateHeight(x, y, settings) {
    let noiseVal = (settings.noiseType === 'standard')
        ? terrainPerlin.get(x / settings.noiseScale, y / settings.noiseScale)
        : ridgedFBM(x / settings.noiseScale, y / settings.noiseScale, settings);
        
    let height = noiseVal * settings.heightMultiplier;
    height += getRockBumpFactor(x, y, settings);

    if (settings.landFalloff < 1.0) {
        const plateauRadius = (settings.worldSize / 2) * settings.landFalloff;
        const maxRadius = settings.worldSize / 2;
        const distFromCenter = Math.sqrt(x * x + y * y);
        if (distFromCenter > plateauRadius && maxRadius > plateauRadius) {
            const falloffProgress = (distFromCenter - plateauRadius) / (maxRadius - plateauRadius);
            const smoothedFalloff = Perlin.prototype.smootherstep(Math.min(1.0, falloffProgress));
            height -= smoothedFalloff * (settings.heightMultiplier * 2.5);
        }
    }
    return height;
}

function ridgedFBM(x, y, settings) {
    const { ridgedOctaves, ridgedLacunarity, ridgedGain } = settings;
    let total = 0, f = 1.0, a = 1.0, w = 1.0;
    for (let i = 0; i < ridgedOctaves; i++) {
        let n = 1.0 - Math.abs(terrainPerlin.get(x * f, y * f));
        n *= n;
        n *= w;
        w = Math.max(0.0, Math.min(1.0, n * ridgedGain));
        total += n * a;
        f *= ridgedLacunarity;
        a *= ridgedGain;
    }
    return total;
}

function getRockBumpFactor(x, y, settings) {
    if (!settings.rocksEnabled || !rockDelaunay) return 0;
    const siteIndex = rockDelaunay.find(x, y);
    if (siteIndex === undefined) return 0;

    const site = rockSites[siteIndex];
    const dx = site.x - x;
    const dy = site.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const effectiveCellSize = settings.rockSize * settings.rockScale;
    let falloff = Math.min(1.0, dist / effectiveCellSize);
    let rockBumpFactor = 0;

    if (settings.rockStyle === 'angular' || settings.rockStyle === 'voronoi') {
        if (falloff < settings.mesaFlatness) {
            rockBumpFactor = 1.0;
        } else {
            const edgeRegion = 1.0 - settings.mesaFlatness;
            const progressInEdge = (falloff - settings.mesaFlatness) / (edgeRegion > 0.001 ? edgeRegion : 1);
            rockBumpFactor = 1.0 - Math.pow(progressInEdge, settings.rockFalloff);
        }
    } else { // Smooth style
        falloff = Math.pow(falloff, settings.rockFalloff);
        rockBumpFactor = 1.0 - Perlin.prototype.smootherstep(falloff);
    }
    return Math.max(0, rockBumpFactor) * site.height * settings.rockScale;
}

function getColorFromPalette(height, palette) {
    for (let i = 0; i < palette.length - 1; i++) {
        if (height >= palette[i].stop && height <= palette[i + 1].stop) {
            const t = (height - palette[i].stop) / (palette[i + 1].stop - palette[i].stop);
            return new THREE.Color().lerpColors(palette[i].color, palette[i + 1].color, t);
        }
    }
    return palette[palette.length - 1].color;
}