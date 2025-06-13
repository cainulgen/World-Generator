// voronoiGenerator.js
class VoronoiGenerator {
    constructor() {
        this.enabled = true;
        this.numCells = 50; // Controls density of Voronoi cells
        this.heightMultiplier = 50; // Controls overall height/amplitude of Voronoi features
        this.smoothness = 0.5; // Controls the "spikiness" vs "flatness" of cell centers
        this.invertDirection = false; // Controls if features are inverted (troughs instead of peaks)
        this.edgeInfluence = 0.0; // New: Controls how much the cell edges are emphasized (for ridginess)

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

        if (this.cellCenters.length !== this.numCells || (this.numCells > 0 && this.cellCenters.length === 0)) {
             this.generateCellCenters();
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const normalizedX = x / (width - 1);
                const normalizedY = y / (height - 1);

                let minDistanceToCellCenter = Infinity;
                let secondMinDistanceToCellCenter = Infinity;
                // let closestCellCenter = null; // No longer strictly needed to store the center object for the calculation
                

                // Find the closest and second closest Voronoi cell centers
                for (const center of this.cellCenters) {
                    const dist = this.distance({ x: normalizedX, y: normalizedY }, center);
                    if (dist < minDistanceToCellCenter) {
                        secondMinDistanceToCellCenter = minDistanceToCellCenter; // The old min becomes the new second min
                        minDistanceToCellCenter = dist;
                        // closestCellCenter = center; // If needed for other calculations
                    } else if (dist < secondMinDistanceToCellCenter) {
                        secondMinDistanceToCellCenter = dist;
                    }
                }

                let heightValue = 0;
                // Only proceed if at least one cell center was found (i.e., minDistance is not Infinity)
                if (minDistanceToCellCenter !== Infinity) {
                    // Normalize distance to a range suitable for the height function (e.g., 0 to 1)
                    const maxPossibleCellDistance = 0.5; // A reasonable max distance within a single cell, could be tuned
                    const scaledDistance = Math.min(minDistanceToCellCenter / maxPossibleCellDistance, 1.0);
                    
                    // Calculate base shape: peak at center (1), falls to 0 at edge
                    let baseShape = Math.pow(1 - scaledDistance, this.smoothness);
                    
                    // Center the shape around 0 (ranges from 0.5 to -0.5)
                    let centeredShape = baseShape - 0.5;

                    // Calculate edge influence:
                    // The difference (secondMin - min) is small near the edges and large near the centers.
                    // We want this to contribute negatively or positively to the height.
                    let edgeContribution = 0;
                    if (secondMinDistanceToCellCenter !== Infinity && this.edgeInfluence !== 0) {
                        // Normalize the difference. A common approach is (d2 - d1).
                        // maxPossibleCellDistance can be used to normalize the distance difference as well.
                        // We want 0 at center, max at edge for positive ridginess.
                        // Or vice versa for negative ridginess (valleys at edges).
                        const normalizedDistanceDifference = (secondMinDistanceToCellCenter - minDistanceToCellCenter) / maxPossibleCellDistance;
                        
                        // We can apply a power to this difference to control how sharply it rises/falls at the edge.
                        // A linear application of edgeInfluence is a good start.
                        edgeContribution = normalizedDistanceDifference * this.edgeInfluence;
                    }

                    // Combine primary shape with edge influence
                    heightValue = this.heightMultiplier * (centeredShape + edgeContribution);

                    // Apply inversion if needed
                    if (this.invertDirection) {
                        heightValue *= -1;
                    }
                }
                
                heightMap[y * width + x] = heightValue;
            }
        }
        return heightMap;
    }

    updateParameters(enabled, numCells, heightMultiplier, smoothness, invertDirection, edgeInfluence) { // Updated parameters
        const shouldRegenerateCenters = (this.numCells !== numCells); // Cell jitter removed, so only numCells impacts regeneration

        this.enabled = enabled;
        this.numCells = numCells;
        this.heightMultiplier = heightMultiplier;
        this.smoothness = smoothness;
        this.invertDirection = invertDirection; 
        this.edgeInfluence = edgeInfluence; // Updated

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
                <label for="voronoiHeightMultiplier">Height Amplitude</label>
                <div class="slider-container">
                    <input type="range" id="voronoiHeightMultiplier" min="0" max="100" value="${this.heightMultiplier}" step="1">
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
            <div class="setting-group">
                <label for="voronoiEdgeInfluence">Edge Influence (Ridginess)</label>
                <div class="slider-container">
                    <input type="range" id="voronoiEdgeInfluence" min="-1.0" max="1.0" value="${this.edgeInfluence}" step="0.05">
                    <span class="value">${this.edgeInfluence.toFixed(2)}</span>
                </div>
            </div>
            <div class="setting-group">
                <label for="voronoiInvertDirection">Invert Overall Direction</label>
                <div class="toggle-container">
                    <input type="checkbox" id="voronoiInvertDirection" ${this.invertDirection ? 'checked' : ''}>
                    <label for="voronoiInvertDirection" class="toggle-label"></label>
                </div>
            </div>
        `;

        const voronoiEnabledToggle = voronoiSection.querySelector('#voronoiEnabled');
        const numCellsInput = voronoiSection.querySelector('#numCells');
        const voronoiHeightMultiplierInput = voronoiSection.querySelector('#voronoiHeightMultiplier');
        const voronoiSmoothnessInput = voronoiSection.querySelector('#voronoiSmoothness');
        const voronoiEdgeInfluenceInput = voronoiSection.querySelector('#voronoiEdgeInfluence'); // New input
        const voronoiInvertDirectionToggle = voronoiSection.querySelector('#voronoiInvertDirection'); 

        const numCellsValue = numCellsInput.nextElementSibling;
        const voronoiHeightMultiplierValue = voronoiHeightMultiplierInput.nextElementSibling;
        const voronoiSmoothnessValue = voronoiSmoothnessInput.nextElementSibling;
        const voronoiEdgeInfluenceValue = voronoiEdgeInfluenceInput.nextElementSibling; // New value span

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

        voronoiEdgeInfluenceInput.addEventListener('input', (e) => { // New event listener
            this.edgeInfluence = parseFloat(e.target.value);
            voronoiEdgeInfluenceValue.textContent = this.edgeInfluence.toFixed(2);
            this.onSettingsChanged();
        });

        voronoiInvertDirectionToggle.addEventListener('change', (e) => { 
            this.invertDirection = e.target.checked;
            this.onSettingsChanged();
        });
    }

    onSettingsChanged() {
        const event = new CustomEvent('voronoiSettingsChanged', {
            detail: {
                enabled: this.enabled,
                numCells: this.numCells,
                heightMultiplier: this.heightMultiplier,
                smoothness: this.smoothness,
                invertDirection: this.invertDirection,
                edgeInfluence: this.edgeInfluence // New parameter
            }
        });
        document.dispatchEvent(event);
    }
}

window.VoronoiGenerator = VoronoiGenerator;