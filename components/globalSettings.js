class GlobalSettings {
    constructor() {
        this.meshDetail = 256; // Default segments (256x256 grid)
        
        this.initializeUI();
    }

    initializeUI() {
        // Find the global settings section content
        const globalSettingsSection = document.querySelector('[data-section="global-settings"] .section-content');
        
        // Create the controls HTML
        globalSettingsSection.innerHTML = `
            <div class="setting-group">
                <label for="meshDetail">Mesh Detail (segments)</label>
                <div class="slider-container">
                    <input type="range" id="meshDetail" min="32" max="256" value="${this.meshDetail}" step="32">
                    <span class="value">${this.meshDetail}x${this.meshDetail}</span>
                </div>
            </div>
        `;

        // Add event listeners
        const meshDetailInput = globalSettingsSection.querySelector('#meshDetail');
        const meshDetailValue = meshDetailInput.nextElementSibling;

        meshDetailInput.addEventListener('input', (e) => {
            this.meshDetail = parseInt(e.target.value);
            meshDetailValue.textContent = `${this.meshDetail}x${this.meshDetail}`;
            this.onSettingsChanged();
        });
    }

    onSettingsChanged() {
        // Dispatch a custom event when settings change
        const event = new CustomEvent('globalSettingsChanged', {
            detail: {
                meshDetail: this.meshDetail
            }
        });
        document.dispatchEvent(event);
    }

    getMeshDetail() {
        return this.meshDetail;
    }
}

// Export the class
window.GlobalSettings = GlobalSettings;