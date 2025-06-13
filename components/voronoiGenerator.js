// voronoiGenerator.js
/**
 * @class VoronoiGenerator
 * @description Generates a heightmap based on Voronoi diagrams. This component is designed
 * to act as a *detail layer* for terrain, meaning its height contributions are
 * centered around zero (sea level) and do not globally elevate or depress the landscape.
 * It focuses on creating cellular patterns, peaks, troughs, and angular features.
 */
class VoronoiGenerator {
    constructor() {
        /**
         * @property {boolean} enabled - Toggles the Voronoi generation on or off.
         */
        this.enabled = true;
        /**
         * @property {number} numCells - Controls the density of Voronoi cells. Higher values result in more, smaller cells.
         */
        this.numCells = 200;
        /**
         * @property {number} heightMultiplier - Controls the overall amplitude (intensity) of the Voronoi features.
         * Applied symmetrically around zero height.
         */
        this.heightMultiplier = 50;
        /**
         * @property {number} smoothness - Defines the roundness of the cell centers.
         * Higher values create steeper, more pronounced curves.
         * Lower values create broader, flatter curves.
         */
        this.smoothness = 2.0;
        /**
         * @property {boolean} invertDirection - If true, inverts the height output, turning peaks into troughs and vice-versa.
         */
        this.invertDirection = false;
        /**
         * @property {number} edgeInfluence - Controls the prominence of features along cell boundaries.
         * Positive values create ridges (elevations), negative values create valleys (depressions) along edges.
         */
        this.edgeInfluence = -1;
        /**
         * @property {number} edgeSharpness - Determines the angularity or sharpness of the edge features.
         * Higher values make edge features more defined and angular.
         */
        this.edgeSharpness = 0.1;

        /**
         * @property {Array<Object>} cellCenters - Stores the randomly generated coordinates for each Voronoi cell's center.
         */
        this.cellCenters = [];

        this.initializeUI();
    }

    /**
     * Generates random normalized (0-1) coordinates for each Voronoi cell center.
     * These centers define the basic structure of the Voronoi diagram.
     * Regenerated whenever `numCells` changes.
     */
    generateCellCenters() {
        this.cellCenters = [];
        for (let i = 0; i < this.numCells; i++) {
            this.cellCenters.push({
                x: Math.random(), // Normalized 0-1
                y: Math.random()  // Normalized 0-1
            });
        }
    }

