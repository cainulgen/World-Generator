// colorGenerator.js
/**
 * @class ColorGenerator
 * @description Manages terrain color palettes and their application.
 */
class ColorGenerator {
    constructor() {
        this.enabled = true;
        this.currentPalette = 'Classic'; // Default palette name

        this.palettes = {
            'Classic': [
                { stop: 0.0, color: new THREE.Color(0x00008b) }, // Deep Blue (Water)
                { stop: 0.15, color: new THREE.Color(0x0000cd) }, // Medium Blue (Shallows)
                { stop: 0.2, color: new THREE.Color(0xfdfd96) }, // Sand
                { stop: 0.25, color: new THREE.Color(0x228b22) }, // Forest Green
                { stop: 0.5, color: new THREE.Color(0x8b4513) }, // Brown (Mountains)
                { stop: 0.75, color: new THREE.Color(0x696969) }, // Grey (Rock)
                { stop: 1.0, color: new THREE.Color(0xffffff) }  // White (Snow)
            ],
            'Arctic': [
                { stop: 0.0, color: new THREE.Color(0x4169e1) }, // Royal Blue (Deep Water)
                { stop: 0.2, color: new THREE.Color(0xadd8e6) }, // Light Blue (Ice Water)
                { stop: 0.25, color: new THREE.Color(0x708090) }, // Slate Gray (Shore)
                { stop: 0.4, color: new THREE.Color(0xd3d3d3) }, // Light Gray
                { stop: 0.6, color: new THREE.Color(0xf5f5f5) }, // White Smoke
                { stop: 1.0, color: new THREE.Color(0xffffff) }  // Pure White (Snow)
            ],
            'Desert': [
                { stop: 0.0, color: new THREE.Color(0x964b00) }, // Brown (Oasis Bed)
                { stop: 0.2, color: new THREE.Color(0x800000) }, // Maroon (Deepest part of canyon)
                { stop: 0.25, color: new THREE.Color(0xd2b48c) }, // Tan
                { stop: 0.4, color: new THREE.Color(0xf4a460) }, // Sandy Brown
                { stop: 0.6, color: new THREE.Color(0xffa500) }, // Orange
                { stop: 1.0, color: new THREE.Color(0xffe4b5) }  // Moccasin (Highest dune)
            ],
            'Volcanic': [
                { stop: 0.0, color: new THREE.Color(0xff4500) }, // Orange-Red (Lava)
                { stop: 0.2, color: new THREE.Color(0x8b0000) }, // Dark Red (Cooling Lava)
                { stop: 0.3, color: new THREE.Color(0x2f4f4f) }, // Dark Slate Gray
                { stop: 0.5, color: new THREE.Color(0x696969) }, // Dim Gray (Ash)
                { stop: 0.7, color: new THREE.Color(0x36454f) }, // Charcoal
                { stop: 1.0, color: new THREE.Color(0x000000) }  // Black (Hardened Rock)
            ]
        };

        this.initializeUI();
    }

    initializeUI() {
        const colorSection = document.querySelector('[data-section="color"] .section-content');
        let paletteOptions = '';
        for (const name in this.palettes) {
            paletteOptions += `<option value="${name}" ${name === this.currentPalette ? 'selected' : ''}>${name}</option>`;
        }

        colorSection.innerHTML = `
            <div class="setting-group">
                <label for="colorEnabled">Enable Color Texture</label>
                <div class="toggle-container">
                    <input type="checkbox" id="colorEnabled" ${this.enabled ? 'checked' : ''}>
                    <label for="colorEnabled" class="toggle-label"></label>
                </div>
            </div>
            <div class="setting-group">
                <label for="paletteSelect">Color Palette</label>
                <select id="paletteSelect" style="width: 100%; padding: 8px; border-radius: 4px; background-color: #555; color: #fff; border: 1px solid #666;">
                    ${paletteOptions}
                </select>
            </div>
        `;

        const enabledToggle = colorSection.querySelector('#colorEnabled');
        const paletteSelect = colorSection.querySelector('#paletteSelect');

        enabledToggle.addEventListener('change', (e) => {
            this.enabled = e.target.checked;
            this.onSettingsChanged();
        });

        paletteSelect.addEventListener('change', (e) => {
            this.currentPalette = e.target.value;
            this.onSettingsChanged();
        });
    }
    
    getColorAt(palette, alpha) {
        if (alpha <= palette[0].stop) {
            return palette[0].color;
        }
        if (alpha >= palette[palette.length - 1].stop) {
            return palette[palette.length - 1].color;
        }

        for (let i = 0; i < palette.length - 1; i++) {
            const start = palette[i];
            const end = palette[i + 1];
            if (alpha >= start.stop && alpha <= end.stop) {
                const t = (alpha - start.stop) / (end.stop - start.stop);
                return new THREE.Color().lerpColors(start.color, end.color, t);
            }
        }
        return palette[palette.length - 1].color; // Fallback
    }

    getSettings() {
        return {
            enabled: this.enabled,
            paletteName: this.currentPalette,
        };
    }

    onSettingsChanged() {
        const event = new CustomEvent('colorSettingsChanged', {
            detail: this.getSettings()
        });
        document.dispatchEvent(event);
    }
}

window.ColorGenerator = ColorGenerator;