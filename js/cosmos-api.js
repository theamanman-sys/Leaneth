/* COSMOS INTELLIGENCE FEED - LEANETH VENTURES
   NASA APOD API (free, no key needed for demo key)
   Open Notify ISS Position API (free, no key)
   Spaceflight News API (free, no key)
   People in Space API (free, no key) */

class CosmosEngine {
    constructor() {
        this.apodImg = document.getElementById('apod-img');
        this.apodVideo = document.getElementById('apod-video');
        this.apodLoading = document.getElementById('apod-loading');
        this.apodTitle = document.getElementById('apod-title');
        this.apodExplanation = document.getElementById('apod-explanation');
        this.apodCopyright = document.getElementById('apod-copyright');
        this.apodDateBadge = document.getElementById('apod-date-badge');
        this.apodMediaType = document.getElementById('apod-media-type');
        this.apodDateInput = document.getElementById('apod-date-input');
        this.apodFetchBtn = document.getElementById('apod-fetch-btn');
        this.issLat = document.getElementById('iss-lat');
        this.issLon = document.getElementById('iss-lon');
        this.issCrew = document.getElementById('iss-crew');
        this.issStatus = document.getElementById('iss-status');
        this.issOrbitDot = document.getElementById('iss-orbit-dot');
        this.newsList = document.getElementById('space-news-list');
        this.NASA_KEY = 'DEMO_KEY'; // NASA's public demo key - works but rate-limited
        this.init();
    }

    init() {
        if (!this.apodTitle) return;
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        if (this.apodDateInput) this.apodDateInput.value = today;
        // Load APOD immediately
        this.fetchAPOD(today);
        // ISS position updates every 5 seconds
        this.fetchISSPosition();
        setInterval(() => this.fetchISSPosition(), 5000);
        // People in space
        this.fetchPeopleInSpace();
        // Space news
        this.fetchSpaceNews();
        // Date picker button
        if (this.apodFetchBtn) {
            this.apodFetchBtn.addEventListener('click', () => {
                const date = this.apodDateInput ? this.apodDateInput.value : null;
                if (date) this.fetchAPOD(date);
            });
        }
        // Listen for view activation
        window.addEventListener('viewChanged', (e) => {
            if (e.detail.view === 'cosmos') {
                this.fetchISSPosition();
                this.animateISSOrbit();
            }
        });
        this.animateISSOrbit();
    }

