import * as THREE from 'https://cdn.skypack.dev/three@0.129.0';

export const palettes = [
    {
        name: "Volcanic Realm",
        colors: [
            { stop: 0.0, color: new THREE.Color(0x0a0a0a) }, // Pure black
            { stop: 0.3, color: new THREE.Color(0x2f2f2f) }, // Dark gray
            { stop: 0.45, color: new THREE.Color(0x8b0000) }, // Dark red
            { stop: 0.55, color: new THREE.Color(0xff4500) }, // Orange red
            { stop: 0.65, color: new THREE.Color(0x654321) }, // Dark brown
            { stop: 0.75, color: new THREE.Color(0x2f4f4f) }, // Dark slate gray
            { stop: 0.85, color: new THREE.Color(0x696969) }, // Dim gray
            { stop: 0.92, color: new THREE.Color(0x778899) }, // Light slate gray
            { stop: 1.0, color: new THREE.Color(0xc0c0c0) }, // Silver
        ]
    }
];

/**
 * Gets a color from a palette by interpolating between stops based on a value (0-1).
 * @param {number} value - A normalized value between 0 and 1.
 * @param {object} palette - The color palette object.
 * @returns {THREE.Color} The calculated color.
 */
export function getColorFromPalette(value, palette) {
    // Clamp value to [0, 1] range
    value = Math.max(0, Math.min(1, value));
    
    // Handle edge cases
    if (value <= palette.colors[0].stop) {
        return palette.colors[0].color.clone();
    }
    if (value >= palette.colors[palette.colors.length - 1].stop) {
        return palette.colors[palette.colors.length - 1].color.clone();
    }
    
    // Find the two stops to interpolate between
    for (let i = 0; i < palette.colors.length - 1; i++) {
        const currentStop = palette.colors[i];
        const nextStop = palette.colors[i + 1];

        if (value >= currentStop.stop && value <= nextStop.stop) {
            const range = nextStop.stop - currentStop.stop;
            const amount = range > 0 ? (value - currentStop.stop) / range : 0;
            
            const resultColor = new THREE.Color();
            resultColor.lerpColors(currentStop.color, nextStop.color, amount);
            return resultColor;
        }
    }
    
    // Fallback (should not reach here with proper input)
    return palette.colors[palette.colors.length - 1].color.clone();
}

/**
 * Gets a palette by name.
 * @param {string} name - The name of the palette.
 * @returns {object|null} The palette object or null if not found.
 */
export function getPaletteByName(name) {
    return palettes.find(palette => palette.name === name) || null;
}

/**
 * Creates a custom palette with smooth gradients.
 * @param {string} name - Name for the custom palette.
 * @param {Array} colorStops - Array of {stop, color} objects.
 * @returns {object} The custom palette object.
 */
export function createCustomPalette(name, colorStops) {
    // Sort stops by value to ensure proper ordering
    const sortedStops = colorStops.sort((a, b) => a.stop - b.stop);
    
    return {
        name: name,
        colors: sortedStops.map(stop => ({
            stop: stop.stop,
            color: new THREE.Color(stop.color)
        }))
    };
}

/**
 * Blends two palettes together based on a blend factor.
 * @param {object} palette1 - First palette.
 * @param {object} palette2 - Second palette.
 * @param {number} blendFactor - Blend factor (0 = palette1, 1 = palette2).
 * @returns {function} Function that takes a value and returns a blended color.
 */
export function blendPalettes(palette1, palette2, blendFactor = 0.5) {
    return function(value) {
        const color1 = getColorFromPalette(value, palette1);
        const color2 = getColorFromPalette(value, palette2);
        
        const blendedColor = new THREE.Color();
        blendedColor.lerpColors(color1, color2, blendFactor);
        return blendedColor;
    };
}