class GlobalSettings {
    constructor() {
        this.meshDetail = 256; // Default segments (64x64 grid)
        this.textureDetail = 1024; // Default texture resolution (power of 2)
        
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
            <div class="setting-group">
                <label for="textureDetail">Texture Detail (resolution)</label>
                <div class="slider-container">
                    <input type="range" id="textureDetail" min="256" max="2048" value="${this.textureDetail}" step="256">
                    <span class="value">${this.textureDetail}x${this.textureDetail}</span>
                </div>
            </div>
        `;

        // Add event listeners
        const meshDetailInput = globalSettingsSection.querySelector('#meshDetail');
        const textureDetailInput = globalSettingsSection.querySelector('#textureDetail');
        const meshDetailValue = globalSettingsSection.querySelector('#meshDetail').nextElementSibling;
        const textureDetailValue = globalSettingsSection.querySelector('#textureDetail').nextElementSibling;

        meshDetailInput.addEventListener('input', (e) => {
            this.meshDetail = parseInt(e.target.value);
            meshDetailValue.textContent = `${this.meshDetail}x${this.meshDetail}`;
            this.onSettingsChanged();
        });

        textureDetailInput.addEventListener('input', (e) => {
            this.textureDetail = parseInt(e.target.value);
            textureDetailValue.textContent = `${this.textureDetail}x${this.textureDetail}`;
            this.onSettingsChanged();
        });
    }

    onSettingsChanged() {
        // Dispatch a custom event when settings change
        const event = new CustomEvent('globalSettingsChanged', {
            detail: {
                meshDetail: this.meshDetail,
                textureDetail: this.textureDetail
            }
        });
        document.dispatchEvent(event);
    }

    getMeshDetail() {
        return this.meshDetail;
    }

    getTextureDetail() {
        return this.textureDetail;
    }
}

// Export the class
window.GlobalSettings = GlobalSettings; 