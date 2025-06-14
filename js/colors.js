import * as THREE from 'https://cdn.skypack.dev/three@0.129.0';

export const palettes = [
    {
        name: "Alpine Meadow",
        colors: [
            { stop: 0.0, color: new THREE.Color("#4a5e3c") }, // Deep green
            { stop: 0.4, color: new THREE.Color("#6e8a57") }, // Lighter green
            { stop: 0.6, color: new THREE.Color("#a9a9a9") }, // Grey stone
            { stop: 0.8, color: new THREE.Color("#cccccc") }, // Lighter grey
            { stop: 1.0, color: new THREE.Color("#ffffff") }  // Snow white
        ],
        rockColors: [ new THREE.Color("#636363"), new THREE.Color("#808080") ]
    },
    {
        name: "Desert Oasis",
        colors: [
            { stop: 0.0, color: new THREE.Color("#d2b48c") }, // Tan sand
            { stop: 0.5, color: new THREE.Color("#c2a37c") }, // Darker sand
            { stop: 0.7, color: new THREE.Color("#8b4513") }, // Sienna
            { stop: 1.0, color: new THREE.Color("#a0522d") }  // Darker sienna
        ],
        rockColors: [ new THREE.Color("#8B7355"), new THREE.Color("#79654c") ]
    },
    {
        name: "Volcanic Ash",
        colors: [
            { stop: 0.0, color: new THREE.Color("#1a1a1a") }, // Black ash
            { stop: 0.3, color: new THREE.Color("#333333") }, // Dark grey
            { stop: 0.6, color: new THREE.Color("#ff4500") }, // Orange-red lava
            { stop: 1.0, color: new THREE.Color("#ff8c00") }  // Dark orange
        ],
        rockColors: [ new THREE.Color("#080808"), new THREE.Color("#1f1f1f") ]
    }
];

export function getColorFromPalette(t, palette) {
    for (let i = 1; i < palette.colors.length; i++) {
        const prev = palette.colors[i - 1];
        const curr = palette.colors[i];
        if (t <= curr.stop) {
            const range = curr.stop - prev.stop;
            const u = (t - prev.stop) / range;
            return prev.color.clone().lerp(curr.color, u);
        }
    }
    return palette.colors[palette.colors.length - 1].color;
}