export class UIManager {
    constructor(panelWrapper, optionsBtn, closeBtn) {
        this.panelWrapper = panelWrapper;
        this.optionsBtn = optionsBtn;
        this.closeBtn = closeBtn;
        this.panelWidthPx = 24 * 16; // 24rem
        this.currentWidth = 0;
        this.targetWidth = 0;

        this.optionsBtn.addEventListener('click', () => this.open());
        this.closeBtn.addEventListener('click', () => this.close());

        document.querySelectorAll('.panel-section-header').forEach(header => {
            header.addEventListener('click', () => {
                const section = header.closest('.panel-section');
                section.classList.toggle('collapsed');
                section.querySelector('.panel-section-content').classList.toggle('hidden');
            });
        });
    }

    open() { this.targetWidth = this.panelWidthPx; }
    close() { this.targetWidth = 0; }

    update(delta) {
        const needsUpdate = Math.abs(this.currentWidth - this.targetWidth) > 0.1;
        if (needsUpdate) {
            const speed = 10;
            const diff = this.targetWidth - this.currentWidth;
            this.currentWidth += diff * speed * delta;
            if (Math.abs(diff) < 0.5) this.currentWidth = this.targetWidth;
            this.panelWrapper.style.width = `${this.currentWidth}px`;
        }
        this.optionsBtn.style.display = this.currentWidth < 1 ? 'block' : 'none';
        return needsUpdate;
    }
}
