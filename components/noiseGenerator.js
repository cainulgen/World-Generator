class NoiseGenerator {
    constructor() {
        this.scale = 1; // Controls both horizontal and proportional vertical scaling
        this.frequency = 10; // Base frequency
        this.heightScale = 200; // Overall height multiplier, independent of 'noiseScale'
        this.enabled = true; // Whether noise is enabled
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

                let noiseValue = this.noise(nx, ny);
                noiseValue = noiseValue * 2 - 1;

                heightMap[y * width + x] = noiseValue * this.scale * this.heightScale;
            }
        }

        return heightMap;
    }

    updateParameters(scale, heightScale, enabled) {
        this.scale = scale;
        this.heightScale = heightScale;
        if (enabled !== undefined) {
            this.enabled = enabled;
        }
    }
}