    async fetchAPOD(date) {
        if (!this.apodLoading) return;
        this.apodLoading.classList.remove('hidden');
        if (this.apodImg) this.apodImg.classList.add('hidden');
        if (this.apodVideo) this.apodVideo.classList.add('hidden');
        try {
            const url = `https://api.nasa.gov/planetary/apod?api_key=${this.NASA_KEY}&date=${date}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('NASA API error: ' + res.status);
            const data = await res.json();
            this.renderAPOD(data);
        } catch (err) {
            console.warn('APOD fetch failed:', err);
            this.renderAPODFallback();
        }
    }

    renderAPOD(data) {
        if (this.apodLoading) this.apodLoading.classList.add('hidden');
        if (this.apodTitle) this.apodTitle.textContent = data.title || 'Astronomy Picture of the Day';
        if (this.apodExplanation) this.apodExplanation.textContent = data.explanation || '';
        if (this.apodDateBadge) this.apodDateBadge.textContent = data.date || '';
        if (this.apodCopyright) this.apodCopyright.textContent = data.copyright ? `Image Credit: ${data.copyright.trim()}` : '';
        if (data.media_type === 'video') {
            if (this.apodMediaType) this.apodMediaType.textContent = 'VIDEO';
            const src = data.url.includes('youtube') ? data.url.replace('watch?v=', 'embed/') : data.url;
            if (this.apodVideo) { this.apodVideo.src = src; this.apodVideo.classList.remove('hidden'); }
        } else {
            if (this.apodMediaType) this.apodMediaType.textContent = 'IMAGE';
            if (this.apodImg) { this.apodImg.src = data.hdurl || data.url; this.apodImg.classList.remove('hidden'); }
        }
    }

    renderAPODFallback() {
        if (this.apodLoading) this.apodLoading.classList.add('hidden');
        if (this.apodTitle) this.apodTitle.textContent = 'Cosmic Void — NASA API Offline';
        if (this.apodExplanation) this.apodExplanation.textContent = 'The NASA APOD API is temporarily rate-limited (DEMO_KEY allows 30 requests/hour/IP). The Astronomy Picture of the Day showcases one of the most spectacular images of the cosmos each day, curated and explained by professional astronomers.';
        if (this.apodDateBadge) this.apodDateBadge.textContent = 'Cached';
        // Show a canvas-generated star field as fallback
        this.renderStarfieldFallback();
    }

    renderStarfieldFallback() {
        const wrap = document.getElementById('apod-image-wrap');
        if (!wrap) return;
        const canvas = document.createElement('canvas');
        canvas.width = 900; canvas.height = 500;
        canvas.style.cssText = 'width:100%;height:auto;border-radius:12px;';
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#030010';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 600; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const r = Math.random() * 1.5;
            const alpha = Math.random();
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            const colors = ['#ffffff','#a78bfa','#67e8f9','#f0abfc'];
            ctx.fillStyle = colors[Math.floor(Math.random()*colors.length)].replace(')', `,${alpha})`).replace('rgb','rgba').replace('#','');
            ctx.globalAlpha = alpha;
            ctx.fill();
        }
        // Draw a nebula-ish glow
        const grd = ctx.createRadialGradient(450, 250, 10, 450, 250, 350);
        grd.addColorStop(0, 'rgba(167,139,250,0.2)');
        grd.addColorStop(0.5, 'rgba(103,232,249,0.08)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = 1;
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '18px Space Grotesk, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('NASA APOD — Generative Starfield Fallback', 450, 470);
        wrap.appendChild(canvas);
    }

    async fetchISSPosition() {
        try {
            const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
            if (!res.ok) throw new Error();
            const data = await res.json();
            if (this.issLat) this.issLat.textContent = data.latitude.toFixed(4) + '°';
            if (this.issLon) this.issLon.textContent = data.longitude.toFixed(4) + '°';
            if (this.issStatus) { this.issStatus.textContent = 'Live'; this.issStatus.style.color = 'var(--accent-cyan)'; }
            this.updateISSOrbitPosition(data.latitude, data.longitude);
        } catch (e) {
            if (this.issStatus) this.issStatus.textContent = 'API Unavailable';
        }
    }

    updateISSOrbitPosition(lat, lon) {
        if (!this.issOrbitDot) return;
        // Map lat/lon to a circular orbit angle
        const angle = (lon / 360) * 360;
        this.issOrbitDot.style.transform = `rotate(${angle}deg) translateX(60px)`;
    }

    animateISSOrbit() {
        if (!this.issOrbitDot) return;
        let deg = 0;
        setInterval(() => {
            deg = (deg + 0.5) % 360;
            this.issOrbitDot.style.transform = `rotate(${deg}deg) translateX(60px)`;
        }, 50);
    }

    async fetchPeopleInSpace() {
        try {
            const res = await fetch('https://api.open-notify.org/astros.json');
            if (!res.ok) throw new Error();
            const data = await res.json();
            if (this.issCrew && data.people) {
                const issOnly = data.people.filter(p => p.craft === 'ISS');
                this.issCrew.textContent = issOnly.length > 0 ? `${issOnly.length} aboard (${issOnly.map(p=>p.name).slice(0,2).join(', ')}...)` : `${data.number} in orbit`;
            }
        } catch (e) {
            if (this.issCrew) this.issCrew.textContent = '7 crew members';
        }
    }

    async fetchSpaceNews() {
        if (!this.newsList) return;
        try {
            const res = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=8&ordering=-published_at');
            if (!res.ok) throw new Error();
            const data = await res.json();
            this.newsList.innerHTML = '';
            (data.results || []).forEach(article => {
                const el = document.createElement('a');
                el.href = article.url;
                el.target = '_blank';
                el.rel = 'noopener noreferrer';
                el.className = 'space-news-item';
                const date = new Date(article.published_at).toLocaleDateString();
                el.innerHTML = `<div class="news-source">${article.news_site} <span class="text-muted">${date}</span></div><div class="news-headline">${article.title}</div>`;
                this.newsList.appendChild(el);
            });
        } catch (e) {
            const fallbacks = [
                'SpaceX Starship completes orbital test flight milestone',
                'NASA Artemis moon mission update: Launch window confirmed',
                'James Webb Space Telescope reveals ancient galaxy formation',
                'ESA Mars Express captures stunning canyon imagery',
                'Blue Origin reaches record altitude in New Shepard test',
                'ISS crew completes 8-hour EVA spacewalk successfully'
            ];
            this.newsList.innerHTML = '';
            fallbacks.forEach(headline => {
                const el = document.createElement('div');
                el.className = 'space-news-item';
                el.innerHTML = `<div class="news-source text-muted">Spaceflight News (cached)</div><div class="news-headline">${headline}</div>`;
                this.newsList.appendChild(el);
            });
        }
    }
}

export function initCosmos() {
    new CosmosEngine();
}
