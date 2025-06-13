class PerlinNoiseGenerator {
    constructor() {
        this.scale = 2; // Controls both horizontal and proportional vertical scaling
        this.frequency = 10; // Base frequency
        this.heightScale = 45; // Overall height multiplier, independent of 'noiseScale'
        this.enabled = true; // Whether noise is enabled

        // FBM parameters
        this.octaves = 4; // Number of noise layers
        this.persistence = 0.5; // How much each successive octave contributes (amplitude multiplier)
        this.lacunarity = 2.0; // How much the frequency increases for each successive octave

        // New: Ridged parameter
        this.isRidged = false; // Whether to generate ridged multifractal noise
    }

    hash(x, y) {
        const X = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return X - Math.floor(X);
    }

    smoothstep(a, b, t) {
        t = t * t * (3 - 2 * t);
        return a + (b - a) * t;
    }

    noise(x, y) {
        const X = Math.floor(x);
        const Y = Math.floor(y);
        const xf = x - X;
        const yf = y - Y;

        const n00 = this.hash(X, Y);
        const n01 = this.hash(X, Y + 1);
        const n10 = this.hash(X + 1, Y);
        const n11 = this.hash(X + 1, Y + 1);

        const nx0 = this.smoothstep(n00, n10, xf);
        const nx1 = this.smoothstep(n01, n11, xf);
        return this.smoothstep(nx0, nx1, yf);
    }

    fbm(x, y) {
        let total = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0; // Used for normalizing result

        for (let i = 0; i < this.octaves; i++) {
            let noiseValue = this.noise(x * frequency, y * frequency);

            if (this.isRidged) {
                // Ridged Multifractal logic: invert and absolute the noise
                // This creates sharp ridges. The result is still in the [0, 1] range.
                noiseValue = 1.0 - Math.abs(noiseValue * 2 - 1);
            }

            total += noiseValue * amplitude;

            maxValue += amplitude;
            
            amplitude *= this.persistence;
            frequency *= this.lacunarity;
        }

        // Normalize the noise value to the range [0, 1]
        const normalizedValue = total / maxValue;
        
        // --- FIX ---
        // Shift the range from [0, 1] to [-1, 1] to center it around 0
        return normalizedValue * 2 - 1;
    }


    generateHeightMap(width, height) {
        const heightMap = new Float32Array(width * height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (!this.enabled) {
                    heightMap[y * width + x] = 0;
                    continue;
                }

                const normalizedX = (x / (width - 1)) - 0.5;
                const normalizedY = (y / (height - 1)) - 0.5;

                const effectiveFrequency = this.frequency / this.scale;
                const nx = normalizedX * effectiveFrequency;
                const ny = normalizedY * effectiveFrequency;

                // This noiseValue is now correctly in the [-1, 1] range
                let noiseValue = this.fbm(nx, ny);
                
                heightMap[y * width + x] = noiseValue * this.scale * this.heightScale;
            }
        }

        return heightMap;
    }

    // Update parameters method to include new FBM and ridged params
    updateParameters(scale, heightScale, enabled, octaves, persistence, lacunarity, isRidged) {
        this.scale = scale;
        this.heightScale = heightScale;
        if (enabled !== undefined) {
            this.enabled = enabled;
        }
        if (octaves !== undefined) {
            this.octaves = octaves;
        }
        if (persistence !== undefined) {
            this.persistence = persistence;
        }
        if (lacunarity !== undefined) {
            this.lacunarity = lacunarity;
        }
        // New: Update isRidged parameter
        if (isRidged !== undefined) {
            this.isRidged = isRidged;
        }
    }
}