    /**
     * Calculates the Euclidean distance between two 2D points.
     * @param {Object} p1 - First point {x, y}.
     * @param {Object} p2 - Second point {x, y}.
     * @returns {number} The distance between p1 and p2.
     */
    distance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Generates a heightmap for the terrain based on Voronoi properties.
     * This method ensures the Voronoi contribution is centered around zero,
     * acting purely as a detail layer.
     * @param {number} width - The width of the heightmap grid.
     * @param {number} height - The height of the heightmap grid.
     * @returns {Float32Array} A 1D array representing the generated heightmap.
     */
    generateHeightMap(width, height) {
        const heightMap = new Float32Array(width * height);

        if (!this.enabled) {
            return heightMap; // Return flat if disabled, contributing 0 height.
        }

        // Regenerate cell centers if the number of cells has changed, or if they are unexpectedly empty.
        if (this.cellCenters.length !== this.numCells || (this.numCells > 0 && this.cellCenters.length === 0)) {
             this.generateCellCenters();
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const normalizedX = x / (width - 1);
                const normalizedY = y / (height - 1);

                let minDistanceToCellCenter = Infinity;
                let secondMinDistanceToCellCenter = Infinity; // Needed for edge effects
                
                // Find the two closest Voronoi cell centers for the current point
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
                // Only calculate if at least one cell center was found (prevents NaN/Infinity issues)
                if (minDistanceToCellCenter !== Infinity) {
                    const maxPossibleCellDistance = 0.5; // Represents max distance within a typical cell for normalization
                    
                    // --- Calculate Center Contribution (Rounded Peak/Trough) ---
                    // scaledDistance: 0 at cell center, 1 at max distance from center (within a cell).
                    const scaledDistance = Math.min(minDistanceToCellCenter / maxPossibleCellDistance, 1.0);
                    // k_factor: Controls the steepness of the Gaussian-like curve. Higher smoothness = steeper.
                    const k_factor = this.smoothness * 10; 
                    // baseShape: 1 at cell center, approaches 0 at edge, with a smooth, rounded falloff.
                    let baseShape = Math.exp(-k_factor * scaledDistance * scaledDistance);
                    
                    // Center the baseShape's contribution around 0.
                    // This ensures the Voronoi generator acts as a detail layer, not shifting overall height.
                    // (e.g., if baseShape goes from 1 to 0, (baseShape - 0.5) goes from 0.5 to -0.5).
                    let centerContribution = (baseShape - 0.5); 

                    // --- Calculate Edge Contribution (Ridginess/Valleys along cell boundaries) ---
                    let edgeContributionFactor = 0;
                    if (secondMinDistanceToCellCenter !== Infinity && this.edgeInfluence !== 0) {
                        // normalizedDistanceDifference: Close to 0 at cell edges, approaches 1 at cell centers.
                        let normalizedDistanceDifference = (secondMinDistanceToCellCenter - minDistanceToCellCenter) / maxPossibleCellDistance;
                        
                        // edgeShape: 1 at cell edge, approaches 0 at cell center.
                        // Applies edgeSharpness to control how quickly the edge effect falls off from the boundary.
                        let edgeShape = Math.pow(1 - normalizedDistanceDifference, this.edgeSharpness);
                        
                        // Center the edgeShape's contribution around 0.
                        // (e.g., if edgeShape goes from 1 to 0, (edgeShape - 0.5) goes from 0.5 to -0.5).
                        edgeContributionFactor = (edgeShape - 0.5) * this.edgeInfluence;
                    }

                    // --- Combine Contributions and Apply Overall Amplitude ---
                    // Sum the centered contributions from both cell centers and edges.
                    heightValue = centerContribution + edgeContributionFactor;
                    
                    // Apply the overall amplitude multiplier.
                    heightValue *= this.heightMultiplier; 

                    // --- Apply Overall Direction Inversion ---
                    // Inverts the entire Voronoi feature (peaks become troughs, troughs become peaks).
                    if (this.invertDirection) {
                        heightValue *= -1;
                    }
                }
                
                heightMap[y * width + x] = heightValue;
            }
        }
        return heightMap;
    }

    /**
     * Updates the internal parameters of the Voronoi generator.
     * @param {boolean} enabled - New enable state.
     * @param {number} numCells - New number of Voronoi cells.
     * @param {number} heightMultiplier - New height amplitude.
     * @param {number} smoothness - New center roundness value.
     * @param {boolean} invertDirection - New direction inversion state.
     * @param {number} edgeInfluence - New edge influence value.
     * @param {number} edgeSharpness - New edge sharpness value.
     */
    updateParameters(enabled, numCells, heightMultiplier, smoothness, invertDirection, edgeInfluence, edgeSharpness) {
        // Only regenerate cell centers if their count changes, as their positions are fixed otherwise.
        const shouldRegenerateCenters = (this.numCells !== numCells);

        this.enabled = enabled;
        this.numCells = numCells;
        this.heightMultiplier = heightMultiplier;
        this.smoothness = smoothness;
        this.invertDirection = invertDirection; 
        this.edgeInfluence = edgeInfluence; 
        this.edgeSharpness = edgeSharpness; 

        if (shouldRegenerateCenters) {
            this.generateCellCenters();
        }
    }

    /**
     * Initializes the user interface elements for controlling Voronoi parameters.
     * Sets up sliders, toggles, and their respective event listeners to update
     * the generator's state and trigger terrain regeneration.
     */
    initializeUI() {
        const voronoiSection = document.querySelector('[data-section="voronoi-component"] .section-content');

        // Populate the UI section with controls
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
                <label for="voronoiSmoothness">Center Roundness</label>
                <div class="slider-container">
                    <input type="range" id="voronoiSmoothness" min="0.1" max="5.0" value="${this.smoothness}" step="0.1">
                    <span class="value">${this.smoothness.toFixed(1)}</span>
                </div>
            </div>
            <div class="setting-group">
                <label for="voronoiEdgeInfluence">Edge Influence</label>
                <div class="slider-container">
                    <input type="range" id="voronoiEdgeInfluence" min="-1.0" max="1.0" value="${this.edgeInfluence}" step="0.05">
                    <span class="value">${this.edgeInfluence.toFixed(2)}</span>
                </div>
            </div>
            <div class="setting-group">
                <label for="voronoiEdgeSharpness">Edge Sharpness</label>
                <div class="slider-container">
                    <input type="range" id="voronoiEdgeSharpness" min="0.1" max="5.0" value="${this.edgeSharpness}" step="0.1">
                    <span class="value">${this.edgeSharpness.toFixed(1)}</span>
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

        // Get references to UI elements and their value displays
        const voronoiEnabledToggle = voronoiSection.querySelector('#voronoiEnabled');
        const numCellsInput = voronoiSection.querySelector('#numCells');
        const voronoiHeightMultiplierInput = voronoiSection.querySelector('#voronoiHeightMultiplier');
        const voronoiSmoothnessInput = voronoiSection.querySelector('#voronoiSmoothness');
        const voronoiEdgeInfluenceInput = voronoiSection.querySelector('#voronoiEdgeInfluence');
        const voronoiEdgeSharpnessInput = voronoiSection.querySelector('#voronoiEdgeSharpness');
        const voronoiInvertDirectionToggle = voronoiSection.querySelector('#voronoiInvertDirection'); 

        const numCellsValue = numCellsInput.nextElementSibling;
        const voronoiHeightMultiplierValue = voronoiHeightMultiplierInput.nextElementSibling;
        const voronoiSmoothnessValue = voronoiSmoothnessInput.nextElementSibling;
        const voronoiEdgeInfluenceValue = voronoiEdgeInfluenceInput.nextElementSibling;
        const voronoiEdgeSharpnessValue = voronoiEdgeSharpnessInput.nextElementSibling;

        // Add event listeners to update parameters and trigger terrain regeneration
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
        
        voronoiEdgeSharpnessInput.addEventListener('input', (e) => {
            this.edgeSharpness = parseFloat(e.target.value);
            voronoiEdgeSharpnessValue.textContent = this.edgeSharpness.toFixed(1);
            this.onSettingsChanged();
        });

        voronoiInvertDirectionToggle.addEventListener('change', (e) => { 
            this.invertDirection = e.target.checked;
            this.onSettingsChanged();
        });
    }

    /**
     * Dispatches a custom event to notify other modules (e.g., main.js) that
     * Voronoi settings have changed, prompting a terrain regeneration.
     */
    onSettingsChanged() {
        const event = new CustomEvent('voronoiSettingsChanged', {
            detail: {
                enabled: this.enabled,
                numCells: this.numCells,
                heightMultiplier: this.heightMultiplier,
                smoothness: this.smoothness,
                invertDirection: this.invertDirection,
                edgeInfluence: this.edgeInfluence,
                edgeSharpness: this.edgeSharpness
            }
        });
        document.dispatchEvent(event);
    }
}

window.VoronoiGenerator = VoronoiGenerator;