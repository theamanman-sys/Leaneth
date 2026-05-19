/* SINGLE PAGE TRANSITION ROUTER - LEANETH VENTURES */

// Sound triggers
let isSoundEnabled = true;
const clickSound = document.getElementById('sound-click');

export function setSoundEnabled(enabled) {
    isSoundEnabled = enabled;
}

export function playClickSound() {
    if (isSoundEnabled && clickSound) {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
    }
}

// Router class
class Router {
    constructor() {
        this.panels = document.querySelectorAll('.view-panel');
        this.links = document.querySelectorAll('.nav-link');
        this.curtain = document.getElementById('transition-curtain');
        this.activeView = 'home';
        
        this.init();
    }

    init() {
        // Intercept hash changes and clicks
        window.addEventListener('hashchange', () => this.handleHashChange());
        
        // Initial route resolution
        this.handleHashChange();
    }

    handleHashChange() {
        const hash = window.location.hash.replace('#', '') || 'home';
        
        // If navigation target is the same as the active view, cancel
        if (hash === this.activeView && document.getElementById(hash).classList.contains('visible')) {
            return;
        }

        this.transitionTo(hash);
    }

    transitionTo(targetViewId) {
        const targetPanel = document.getElementById(targetViewId);
        if (!targetPanel) return;

        playClickSound();

        // 1. Swipe curtain in (cover screen)
        this.curtain.classList.remove('sweep-out');
        this.curtain.classList.add('active');

        setTimeout(() => {
            // 2. Perform DOM view swap while covered
            this.panels.forEach(panel => {
                panel.classList.remove('active', 'visible');
            });
            
            targetPanel.classList.add('active');
            
            // Highlight matching nav link
            this.links.forEach(link => {
                if (link.getAttribute('data-link') === targetViewId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });

            this.activeView = targetViewId;
            window.scrollTo({ top: 0, behavior: 'instant' });

            // 3. Let target panel know it needs to init/resize charts if needed
            const event = new CustomEvent('viewChanged', { detail: { view: targetViewId } });
            window.dispatchEvent(event);

            setTimeout(() => {
                // 4. Trigger slide in visibility transitions
                targetPanel.classList.add('visible');

                // 5. Sweep curtain out (uncover screen)
                this.curtain.classList.add('sweep-out');
                
                setTimeout(() => {
                    this.curtain.classList.remove('active');
                }, 600); // matches curtain sweep-out transition
                
            }, 150); // slight pause to let rendering thread catch up

        }, 600); // matches curtain slide-up transition
    }
}

let routerInstance;

export function initRouter() {
    routerInstance = new Router();
    return routerInstance;
}
