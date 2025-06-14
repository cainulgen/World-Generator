import * as THREE from 'https://cdn.skypack.dev/three@0.129.0';

export const palettes = [
    {
        name: "Classic Terrestrial",
        colors: [
            { stop: 0.0, color: new THREE.Color(0x00008b) }, // Deep Water
            { stop: 0.45, color: new THREE.Color(0x0000CD) }, // Medium Blue Water
            { stop: 0.49, color: new THREE.Color(0xF0E68C) }, // Sand
            { stop: 0.52, color: new THREE.Color(0x228B22) }, // Forest Green
            { stop: 0.75, color: new THREE.Color(0x808080) }, // Grey Rock
            { stop: 0.9, color: new THREE.Color(0xFFFAFA) },  // Snow
        ]
    },
    {
        name: "Arid Desert",
        colors: [
            { stop: 0.0, color: new THREE.Color(0x8B4513) }, // Saddle Brown
            { stop: 0.48, color: new THREE.Color(0xD2B48C) }, // Tan
            { stop: 0.5, color: new THREE.Color(0xCD853F) }, // Peru
            { stop: 0.7, color: new THREE.Color(0xA0522D) }, // Sienna
            { stop: 0.9, color: new THREE.Color(0x8B7D6B) }, // Dark Khaki
        ]
    },
    {
        name: "Volcanic Ash",
        colors: [
            { stop: 0.0, color: new THREE.Color(0x1a1a1a) }, // Deep abyss
            { stop: 0.45, color: new THREE.Color(0x4d4d4d) }, // Dark gray
            { stop: 0.5, color: new THREE.Color(0x808080) }, // Gray
            { stop: 0.6, color: new THREE.Color(0xB22222) }, // Firebrick red hint
            { stop: 0.7, color: new THREE.Color(0x696969) }, // DimGray
            { stop: 0.9, color: new THREE.Color(0xDCDCDC) }, // Gainsboro white/ash
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
    for (let i = 0; i < palette.colors.length - 1; i++) {
        const currentStop = palette.colors[i];
        const nextStop = palette.colors[i + 1];

        if (value >= currentStop.stop && value <= nextStop.stop) {
            const range = nextStop.stop - currentStop.stop;
            const amount = (value - currentStop.stop) / range;
            
            const resultColor = new THREE.Color();
            resultColor.lerpColors(currentStop.color, nextStop.color, amount);
            return resultColor;
        }
    }
    return palette.colors[palette.colors.length - 1].color.clone();
}