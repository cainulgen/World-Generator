// voronoiGenerator.js
class VoronoiGenerator {
    constructor() {
        this.enabled = true;
        this.numCells = 50; // Controls density of Voronoi cells
        this.heightMultiplier = 50; // Controls overall height/amplitude of Voronoi features
        this.smoothness = 2.0; // Adjusted default: Controls the "roundness" of cell centers (was 0.5)
        this.invertDirection = false; // Controls if features are inverted (troughs instead of peaks)
        this.edgeInfluence = 0.0; // Controls how much the cell edges are emphasized (for ridginess)

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
                
                for (const center of this.cellCenters) {
                    const dist = this.distance({ x: normalizedX, y: normalizedY }, center);
                    if (dist < minDistanceToCellCenter) {
                        secondMinDistanceToCellCenter = minDistanceToCellCenter; 
                        minDistanceToCellCenter = dist;
                    } else if (dist < secondMinDistanceToCellCenter) {
                        secondMinDistanceToCellCenter = dist;
                    }
                }

                let heightValue = 0;
                if (minDistanceToCellCenter !== Infinity) {
                    const maxPossibleCellDistance = 0.5; 
                    const scaledDistance = Math.min(minDistanceToCellCenter / maxPossibleCellDistance, 1.0);
                    
                    // --- MODIFICATION HERE FOR SMOOTHER PEAKS ---
                    // Using an inverse exponential/Gaussian-like falloff
                    // Higher 'smoothness' (k_factor) makes the peak narrower and steeper (but still rounded).
                    // Lower 'smoothness' makes it broader and flatter.
                    // Map smoothness (0.1 to 5.0) to k_factor (e.g., 1 to 50, adjust as needed)
                    const k_factor = this.smoothness * 10; // Adjust multiplier for desired range of steepness/roundness
                    let baseShape = Math.exp(-k_factor * scaledDistance * scaledDistance);
                    // This 'baseShape' now goes from 1 (at center) to ~0 (at edge) with a rounded top.

                    // Center the shape around 0 (ranges from 0.5 to -0.5 after this.heightMultiplier, not directly baseShape - 0.5)
                    // The Gaussian-like shape already has its peak at 1 and falls to 0. We need to shift it down.
                    // If height multiplier applies to amplitude, and you want it centered around 0, then:
                    let centeredShape = baseShape - 0.5; // This still works to shift the 0-1 range to -0.5 to 0.5
                                                          // so that heightMultiplier acts as amplitude around 0.

                    let edgeContribution = 0;
                    if (secondMinDistanceToCellCenter !== Infinity && this.edgeInfluence !== 0) {
                        const normalizedDistanceDifference = (secondMinDistanceToCellCenter - minDistanceToCellCenter) / maxPossibleCellDistance;
                        edgeContribution = normalizedDistanceDifference * this.edgeInfluence;
                    }

                    heightValue = this.heightMultiplier * (centeredShape + edgeContribution);

                    if (this.invertDirection) {
                        heightValue *= -1;
                    }
                }
                
                heightMap[y * width + x] = heightValue;
            }
        }
        return heightMap;
    }

    updateParameters(enabled, numCells, heightMultiplier, smoothness, invertDirection, edgeInfluence) {
        const shouldRegenerateCenters = (this.numCells !== numCells);

        this.enabled = enabled;
        this.numCells = numCells;
        this.heightMultiplier = heightMultiplier;
        this.smoothness = smoothness;
        this.invertDirection = invertDirection; 
        this.edgeInfluence = edgeInfluence; 

        if (shouldRegenerateCenters) {
            this.generateCellCenters();
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
                <label for="voronoiSmoothness">Roundness (Lower = Broader, Higher = Steeper)</label>
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
        const voronoiEdgeInfluenceInput = voronoiSection.querySelector('#voronoiEdgeInfluence');
        const voronoiInvertDirectionToggle = voronoiSection.querySelector('#voronoiInvertDirection'); 

        const numCellsValue = numCellsInput.nextElementSibling;
        const voronoiHeightMultiplierValue = voronoiHeightMultiplierInput.nextElementSibling;
        const voronoiSmoothnessValue = voronoiSmoothnessInput.nextElementSibling;
        const voronoiEdgeInfluenceValue = voronoiEdgeInfluenceInput.nextElementSibling;

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

        voronoiEdgeInfluenceInput.addEventListener('input', (e) => {
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
                edgeInfluence: this.edgeInfluence
            }
        });
        document.dispatchEvent(event);
    }
}

window.VoronoiGenerator = VoronoiGenerator;