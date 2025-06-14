import * as THREE from 'https://cdn.skypack.dev/three@0.129.0';

export const palettes = [
    {
        name: "Photorealistic Terrain",
        colors: [
            { stop: 0.0, color: new THREE.Color(0x001122) }, // Deep ocean blue
            { stop: 0.15, color: new THREE.Color(0x003366) }, // Deep water
            { stop: 0.35, color: new THREE.Color(0x006699) }, // Shallow water
            { stop: 0.45, color: new THREE.Color(0x4da6d9) }, // Coastal water
            { stop: 0.48, color: new THREE.Color(0xf4e4bc) }, // Beach sand
            { stop: 0.5, color: new THREE.Color(0x8fbc8f) }, // Coastal grass
            { stop: 0.55, color: new THREE.Color(0x228b22) }, // Lowland forest
            { stop: 0.7, color: new THREE.Color(0x006400) }, // Dense forest
            { stop: 0.8, color: new THREE.Color(0x8b7355) }, // Mountain earth
            { stop: 0.85, color: new THREE.Color(0xa0522d) }, // Rocky terrain
            { stop: 0.9, color: new THREE.Color(0x696969) }, // Stone
            { stop: 0.95, color: new THREE.Color(0xf5f5dc) }, // Snow line
            { stop: 1.0, color: new THREE.Color(0xfffafa) }, // Peak snow
        ]
    },
    {
        name: "Alpine Majesty",
        colors: [
            { stop: 0.0, color: new THREE.Color(0x191970) }, // Midnight blue lakes
            { stop: 0.4, color: new THREE.Color(0x4682b4) }, // Alpine lake blue
            { stop: 0.48, color: new THREE.Color(0x2e8b57) }, // Valley green
            { stop: 0.52, color: new THREE.Color(0x228b22) }, // Forest green
            { stop: 0.65, color: new THREE.Color(0x9acd32) }, // Alpine meadow
            { stop: 0.75, color: new THREE.Color(0x8b4513) }, // Mountain brown
            { stop: 0.82, color: new THREE.Color(0x708090) }, // Slate gray
            { stop: 0.88, color: new THREE.Color(0x4682b4) }, // Blue-gray rock
            { stop: 0.94, color: new THREE.Color(0xe6e6fa) }, // Lavender snow
            { stop: 1.0, color: new THREE.Color(0xf0f8ff) }, // Pure white peaks
        ]
    },
    {
        name: "Tropical Paradise",
        colors: [
            { stop: 0.0, color: new THREE.Color(0x000080) }, // Navy deep
            { stop: 0.2, color: new THREE.Color(0x4169e1) }, // Royal blue
            { stop: 0.4, color: new THREE.Color(0x00bfff) }, // Deep sky blue
            { stop: 0.47, color: new THREE.Color(0x7fffd4) }, // Aquamarine
            { stop: 0.49, color: new THREE.Color(0xf5deb3) }, // Wheat sand
            { stop: 0.51, color: new THREE.Color(0x90ee90) }, // Light green
            { stop: 0.6, color: new THREE.Color(0x32cd32) }, // Lime green
            { stop: 0.75, color: new THREE.Color(0x006400) }, // Dark green
            { stop: 0.85, color: new THREE.Color(0x8b4513) }, // Saddle brown
            { stop: 0.92, color: new THREE.Color(0x2f4f4f) }, // Dark slate gray
            { stop: 1.0, color: new THREE.Color(0x708090) }, // Slate gray peaks
        ]
    },
    {
        name: "Desert Grandeur",
        colors: [
            { stop: 0.0, color: new THREE.Color(0x8b4513) }, // Saddle brown
            { stop: 0.25, color: new THREE.Color(0xd2691e) }, // Chocolate
            { stop: 0.45, color: new THREE.Color(0xdaa520) }, // Goldenrod
            { stop: 0.55, color: new THREE.Color(0xf4a460) }, // Sandy brown
            { stop: 0.65, color: new THREE.Color(0xcd853f) }, // Peru
            { stop: 0.75, color: new THREE.Color(0xa0522d) }, // Sienna
            { stop: 0.85, color: new THREE.Color(0x8b7355) }, // Burlywood
            { stop: 0.92, color: new THREE.Color(0x696969) }, // Dim gray
            { stop: 1.0, color: new THREE.Color(0xd3d3d3) }, // Light gray
        ]
    },
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
    },
    {
        name: "Mystical Highlands",
        colors: [
            { stop: 0.0, color: new THREE.Color(0x191970) }, // Midnight blue
            { stop: 0.35, color: new THREE.Color(0x483d8b) }, // Dark slate blue
            { stop: 0.48, color: new THREE.Color(0x2e8b57) }, // Sea green
            { stop: 0.55, color: new THREE.Color(0x6b8e23) }, // Olive drab
            { stop: 0.65, color: new THREE.Color(0x8fbc8f) }, // Dark sea green
            { stop: 0.75, color: new THREE.Color(0x9932cc) }, // Dark orchid
            { stop: 0.85, color: new THREE.Color(0x4b0082) }, // Indigo
            { stop: 0.92, color: new THREE.Color(0x6a5acd) }, // Slate blue
            { stop: 1.0, color: new THREE.Color(0xe6e6fa) }, // Lavender
        ]
    },
    {
        name: "Autumn Splendor",
        colors: [
            { stop: 0.0, color: new THREE.Color(0x2f4f4f) }, // Dark slate gray
            { stop: 0.4, color: new THREE.Color(0x8b4513) }, // Saddle brown
            { stop: 0.5, color: new THREE.Color(0xff8c00) }, // Dark orange
            { stop: 0.6, color: new THREE.Color(0xffa500) }, // Orange
            { stop: 0.7, color: new THREE.Color(0xdc143c) }, // Crimson
            { stop: 0.8, color: new THREE.Color(0x8b0000) }, // Dark red
            { stop: 0.85, color: new THREE.Color(0x654321) }, // Dark brown
            { stop: 0.9, color: new THREE.Color(0x696969) }, // Dim gray
            { stop: 1.0, color: new THREE.Color(0xd3d3d3) }, // Light gray
        ]
    },
    {
        name: "Frozen Tundra",
        colors: [
            { stop: 0.0, color: new THREE.Color(0x001122) }, // Deep ice blue
            { stop: 0.3, color: new THREE.Color(0x4682b4) }, // Steel blue
            { stop: 0.45, color: new THREE.Color(0x87ceeb) }, // Sky blue
            { stop: 0.5, color: new THREE.Color(0xf0f8ff) }, // Alice blue
            { stop: 0.6, color: new THREE.Color(0xe0e0e0) }, // Light gray
            { stop: 0.75, color: new THREE.Color(0xc0c0c0) }, // Silver
            { stop: 0.85, color: new THREE.Color(0x778899) }, // Light slate gray
            { stop: 0.92, color: new THREE.Color(0xf5f5f5) }, // White smoke
            { stop: 1.0, color: new THREE.Color(0xfffafa) }, // Snow
        ]
    },
    {
        name: "Emerald Coast",
        colors: [
            { stop: 0.0, color: new THREE.Color(0x000080) }, // Navy
            { stop: 0.2, color: new THREE.Color(0x006400) }, // Dark green
            { stop: 0.4, color: new THREE.Color(0x228b22) }, // Forest green
            { stop: 0.47, color: new THREE.Color(0x7cfc00) }, // Lawn green
            { stop: 0.49, color: new THREE.Color(0xf0e68c) }, // Khaki
            { stop: 0.52, color: new THREE.Color(0x90ee90) }, // Light green
            { stop: 0.65, color: new THREE.Color(0x32cd32) }, // Lime green
            { stop: 0.8, color: new THREE.Color(0x2e8b57) }, // Sea green
            { stop: 0.9, color: new THREE.Color(0x556b2f) }, // Dark olive green
            { stop: 1.0, color: new THREE.Color(0x8fbc8f) }, // Dark sea green
        ]
    },
    {
        name: "Martian Landscape",
        colors: [
            { stop: 0.0, color: new THREE.Color(0x2f1b14) }, // Deep rust
            { stop: 0.3, color: new THREE.Color(0x8b4513) }, // Saddle brown
            { stop: 0.5, color: new THREE.Color(0xcd853f) }, // Peru
            { stop: 0.65, color: new THREE.Color(0xdaa520) }, // Goldenrod
            { stop: 0.75, color: new THREE.Color(0xb22222) }, // Fire brick
            { stop: 0.85, color: new THREE.Color(0x8b0000) }, // Dark red
            { stop: 0.92, color: new THREE.Color(0x696969) }, // Dim gray
            { stop: 1.0, color: new THREE.Color(0xa0522d) }, // Sienna
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