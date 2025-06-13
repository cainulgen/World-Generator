// voronoiGenerator.js
class VoronoiGenerator {
    constructor() {
        this.enabled = true;
        this.numCells = 50; // Controls density of Voronoi cells
        this.heightMultiplier = 50; // Reintroduced: Controls overall height/amplitude of Voronoi features
        this.smoothness = 0.5; // Controls the "spikiness" vs "flatness" of cell centers
        this.cellJitter = 0.1; // Controls how varied cell sizes are
        this.invertDirection = false; // New: Controls if features are inverted (troughs instead of peaks)

        this.cellCenters = [];

        this.initializeUI();
    }

    generateCellCenters() {
        this.cellCenters = [];
        for (let i = 0; i < this.numCells; i++) {
            this.cellCenters.push({
                x: Math.random() + (Math.random() - 0.5) * this.cellJitter, // Normalized 0-1 with jitter
                y: Math.random() + (Math.random() - 0.5) * this.cellJitter  // Normalized 0-1 with jitter
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

        if (this.cellCenters.length !== this.numCells || (this.numCells > 0 && this.cellCenters.length === 0) || this.recreateCenters) { // Added this.recreateCenters to force regeneration
             this.generateCellCenters();
             this.recreateCenters = false; // Reset flag after regeneration
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const normalizedX = x / (width - 1);
                const normalizedY = y / (height - 1);

                let minDistanceToCellCenter = Infinity;
                let closestCellCenter = null;

                for (const center of this.cellCenters) {
                    const dist = this.distance({ x: normalizedX, y: normalizedY }, center);
                    if (dist < minDistanceToCellCenter) {
                        minDistanceToCellCenter = dist;
                        closestCellCenter = center;
                    }
                }

                let heightValue = 0;
                if (closestCellCenter) {
                    const distFromCenter = this.distance({ x: normalizedX, y: normalizedY }, closestCellCenter);
                    
                    const maxPossibleCellDistance = 0.5; 
                    const scaledDistance = Math.min(distFromCenter / maxPossibleCellDistance, 1.0);
                    
                    // Base shape from 1 to 0 (peak at center, falling to edge)
                    let baseShape = Math.pow(1 - scaledDistance, this.smoothness);
                    
                    // Center the shape around 0 (ranges from 0.5 to -0.5)
                    let centeredShape = baseShape - 0.5;

                    // Apply amplitude
                    heightValue = this.heightMultiplier * centeredShape;

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

    updateParameters(enabled, numCells, heightMultiplier, smoothness, cellJitter, invertDirection) { // Updated parameters
        const shouldRegenerateCenters = (this.numCells !== numCells || this.cellJitter !== cellJitter);

        this.enabled = enabled;
        this.numCells = numCells;
        this.heightMultiplier = heightMultiplier; // Updated
        this.smoothness = smoothness;
        this.cellJitter = cellJitter; 
        this.invertDirection = invertDirection; // Updated

        if (shouldRegenerateCenters) {
            this.recreateCenters = true; // Set flag to force regeneration
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
                <label for="voronoiCellJitter">Cell Size Variance</label>
                <div class="slider-container">
                    <input type="range" id="voronoiCellJitter" min="0.0" max="1.0" value="${this.cellJitter}" step="0.01">
                    <span class="value">${this.cellJitter.toFixed(2)}</span>
                </div>
            </div>
            <div class="setting-group">
                <label for="voronoiInvertDirection">Invert Direction</label>
                <div class="toggle-container">
                    <input type="checkbox" id="voronoiInvertDirection" ${this.invertDirection ? 'checked' : ''}>
                    <label for="voronoiInvertDirection" class="toggle-label"></label>
                </div>
            </div>
        `;

        const voronoiEnabledToggle = voronoiSection.querySelector('#voronoiEnabled');
        const numCellsInput = voronoiSection.querySelector('#numCells');
        const voronoiHeightMultiplierInput = voronoiSection.querySelector('#voronoiHeightMultiplier'); // Reintroduced
        const voronoiSmoothnessInput = voronoiSection.querySelector('#voronoiSmoothness');
        const voronoiCellJitterInput = voronoiSection.querySelector('#voronoiCellJitter'); 
        const voronoiInvertDirectionToggle = voronoiSection.querySelector('#voronoiInvertDirection'); // New toggle

        const numCellsValue = numCellsInput.nextElementSibling;
        const voronoiHeightMultiplierValue = voronoiHeightMultiplierInput.nextElementSibling; // Reintroduced
        const voronoiSmoothnessValue = voronoiSmoothnessInput.nextElementSibling;
        const voronoiCellJitterValue = voronoiCellJitterInput.nextElementSibling; 

        voronoiEnabledToggle.addEventListener('change', (e) => {
            this.enabled = e.target.checked;
            this.onSettingsChanged();
        });

        numCellsInput.addEventListener('input', (e) => {
            this.numCells = parseInt(e.target.value);
            numCellsValue.textContent = this.numCells;
            this.onSettingsChanged();
        });

        voronoiHeightMultiplierInput.addEventListener('input', (e) => { // Reintroduced listener
            this.heightMultiplier = parseInt(e.target.value);
            voronoiHeightMultiplierValue.textContent = this.heightMultiplier;
            this.onSettingsChanged();
        });

        voronoiSmoothnessInput.addEventListener('input', (e) => {
            this.smoothness = parseFloat(e.target.value);
            voronoiSmoothnessValue.textContent = this.smoothness.toFixed(1);
            this.onSettingsChanged();
        });

        voronoiCellJitterInput.addEventListener('input', (e) => { 
            this.cellJitter = parseFloat(e.target.value);
            voronoiCellJitterValue.textContent = this.cellJitter.toFixed(2);
            this.onSettingsChanged();
        });

        voronoiInvertDirectionToggle.addEventListener('change', (e) => { // New listener
            this.invertDirection = e.target.checked;
            this.onSettingsChanged();
        });
    }

    onSettingsChanged() {
        const event = new CustomEvent('voronoiSettingsChanged', {
            detail: {
                enabled: this.enabled,
                numCells: this.numCells,
                heightMultiplier: this.heightMultiplier, // Included again
                smoothness: this.smoothness,
                cellJitter: this.cellJitter,
                invertDirection: this.invertDirection // New parameter
            }
        });
        document.dispatchEvent(event);
    }
}

window.VoronoiGenerator = VoronoiGenerator;