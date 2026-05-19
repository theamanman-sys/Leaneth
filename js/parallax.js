/* 3D SCROLL PARALLAX & MOUSE TILT ENGINE - LEANETH VENTURES */

class ParallaxEngine {
    constructor() {
        this.container = document.querySelector('.parallax-container');
        this.bg = document.querySelector('.layer-bg');
        this.grid = document.querySelector('.layer-grid');
        this.shape1 = document.querySelector('.layer-shape-1 img');
        this.shape2 = document.querySelector('.layer-shape-2 img');
        this.text = document.querySelector('.layer-text');
        
        // Parallax values
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        
        this.scrollY = 0;
        this.targetScrollY = 0;
        
        this.active = true;

        this.init();
    }

    init() {
        if (!this.container) return;

        // Mouse Move Listener for 3D Tilt
        window.addEventListener('mousemove', (e) => {
            if (!this.active) return;
            
            // Normalize coordinates: center is (0,0), limits are (-1, -1) to (1, 1)
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.targetMouseX = (e.clientX - width / 2) / (width / 2);
            this.targetMouseY = (e.clientY - height / 2) / (height / 2);
        });

        // Scroll Listener
        window.addEventListener('scroll', () => {
            if (!this.active) return;
            this.targetScrollY = window.scrollY;
        });

        // Listen for router changes to deactivate performance calculations on non-home pages
        window.addEventListener('viewChanged', (e) => {
            this.active = (e.detail.view === 'home');
        });

        // Start animation loop
        this.tick();
    }

    tick() {
        requestAnimationFrame(() => this.tick());

        if (!this.active) return;

        // 1. Mouse interpolation (Inertia lerp)
        const lerpFactor = 0.08;
        this.mouseX += (this.targetMouseX - this.mouseX) * lerpFactor;
        this.mouseY += (this.targetMouseY - this.mouseY) * lerpFactor;

        // 2. Scroll interpolation (Inertia lerp)
        this.scrollY += (this.targetScrollY - this.scrollY) * 0.1;

        // 3. Apply scroll-driven transforms (translates Z axis & fades layers)
        if (this.bg) {
            this.bg.style.transform = `translate3d(0, ${this.scrollY * 0.2}px, -10px) scale(2.2)`;
        }
        if (this.grid) {
            this.grid.style.transform = `translate3d(0, ${this.scrollY * 0.4}px, -6px) scale(1.7)`;
        }
        if (this.text) {
            // Text scrolls normally and fades out
            const opacity = Math.max(0, 1 - (this.scrollY / 600));
            this.text.style.transform = `translate3d(${this.mouseX * 25}px, ${this.scrollY * 0.75 + this.mouseY * 25}px, 0px) scale(${1 - this.scrollY * 0.0005})`;
            this.text.style.opacity = opacity;
        }

        // 4. Apply mouse hover 3D shift to midground shapes + scroll depth zoom
        if (this.shape1) {
            this.shape1.style.transform = `translate3d(${this.mouseX * 60}px, ${this.mouseY * 60}px, 0px) rotate(${this.mouseX * 15}deg)`;
        }
        if (this.shape2) {
            this.shape2.style.transform = `translate3d(${this.mouseX * -80}px, ${this.mouseY * -80}px, 0px) rotate(${this.mouseX * -20}deg)`;
        }
    }
}

export function initParallax() {
    new ParallaxEngine();
}
