class VoronoiGenerator {
    constructor() {
        this.enabled = true;
        this.numCells = 50; // Controls density of Voronoi cells
        this.heightMultiplier = 150; // Overall height of Voronoi features
        this.smoothness = 0.5; // Controls the "spikiness" vs "flatness" of cell centers

        this.cellCenters = [];

        this.initializeUI();
    }

    generateCellCenters() {
        this.cellCenters = [];
        for (let i = 0; i < this.numCells; i++) {
            this.cellCenters.push({
                x: Math.random(), // Normalized 0-1
                y: Math.random()  // Normalized 0-1
            });
        }
    }

    distance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    generateHeightMap(width, height) {
        const heightMap = new Float32Array(width * height);

        if (!this.enabled) {
            return heightMap; // Return flat if disabled
        }

        // Regenerate centers only if the number of cells changes
        if (this.cellCenters.length !== this.numCells) {
             this.generateCellCenters();
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const normalizedX = x / (width - 1);
                const normalizedY = y / (height - 1);

                let minDistanceToCellCenter = Infinity;
                let closestCellCenter = null;

                // Find the closest Voronoi cell center for the current point
                for (const center of this.cellCenters) {
                    const dist = this.distance({ x: normalizedX, y: normalizedY }, center);
                    if (dist < minDistanceToCellCenter) {
                        minDistanceToCellCenter = dist;
                        closestCellCenter = center;
                    }
                }

                // Calculate height based on distance to the closest cell center
                // A height function that is high near the center and falls off
                // without creating a sharp spike.
                // Using a simple inverse or a smooth function for falloff.
                let heightValue = 0;
                if (closestCellCenter) {
                    const distFromCenter = this.distance({ x: normalizedX, y: normalizedY }, closestCellCenter);
                    
                    // Normalize distance to a range suitable for the height function (e.g., 0 to 1)
                    // We can estimate max_dist as sqrt(2) for normalized coordinates, but a more practical
                    // approach is to consider the average distance between cells.
                    // For simplicity, let's use a cap on the distance for calculation.
                    const maxPossibleCellDistance = 0.5; // A reasonable max distance within a single cell, could be tuned

                    const scaledDistance = Math.min(distFromCenter / maxPossibleCellDistance, 1.0);
                    
                    // Use a smoothed step function or a polynomial for falloff
                    // 1 - (distance)^smoothness. Higher smoothness, flatter tops.
                    heightValue = this.heightMultiplier * Math.pow(1 - scaledDistance, this.smoothness);
                }
                
                heightMap[y * width + x] = heightValue;
            }
        }
        return heightMap;
    }

    updateParameters(enabled, numCells, heightMultiplier, smoothness) {
        const shouldRegenerateCenters = (this.numCells !== numCells);

        this.enabled = enabled;
        this.numCells = numCells;
        this.heightMultiplier = heightMultiplier;
        this.smoothness = smoothness;

        if (shouldRegenerateCenters) {
            this.generateCellCenters(); // Regenerate centers if number changes
        }
    }

    initializeUI() {
        const voronoiSection = document.querySelector('[data-section="voronoi-component"] .section-content');

        voronoiSection.innerHTML = `
            <div class="setting-group">
                <label for="voronoiEnabled">Enable Voronoi</label>
                <div class="toggle-container">
                    <input type="checkbox" id="voronoiEnabled" ${this.enabled ? 'checked' : ''}>
                    <label for="voronoiEnabled" class="toggle-label"></label>
                </div>
            </div>
            <div class="setting-group">
                <label for="numCells">Voronoi Cell Density</label>
                <div class="slider-container">
                    <input type="range" id="numCells" min="5" max="200" value="${this.numCells}" step="5">
                    <span class="value">${this.numCells}</span>
                </div>
            </div>
            <div class="setting-group">
                <label for="voronoiHeightMultiplier">Height Multiplier</label>
                <div class="slider-container">
                    <input type="range" id="voronoiHeightMultiplier" min="10" max="500" value="${this.heightMultiplier}" step="10">
                    <span class="value">${this.heightMultiplier}</span>
                </div>
            </div>
            <div class="setting-group">
                <label for="voronoiSmoothness">Smoothness</label>
                <div class="slider-container">
                    <input type="range" id="voronoiSmoothness" min="0.1" max="5.0" value="${this.smoothness}" step="0.1">
                    <span class="value">${this.smoothness.toFixed(1)}</span>
                </div>
            </div>
        `;

        const voronoiEnabledToggle = voronoiSection.querySelector('#voronoiEnabled');
        const numCellsInput = voronoiSection.querySelector('#numCells');
        const voronoiHeightMultiplierInput = voronoiSection.querySelector('#voronoiHeightMultiplier');
        const voronoiSmoothnessInput = voronoiSection.querySelector('#voronoiSmoothness');

        const numCellsValue = numCellsInput.nextElementSibling;
        const voronoiHeightMultiplierValue = voronoiHeightMultiplierInput.nextElementSibling;
        const voronoiSmoothnessValue = voronoiSmoothnessInput.nextElementSibling;

        voronoiEnabledToggle.addEventListener('change', (e) => {
            this.enabled = e.target.checked;
            this.onSettingsChanged();
        });

        numCellsInput.addEventListener('input', (e) => {
            this.numCells = parseInt(e.target.value);
            numCellsValue.textContent = this.numCells;
            this.onSettingsChanged();
        });

        voronoiHeightMultiplierInput.addEventListener('input', (e) => {
            this.heightMultiplier = parseInt(e.target.value);
            voronoiHeightMultiplierValue.textContent = this.heightMultiplier;
            this.onSettingsChanged();
        });

        voronoiSmoothnessInput.addEventListener('input', (e) => {
            this.smoothness = parseFloat(e.target.value);
            voronoiSmoothnessValue.textContent = this.smoothness.toFixed(1);
            this.onSettingsChanged();
        });
    }

    onSettingsChanged() {
        const event = new CustomEvent('voronoiSettingsChanged', {
            detail: {
                enabled: this.enabled,
                numCells: this.numCells,
                heightMultiplier: this.heightMultiplier,
                smoothness: this.smoothness
            }
        });
        document.dispatchEvent(event);
    }
}

window.VoronoiGenerator = VoronoiGenerator;