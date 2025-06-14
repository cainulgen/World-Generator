import * as THREE from 'https://cdn.skypack.dev/three@0.129.0';

export const palettes = [
    {
        name: "Alpine Meadow",
        colors: [
            { stop: 0.0, color: new THREE.Color("#1a3d2e") }, // Deep forest base
            { stop: 0.15, color: new THREE.Color("#2d5a3d") }, // Rich forest green
            { stop: 0.35, color: new THREE.Color("#4a7c59") }, // Meadow green
            { stop: 0.5, color: new THREE.Color("#6b9b5f") },  // Grass green
            { stop: 0.65, color: new THREE.Color("#8fb573") }, // Light meadow
            { stop: 0.75, color: new THREE.Color("#9d9d9d") }, // Stone grey
            { stop: 0.85, color: new THREE.Color("#b8b8b8") }, // Light stone
            { stop: 0.95, color: new THREE.Color("#d4d4d4") }, // Pale stone
            { stop: 1.0, color: new THREE.Color("#f0f0f0") }   // Snow cap
        ],
        rockColors: [ 
            new THREE.Color("#4a5d4a"), // Moss-covered stone
            new THREE.Color("#6b6b6b"), // Medium granite
            new THREE.Color("#808080"), // Light granite
            new THREE.Color("#5a5a5a")  // Dark granite
        ],
        waterColor: new THREE.Color("#4a7c8a") // Mountain stream blue
    },
    {
        name: "Desert Oasis",
        colors: [
            { stop: 0.0, color: new THREE.Color("#8b6914") }, // Dark golden sand
            { stop: 0.2, color: new THREE.Color("#cd853f") },  // Peru sand
            { stop: 0.35, color: new THREE.Color("#daa520") }, // Golden rod
            { stop: 0.5, color: new THREE.Color("#f4a460") },  // Sandy brown
            { stop: 0.65, color: new THREE.Color("#e6b87d") }, // Light sand
            { stop: 0.75, color: new THREE.Color("#d2691e") }, // Chocolate rock
            { stop: 0.85, color: new THREE.Color("#a0522d") }, // Sienna stone
            { stop: 0.95, color: new THREE.Color("#8b4513") }, // Saddle brown
            { stop: 1.0, color: new THREE.Color("#654321") }   // Dark desert stone
        ],
        rockColors: [ 
            new THREE.Color("#8b7355"), // Weathered sandstone
            new THREE.Color("#a0522d"), // Red sandstone
            new THREE.Color("#cd853f"), // Light sandstone
            new THREE.Color("#654321")  // Dark desert rock
        ],
        waterColor: new THREE.Color("#20b2aa") // Oasis turquoise
    },
    {
        name: "Volcanic Ash",
        colors: [
            { stop: 0.0, color: new THREE.Color("#0a0a0a") }, // Deep black ash
            { stop: 0.15, color: new THREE.Color("#1a1a1a") }, // Charcoal
            { stop: 0.3, color: new THREE.Color("#2f2f2f") },  // Dark grey ash
            { stop: 0.45, color: new THREE.Color("#4a4a4a") }, // Medium ash
            { stop: 0.6, color: new THREE.Color("#8b0000") },  // Dark red lava
            { stop: 0.7, color: new THREE.Color("#dc143c") },  // Crimson lava
            { stop: 0.8, color: new THREE.Color("#ff4500") },  // Orange red
            { stop: 0.9, color: new THREE.Color("#ff6347") },  // Tomato glow
            { stop: 1.0, color: new THREE.Color("#ffa500") }   // Bright orange peak
        ],
        rockColors: [ 
            new THREE.Color("#0f0f0f"), // Obsidian black
            new THREE.Color("#2f2f2f"), // Volcanic grey
            new THREE.Color("#4a4a4a"), // Pumice grey
            new THREE.Color("#1a1a1a")  // Charcoal rock
        ]
    }
];

export function getColorFromPalette(t, palette) {
    // Clamp t to [0, 1] range
    t = Math.max(0, Math.min(1, t));
    
    // Find the correct color segment
    for (let i = 1; i < palette.colors.length; i++) {
        const prev = palette.colors[i - 1];
        const curr = palette.colors[i];
        
        if (t <= curr.stop) {
            const range = curr.stop - prev.stop;
            if (range === 0) return prev.color.clone();
            
            const u = (t - prev.stop) / range;
            // Use smooth interpolation for more natural transitions
            const smoothU = u * u * (3 - 2 * u); // Smoothstep function
            return prev.color.clone().lerp(curr.color, smoothU);
        }
    }
    
    // Return the last color if t is at the end
    return palette.colors[palette.colors.length - 1].color.clone();
}

//