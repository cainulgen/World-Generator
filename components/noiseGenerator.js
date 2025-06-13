class NoiseGenerator {
    constructor() {
        this.scale = 1;
        this.frequency = 10; // Or whatever value you settled on
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
                // Key change: Normalize x and y to a range centered around 0 (e.g., -0.5 to 0.5)
                const normalizedX = (x / (width - 1)) - 0.5; // Maps 0 to -0.5, (width-1)/2 to 0, width-1 to 0.5
                const normalizedY = (y / (height - 1)) - 0.5; // Maps 0 to -0.5, (height-1)/2 to 0, height-1 to 0.5
                
                const nx = normalizedX * this.frequency * this.scale;
                const ny = normalizedY * this.frequency * this.scale;
                
                const noiseValue = this.noise(nx, ny);
                heightMap[y * width + x] = noiseValue * 2 - 1;
            }
        }

        return heightMap;
    }

    updateParameters(scale) {
        this.scale = scale;
    }
}