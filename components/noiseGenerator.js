class NoiseGenerator {
    constructor() {
        this.scale = 1; // Default scale, will be updated by UI
        // A common practice for Perlin-like noise is to have a frequency multiplier
        // This determines how "zoomed in" or "zoomed out" the noise appears.
        this.frequency = 0.01; // Experiment with this value (e.g., 0.005 to 0.05)
    }

    // Simple hash function for noise
    hash(x, y) {
        // These constants are often chosen to create pseudorandomness
        const X = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return X - Math.floor(X);
    }

    // Smooth interpolation
    smoothstep(a, b, t) {
        t = t * t * (3 - 2 * t);
        return a + (b - a) * t;
    }

    // Generate noise value for a single point
    noise(x, y) {
        const X = Math.floor(x);
        const Y = Math.floor(y);
        const xf = x - X;
        const yf = y - Y;

        // Get noise values for the four corners
        const n00 = this.hash(X, Y);
        const n01 = this.hash(X, Y + 1);
        const n10 = this.hash(X + 1, Y);
        const n11 = this.hash(X + 1, Y + 1);

        // Interpolate between the corners
        const nx0 = this.smoothstep(n00, n10, xf);
        const nx1 = this.smoothstep(n01, n11, xf);
        return this.smoothstep(nx0, nx1, yf);
    }

    // Generate height map for a given size
    generateHeightMap(width, height) {
        const heightMap = new Float32Array(width * height);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Apply the frequency and scale directly to x and y
                // This ensures that the inputs to the noise function span a larger range,
                // causing the hash function to produce more varied results across the grid.
                const nx = x * this.frequency * this.scale;
                const ny = y * this.frequency * this.scale;
                
                // The noise function returns a value between 0 and 1.
                // We want to re-map this to -1 to 1 for more natural terrain.
                const noiseValue = this.noise(nx, ny);
                heightMap[y * width + x] = noiseValue * 2 - 1; // Map from [0,1] to [-1,1]
            }
        }

        return heightMap;
    }

    // Update noise parameters
    updateParameters(scale) {
        this.scale = scale;
    }
}