import { playClickSound } from './router.js';

const VIDAPI_BASE = 'https://vidapi.ru';

const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMzQyZWNhZjBjNzNmYzU1NmI1NDk3NzQwYmJmZmE5MiIsIm5iZiI6MTc3NTIyMDE5OS42MDA5OTk4LCJzdWIiOiI2OWNmYjVlNzY4YjcwYWNmYjgyZjc2MmQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.jxycsZVC7uLmewooOKm20BvZUZ5s5H4qPsalI3FBmok';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p';
const TMDB_HEADERS = { accept: 'application/json', Authorization: `Bearer ${TMDB_TOKEN}` };

const FALLBACK_MOVIES = [
    { id: 157336, title: "Interstellar", overview: "The adventures of a group of explorers who make use of a newly discovered wormhole.", poster_path: `${TMDB_IMG}/w500/gEU2QvEw3Fg7lsbqgZ47Lj4GlKW.jpg`, backdrop_path: `${TMDB_IMG}/original/xjhKW2v9fj25elz77G60i4t4iE4.jpg`, vote_average: 8.4, release_date: "2014", popularity: 184.2, genre: "Sci-Fi, Adventure", embed_url: "" },
    { id: 603, title: "The Matrix", overview: "A computer hacker joins a group of underground freedom fighters.", poster_path: `${TMDB_IMG}/w500/f89U3wz6v26tSVLI8rT88Yv35j3.jpg`, backdrop_path: `${TMDB_IMG}/original/o0q6R6Bt7n364IQ24nTaC4RxvH1.jpg`, vote_average: 8.2, release_date: "1999", popularity: 110.5, genre: "Sci-Fi, Action", embed_url: "" },
    { id: 335984, title: "Blade Runner 2049", overview: "A new blade runner unearths a long-buried secret.", poster_path: `${TMDB_IMG}/w500/gGe580LnZgHYjuU1K14ysRh55S2.jpg`, backdrop_path: `${TMDB_IMG}/original/mVrY4143WLv7vLAYyNHSS8nWKzs.jpg`, vote_average: 7.6, release_date: "2017", popularity: 145.8, genre: "Sci-Fi, Action", embed_url: "" },
    { id: 27205, title: "Inception", overview: "A skilled thief extracts secrets during the dream state.", poster_path: `${TMDB_IMG}/w500/l9G6Vclt2h7J3971T3i9P9c8yZ8.jpg`, backdrop_path: `${TMDB_IMG}/original/s3Tld8H0oX2S6TAptHw2564R36c.jpg`, vote_average: 8.4, release_date: "2010", popularity: 154.2, genre: "Sci-Fi, Action, Adventure", embed_url: "" },
    { id: 693134, title: "Dune: Part Two", overview: "Paul Atreides unites with the Fremen.", poster_path: `${TMDB_IMG}/w500/czEM0wBpTyLg5OI8nJ3r6ZAI6P4.jpg`, backdrop_path: `${TMDB_IMG}/original/xOMo8BRK7ev26756u61ZcK6DC2K.jpg`, vote_average: 8.3, release_date: "2024", popularity: 290.4, genre: "Sci-Fi, Adventure", embed_url: "" },
];

const COMPANY_NAMES = {
    '': 'Trending',
    '213': 'Netflix',
    '19551': 'HBO',
    '174': 'Warner',
    '420': 'Marvel',
    '2': 'Disney',
};

class MovieEngine {
    constructor() {
        this.cardsContainer = document.getElementById('movie-cards-container');
        this.btnLeft = document.getElementById('carousel-left');
        this.btnRight = document.getElementById('carousel-right');

        this.overlay = document.getElementById('cinema-overlay');
        this.overlayBack = document.getElementById('cinema-overlay-back');
        this.overlayClose = document.getElementById('cinema-overlay-close');
        this.overlayBackdrop = document.getElementById('cinema-overlay-backdrop');
        this.overlayPoster = document.getElementById('cinema-overlay-poster');
        this.overlayTitle = document.getElementById('cinema-overlay-title');
        this.overlayYear = document.getElementById('cinema-overlay-year');
        this.overlayRating = document.getElementById('cinema-overlay-rating');
        this.overlayGenre = document.getElementById('cinema-overlay-genre');
        this.overlayOverview = document.getElementById('cinema-overlay-overview');
        this.overlayPlay = document.getElementById('cinema-overlay-play');
        this.overlayPlayer = document.getElementById('cinema-overlay-player');
        this.overlayIframe = document.getElementById('cinema-overlay-iframe');
        this.overlayExtra = document.getElementById('cinema-overlay-extra');
        this.overlayCast = document.getElementById('cinema-overlay-cast');
        this.overlayTrailers = document.getElementById('cinema-overlay-trailers');
        this.overlayPosters = document.getElementById('cinema-overlay-posters');

        this.heroBackdrop = document.getElementById('cinema-hero-backdrop');
        this.heroTitle = document.getElementById('cinema-hero-title');
        this.heroYear = document.getElementById('cinema-hero-year');
        this.heroRating = document.getElementById('cinema-hero-rating');
        this.heroGenre = document.getElementById('cinema-hero-genre');
        this.heroDesc = document.getElementById('cinema-hero-desc');
        this.heroBadge = document.getElementById('cinema-hero-badge');
        this.heroPlay = document.getElementById('cinema-hero-play');
        this.heroInfo = document.getElementById('cinema-hero-info');
        this.heroDots = document.getElementById('cinema-hero-dots');
        this.tabContainer = document.getElementById('cinema-tabs');
        this.searchInput = document.getElementById('cinema-search-input');
        this.searchBtn = document.getElementById('cinema-search-btn');

        this.allMovies = [];
        this.companyMovies = {};
        this.activeGenre = 'all';
        this.activeCompany = '';
        this.activeType = 'movie';
        this.currentMovie = null;
        this.heroItems = [];
        this.heroIndex = 0;
        this.heroTimer = null;

        this.celebrities = [];
        this.searchResultsMode = false;

        this.companyLogos = {};
        this.init();
    }

    init() {
        if (!this.cardsContainer) return;

        this.fetchAllContent();
        this.startHeroRotation();
        this.loadCompanyLogos();

        this.btnLeft.addEventListener('click', () => {
            playClickSound();
            this.cardsContainer.scrollBy({ left: -300, behavior: 'smooth' });
        });
        this.btnRight.addEventListener('click', () => {
            playClickSound();
            this.cardsContainer.scrollBy({ left: 300, behavior: 'smooth' });
        });

        document.querySelectorAll('.cinema-type-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                playClickSound();
                const type = tab.dataset.type;
                if (type === this.activeType) return;
                document.querySelectorAll('.cinema-type-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.activeType = type;
                document.querySelectorAll('.cinema-tab').forEach(t => t.classList.remove('active'));
                const trendingTab = document.querySelector('.cinema-tab[data-company=""]');
                if (trendingTab) trendingTab.classList.add('active');
                this.activeCompany = '';
                this.activeGenre = 'all';
                this.searchResultsMode = false;
                document.getElementById('genre-pill-slider').style.display = '';
                document.querySelectorAll('.genre-pill').forEach(p => p.classList.remove('active'));
                const allPill = document.querySelector('.genre-pill[data-genre="all"]');
                if (allPill) allPill.classList.add('active');
                this.fetchAllContent();
            });
        });

        document.querySelectorAll('.cinema-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                playClickSound();
                const company = tab.dataset.company || '';
                if (company === 'celebrities') {
                    this.showCelebrities();
                    return;
                }
                document.querySelectorAll('.cinema-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('cinema-search').style.display = '';
                this.activeCompany = company;
                this.searchResultsMode = false;
                this.switchCompany();
            });
        });

        document.querySelectorAll('.genre-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                playClickSound();
                document.querySelectorAll('.genre-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.activeGenre = pill.dataset.genre;
                this.filterAndRender();
            });
        });

        this.searchBtn.addEventListener('click', () => this.doSearch());
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.doSearch();
        });

        this.setupSearchSuggestions();

        this.overlayBack.addEventListener('click', () => {
            playClickSound();
            this.closeOverlay();
        });

        this.overlayClose.addEventListener('click', () => {
            playClickSound();
            this.closeOverlay();
        });

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.closeOverlay();
        });

        this.overlayPlay.addEventListener('click', () => this.playCurrentMovie());

        this.heroPlay.addEventListener('click', () => {
            if (this.currentHeroItem) this.showItemDetails(this.currentHeroItem);
        });

        this.heroInfo.addEventListener('click', () => {
            if (this.currentHeroItem) this.showItemDetails(this.currentHeroItem);
        });

        this.setupHeroSwipe();
    }

    setupHeroSwipe() {
        const hero = document.getElementById('cinema-hero');
        if (!hero) return;
        let startX = 0, isDragging = false;

        const onStart = (x) => { startX = x; isDragging = true; };
        const onMove = (x) => {
            if (!isDragging) return;
            const diff = x - startX;
            if (Math.abs(diff) > 30) {
                isDragging = false;
                if (diff > 0) this.heroPrev();
                else this.heroNext();
            }
        };
        const onEnd = () => { isDragging = false; };

        hero.addEventListener('mousedown', (e) => onStart(e.clientX));
        hero.addEventListener('mousemove', (e) => onMove(e.clientX));
        hero.addEventListener('mouseup', onEnd);
        hero.addEventListener('mouseleave', onEnd);
        hero.addEventListener('touchstart', (e) => onStart(e.touches[0].clientX), { passive: true });
        hero.addEventListener('touchmove', (e) => {
            if (isDragging) e.preventDefault();
            onMove(e.touches[0].clientX);
        }, { passive: false });
        hero.addEventListener('touchend', onEnd);
        hero.style.userSelect = 'none';
    }

    heroNext() {
        if (!this.heroItems.length) return;
        this.heroIndex = (this.heroIndex + 1) % this.heroItems.length;
        this.showHeroItem(this.heroIndex);
        this.resetHeroTimer();
    }

    heroPrev() {
        if (!this.heroItems.length) return;
        this.heroIndex = (this.heroIndex - 1 + this.heroItems.length) % this.heroItems.length;
        this.showHeroItem(this.heroIndex);
        this.resetHeroTimer();
    }

    resetHeroTimer() {
        if (this.heroTimer) { clearInterval(this.heroTimer); this.heroTimer = null; }
        this.heroTimer = setInterval(() => {
            this.heroIndex = (this.heroIndex + 1) % this.heroItems.length;
            this.showHeroItem(this.heroIndex);
        }, 6000);
    }

    closeOverlay() {
        this.overlayPlayer.classList.add('hidden');
        this.overlayIframe.src = '';
        this.overlayPlay.classList.remove('hidden');
        this.overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }

    /* ── Company Logos ── */

    loadCompanyLogos() {
        const logoMap = {
            '213': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
            '19551': 'https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg',
            '174': 'https://upload.wikimedia.org/wikipedia/commons/6/64/Warner_Bros_logo.svg',
            '420': 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Marvel_Logo.svg',
            '2': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
        };
        document.querySelectorAll('.tab-logo-img').forEach(img => {
            const cid = img.dataset.cid;
            if (logoMap[cid]) {
                img.src = logoMap[cid];
                img.style.display = 'inline';
            }
        });
    }

    /* ── Hero Rotation ── */

    async startHeroRotation() {
        try {
            const [moviesRes, tvRes] = await Promise.all([
                fetch(`${TMDB_BASE}/trending/movie/week?language=en-US`, { headers: TMDB_HEADERS }).then(r => r.json()),
                fetch(`${TMDB_BASE}/trending/tv/week?language=en-US`, { headers: TMDB_HEADERS }).then(r => r.json()),
            ]);

            const movieItems = (moviesRes.results || []).map(m => ({ ...m, media_type: 'movie' }));
            const tvItems = (tvRes.results || []).map(t => ({ ...t, media_type: 'tv' }));

            const combined = [];
            const maxLen = Math.max(movieItems.length, tvItems.length);
            for (let i = 0; i < maxLen && combined.length < 20; i++) {
                if (i < movieItems.length) combined.push(movieItems[i]);
                if (i < tvItems.length && combined.length < 20) combined.push(tvItems[i]);
            }

            this.heroItems = combined;
            if (this.heroItems.length === 0) return;

            this.renderHeroDots();
            this.showHeroItem(0);

            this.heroTimer = setInterval(() => {
                this.heroIndex = (this.heroIndex + 1) % this.heroItems.length;
                this.showHeroItem(this.heroIndex);
            }, 6000);
        } catch {}
    }

    renderHeroDots() {
        if (!this.heroDots) return;
        this.heroDots.innerHTML = '';
        this.heroItems.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = 'cinema-hero-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => {
                this.heroIndex = i;
                this.showHeroItem(i);
                this.resetHeroTimer();
            });
            this.heroDots.appendChild(dot);
        });
    }

    showHeroItem(index) {
        const item = this.heroItems[index];
        if (!item) return;
        this.currentHeroItem = item;

        const title = item.title || item.name || '';
        const year = (item.release_date || item.first_air_date || '').split('-')[0] || '—';
        const rating = item.vote_average ? item.vote_average.toFixed(1) : '—';
        const backdrop = item.backdrop_path ? `${TMDB_IMG}/original${item.backdrop_path}` : '';
        const overview = item.overview || '';
        const type = item.media_type === 'tv' ? 'Series' : 'Movie';

        if (this.heroBackdrop && backdrop) {
            this.heroBackdrop.style.backgroundImage = `url('${backdrop}')`;
            this.heroBackdrop.style.transition = 'background-image 0.8s ease';
        }
        if (this.heroBadge) this.heroBadge.textContent = `Trending ${type}`;
        if (this.heroTitle) this.heroTitle.textContent = title;
        if (this.heroYear) this.heroYear.textContent = year;
        if (this.heroRating) this.heroRating.textContent = `★ ${rating}`;
        if (this.heroDesc) this.heroDesc.textContent = overview;
        if (this.heroGenre) this.heroGenre.textContent = '';

        document.querySelectorAll('.cinema-hero-dot').forEach((d, i) => {
            d.classList.toggle('active', i === index);
        });
    }

    /* ── Company / Data ── */

    async fetchAllContent() {
        const label = this.activeType === 'tv' ? 'series' : 'movies';
        this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">Loading ${label}...</div>`;

        try {
            const res = await fetch(`${TMDB_BASE}/trending/${this.activeType}/week?language=en-US`, { headers: TMDB_HEADERS }).then(r => r.json());
            const items = (res.results || []).slice(0, 60).map(item => this.mapTrendingItem(item));
            if (items.length > 0) {
                this.allMovies = items;
                this.filterAndRender();
                return;
            }
            throw new Error('No results');
        } catch {
            this.allMovies = [...FALLBACK_MOVIES];
            this.filterAndRender();
        }
    }

    mapTrendingItem(item) {
        return {
            id: item.id,
            title: item.title || item.name || 'Untitled',
            release_date: (item.release_date || item.first_air_date || '').split('-')[0] || '',
            poster_path: item.poster_path ? `${TMDB_IMG}/w500${item.poster_path}` : '',
            backdrop_path: item.backdrop_path ? `${TMDB_IMG}/original${item.backdrop_path}` : '',
            vote_average: item.vote_average || 0,
            popularity: item.popularity || 0,
            genre: '',
            embed_url: item.id ? `https://vaplayer.ru/embed/${this.activeType}/${item.id}` : '',
            overview: item.overview || '',
            tagline: '',
        };
    }

    async switchCompany() {
        const companyId = this.activeCompany;
        const cacheKey = `${this.activeType}_${companyId}`;

        if (companyId === '') {
            document.getElementById('genre-pill-slider').style.display = '';
            this.filterAndRender();
            return;
        }

        document.getElementById('genre-pill-slider').style.display = 'none';

        if (this.companyMovies[cacheKey]) {
            this.renderMovies(this.companyMovies[cacheKey]);
            return;
        }

        const label = COMPANY_NAMES[companyId] || 'content';
        this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">Loading ${label}...</div>`;

        try {
            const pages = [1, 2, 3];
            const endpoint = this.activeType === 'tv'
                ? `/discover/tv?with_networks=${companyId}&sort_by=popularity.desc&include_adult=false`
                : `/discover/movie?with_companies=${companyId}&sort_by=popularity.desc&include_adult=false`;
            const results = await Promise.all(pages.map(p =>
                fetch(`${TMDB_BASE}${endpoint}&page=${p}`, { headers: TMDB_HEADERS }).then(r => r.json())
            ));
            let items = [];
            results.forEach(r => {
                if (r.results) items = items.concat(r.results);
            });

            const mapped = items.map(m => ({
                id: m.id,
                title: m.title || m.name || 'Untitled',
                release_date: (m.release_date || m.first_air_date || '').split('-')[0] || '',
                poster_path: m.poster_path ? `${TMDB_IMG}/w500${m.poster_path}` : '',
                backdrop_path: m.backdrop_path ? `${TMDB_IMG}/original${m.backdrop_path}` : '',
                vote_average: m.vote_average || 0,
                popularity: m.popularity || 0,
                genre: '',
                embed_url: m.id ? `https://vaplayer.ru/embed/${this.activeType}/${m.id}` : '',
                overview: m.overview || '',
                tagline: '',
            }));
            this.companyMovies[cacheKey] = mapped;
            this.renderMovies(mapped);
        } catch {
            this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">Failed to load.</div>`;
        }
    }

    filterAndRender() {
        this.searchResultsMode = false;
        if (this.activeGenre === 'all') {
            this.renderMovies(this.allMovies);
        } else {
            const filtered = this.allMovies.filter(m =>
                m.genre && m.genre.toLowerCase().includes(this.activeGenre)
            );
            this.renderMovies(filtered.length ? filtered : this.allMovies);
        }
    }

    renderMovies(movieList) {
        this.cardsContainer.innerHTML = '';
        if (!movieList.length) {
            this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">No results.</div>`;
            return;
        }
        movieList.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            const src = movie.poster_path || '';
            card.innerHTML = `
                <div class="movie-poster-wrapper">
                    ${src ? `<img src="${src}" alt="${movie.title}" class="movie-poster" loading="lazy">` : '<div class="movie-poster" style="background:rgba(255,255,255,0.03)"></div>'}
                </div>
                <div class="movie-card-info">
                    <h4 class="movie-title">${movie.title}</h4>
                    <div class="movie-meta-row">
                        <span>${movie.release_date || '—'}</span>
                        <span class="rating-badge">★ ${movie.vote_average ? movie.vote_average.toFixed(1) : '—'}</span>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => this.showItemDetails(movie));
            this.cardsContainer.appendChild(card);
        });
    }

    /* ── Celebrities ── */

    async showCelebrities() {
        playClickSound();
        document.querySelectorAll('.cinema-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.cinema-tab[data-company="celebrities"]').classList.add('active');
        document.getElementById('cinema-search').style.display = 'none';
        document.getElementById('genre-pill-slider').style.display = 'none';
        this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">Loading celebrities...</div>`;

        if (this.celebrities.length > 0) {
            this.renderCelebrities(this.celebrities);
            return;
        }

        try {
            const pages = [1, 2, 3];
            const results = await Promise.all(pages.map(p =>
                fetch(`${TMDB_BASE}/trending/person/week?language=en-US&page=${p}`, { headers: TMDB_HEADERS }).then(r => r.json())
            ));
            let people = [];
            results.forEach(r => {
                if (r.results) people = people.concat(r.results);
            });
            people = people.filter(p => p.known_for_department === 'Acting' && p.profile_path);
            people = people.slice(0, 60);
            this.celebrities = people;
            this.renderCelebrities(people);
        } catch {
            this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">Failed to load celebrities.</div>`;
        }
    }

    renderCelebrities(people) {
        this.cardsContainer.innerHTML = '';
        people.forEach(person => {
            const card = document.createElement('div');
            card.className = 'celebrity-card';
            const img = person.profile_path
                ? `<img src="${TMDB_IMG}/w185${person.profile_path}" alt="${person.name}" class="celebrity-img">`
                : `<div class="celebrity-img celebrity-placeholder">${person.name.charAt(0)}</div>`;
            const knownFor = (person.known_for || []).map(k => k.title || k.name || '').filter(Boolean).slice(0, 3).join(', ');
            card.innerHTML = `
                <div class="celebrity-img-wrap">${img}</div>
                <div class="celebrity-info">
                    <h4 class="celebrity-name">${person.name}</h4>
                    <div class="celebrity-known">${knownFor || 'Popular Actor'}</div>
                </div>
            `;
            card.addEventListener('click', () => this.showCelebrityDetails(person));
            this.cardsContainer.appendChild(card);
        });
    }

    async showCelebrityDetails(person) {
        playClickSound();
        this.closeOverlay();

        this.overlayBackdrop.style.backgroundImage = 'none';
        this.overlayPoster.src = person.profile_path ? `${TMDB_IMG}/w500${person.profile_path}` : '';
        this.overlayTitle.textContent = person.name;
        this.overlayYear.textContent = person.known_for_department || 'Actor';
        this.overlayRating.textContent = `★ ${person.popularity ? person.popularity.toFixed(1) : '—'}`;
        this.overlayGenre.textContent = '';
        this.overlayOverview.textContent = '';
        this.overlayPlay.classList.add('hidden');

        this.overlayExtra.innerHTML = `<div class="cinema-extra-row"><span class="label">Popularity</span><span class="value">${person.popularity ? person.popularity.toFixed(1) : '—'}</span></div>`;
        if (this.overlayCast) {
            this.overlayCast.innerHTML = '<div class="terminal-line text-muted">Loading filmography...</div>';
        }

        if (this.overlayTrailers) this.overlayTrailers.parentElement.style.display = 'none';
        if (this.overlayPosters) this.overlayPosters.parentElement.style.display = 'none';

        this.overlay.classList.remove('hidden');
        this.overlay.scrollTop = 0;
        document.body.style.overflow = 'hidden';

        try {
            const data = await fetch(`${TMDB_BASE}/person/${person.id}/movie_credits?language=en-US`, { headers: TMDB_HEADERS }).then(r => r.json());
            const cast = (data.cast || []).sort((a, b) => parseFloat(b.popularity || 0) - parseFloat(a.popularity || 0)).slice(0, 12);
            if (this.overlayCast) {
                this.overlayCast.innerHTML = '';
                cast.forEach(m => {
                    const img = m.poster_path
                        ? `<img src="${TMDB_IMG}/w185${m.poster_path}" alt="${m.title}" class="cast-img">`
                        : `<div class="cast-img cast-placeholder">${(m.title || '?').charAt(0)}</div>`;
                    const el = document.createElement('div');
                    el.className = 'cast-item';
                    el.innerHTML = `${img}<div class="cast-name">${m.title || 'Untitled'}</div><div class="cast-role">${m.character || ''}</div>`;
                    el.addEventListener('click', () => {
                        const movie = {
                            id: m.id,
                            title: m.title || 'Untitled',
                            overview: m.overview || '',
                            poster_path: m.poster_path ? `${TMDB_IMG}/w500${m.poster_path}` : '',
                            backdrop_path: '',
                            vote_average: m.vote_average || 0,
                            release_date: (m.release_date || '').split('-')[0] || '',
                            genre: '',
                            embed_url: m.id ? `https://vaplayer.ru/embed/movie/${m.id}` : '',
                        };
                        this.showItemDetails(movie);
                    });
                    this.overlayCast.appendChild(el);
                });
            }
        } catch {
            if (this.overlayCast) {
                this.overlayCast.innerHTML = '<div class="terminal-line text-muted">Filmography unavailable.</div>';
            }
        }
    }

    /* ── Search Suggestions ── */

    setupSearchSuggestions() {
        let debounceTimer;
        const container = document.createElement('div');
        container.className = 'search-suggestions';
        container.id = 'cinema-search-suggestions';
        this.searchInput.parentElement.style.position = 'relative';
        this.searchInput.parentElement.appendChild(container);

        this.searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const q = this.searchInput.value.trim();
            if (q.length < 2) { container.innerHTML = ''; container.classList.remove('active'); return; }
            debounceTimer = setTimeout(async () => {
                try {
                    const res = await fetch(`${TMDB_BASE}/search/multi?query=${encodeURIComponent(q)}&include_adult=false&language=en-US&page=1`, { headers: TMDB_HEADERS }).then(r => r.json());
                    const items = (res.results || []).filter(r => r.media_type === 'movie' || r.media_type === 'tv').slice(0, 6);
                    if (!items.length) { container.innerHTML = ''; container.classList.remove('active'); return; }
                    container.innerHTML = items.map(item => `
                        <div class="suggestion-item" data-id="${item.id}" data-title="${(item.title || item.name || '').replace(/"/g, '&quot;')}" data-year="${(item.release_date || item.first_air_date || '').split('-')[0] || ''}" data-poster="${item.poster_path ? TMDB_IMG + '/w92' + item.poster_path : ''}" data-type="${item.media_type}">
                            <div class="suggestion-poster">${item.poster_path ? `<img src="${TMDB_IMG}/w92${item.poster_path}" alt="">` : '<span class="suggestion-poster-fallback">&#127916;</span>'}</div>
                            <div class="suggestion-text">
                                <span class="suggestion-title">${item.title || item.name || ''}</span>
                                <span class="suggestion-channel">${item.media_type === 'tv' ? 'TV Series' : 'Movie'}${item.release_date || item.first_air_date ? ' • ' + (item.release_date || item.first_air_date).split('-')[0] : ''}</span>
                            </div>
                        </div>
                    `).join('');
                    container.classList.add('active');
                    container.querySelectorAll('.suggestion-item').forEach(el => {
                        el.addEventListener('click', () => {
                            container.innerHTML = '';
                            container.classList.remove('active');
                            this.searchInput.value = el.dataset.title;
                            this.doSearch();
                        });
                    });
                } catch { container.innerHTML = ''; container.classList.remove('active'); }
            }, 350);
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.cinema-search')) {
                container.innerHTML = '';
                container.classList.remove('active');
            }
        });
    }

    /* ── Search ── */

    async doSearch() {
        const query = this.searchInput.value.trim();
        if (!query) return;
        playClickSound();
        this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">Searching "${query}"...</div>`;

        document.querySelectorAll('.cinema-tab').forEach(t => t.classList.remove('active'));
        document.getElementById('genre-pill-slider').style.display = 'none';

        this.searchResultsMode = true;

        try {
            const res = await fetch(`${TMDB_BASE}/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`, { headers: TMDB_HEADERS }).then(r => r.json());
            const results = (res.results || []).filter(r => r.media_type === 'movie' || r.media_type === 'tv').slice(0, 40);

            if (results.length === 0) {
                this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">No results for "${query}".</div>`;
                return;
            }

            const mapped = results.map(r => ({
                id: r.id,
                title: r.title || r.name || 'Untitled',
                release_date: (r.release_date || r.first_air_date || '').split('-')[0] || '',
                poster_path: r.poster_path ? `${TMDB_IMG}/w500${r.poster_path}` : '',
                backdrop_path: r.backdrop_path ? `${TMDB_IMG}/original${r.backdrop_path}` : '',
                vote_average: r.vote_average || 0,
                popularity: r.popularity || 0,
                genre: r.media_type === 'tv' ? 'TV' : 'Movie',
                embed_url: r.media_type === 'movie' && r.id ? `https://vaplayer.ru/embed/movie/${r.id}` : '',
                overview: r.overview || '',
                tagline: '',
            }));
            this.renderMovies(mapped);
        } catch {
            this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">Search failed.</div>`;
        }
    }

    /* ── Detail overlay ── */

    showItemDetails(item) {
        playClickSound();
        this.closeOverlay();

        const backdropUrl = item.backdrop_path || '';
        const posterUrl = item.poster_path || '';

        this.overlayBackdrop.style.backgroundImage = backdropUrl ? `url('${backdropUrl}')` : 'none';
        this.overlayPoster.src = posterUrl || '';
        this.overlayTitle.textContent = item.title;
        this.overlayYear.textContent = item.release_date || '—';
        this.overlayRating.textContent = `★ ${item.vote_average ? item.vote_average.toFixed(1) : '—'}`;
        this.overlayGenre.textContent = item.genre || '';
        this.overlayOverview.textContent = item.overview || '';

        if (this.overlayExtra) {
            this.overlayExtra.innerHTML = `
                <div class="cinema-extra-row"><span class="label">Genres</span><span class="value">${item.genre || '—'}</span></div>
            `;
        }
        if (this.overlayCast) {
            this.overlayCast.innerHTML = '<div class="terminal-line text-muted">Loading details...</div>';
        }
        if (this.overlayPlay) {
            if (item.embed_url) {
                this.overlayPlay.classList.remove('hidden');
                this.currentMovie = item;
            } else {
                this.overlayPlay.classList.add('hidden');
            }
        }
        if (this.overlayTrailers) {
            this.overlayTrailers.innerHTML = '<div class="terminal-line text-muted">Loading trailers...</div>';
            this.overlayTrailers.parentElement.style.display = '';
        }
        if (this.overlayPosters) {
            this.overlayPosters.innerHTML = '<div class="terminal-line text-muted">Loading posters...</div>';
            this.overlayPosters.parentElement.style.display = '';
        }

        this.overlay.classList.remove('hidden');
        this.overlay.scrollTop = 0;
        document.body.style.overflow = 'hidden';

        if (item.id) this.fetchExtendedDetails(item.id);
    }

    playCurrentMovie() {
        if (!this.currentMovie || !this.currentMovie.embed_url) return;
        playClickSound();
        this.overlayIframe.src = this.currentMovie.embed_url;
        this.overlayPlayer.classList.remove('hidden');
        this.overlayPlay.classList.add('hidden');
    }

    async fetchExtendedDetails(movieId) {
        try {
            const data = await fetch(`${TMDB_BASE}/movie/${movieId}?append_to_response=credits,videos,images`, { headers: TMDB_HEADERS }).then(r => r.json());

            if (data.runtime && this.overlayExtra) {
                const genres = data.genres ? data.genres.map(g => g.name).join(', ') : '—';
                const runtime = data.runtime ? `${data.runtime} min` : '—';
                const budget = data.budget ? `$${(data.budget / 1e6).toFixed(1)}M` : '—';
                const revenue = data.revenue ? `$${(data.revenue / 1e6).toFixed(1)}M` : '—';
                const status = data.status || '—';
                const lang = data.original_language ? data.original_language.toUpperCase() : '—';
                this.overlayExtra.innerHTML = `
                    <div class="cinema-extra-row"><span class="label">Genres</span><span class="value">${genres}</span></div>
                    <div class="cinema-extra-row"><span class="label">Runtime</span><span class="value">${runtime}</span></div>
                    <div class="cinema-extra-row"><span class="label">Budget</span><span class="value">${budget}</span></div>
                    <div class="cinema-extra-row"><span class="label">Revenue</span><span class="value">${revenue}</span></div>
                    <div class="cinema-extra-row"><span class="label">Status</span><span class="value">${status}</span></div>
                    <div class="cinema-extra-row"><span class="label">Language</span><span class="value">${lang}</span></div>
                `;
            }

            if (data.overview && this.overlayOverview) {
                this.overlayOverview.textContent = data.overview;
            }
            if (data.backdrop_path && this.overlayBackdrop) {
                this.overlayBackdrop.style.backgroundImage = `url('${TMDB_IMG}/original${data.backdrop_path}')`;
            }

            /* ── Trailers ── */
            if (data.videos && data.videos.results && this.overlayTrailers) {
                this.overlayTrailers.innerHTML = '';
                const trailers = data.videos.results.filter(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
                if (trailers.length === 0) {
                    this.overlayTrailers.innerHTML = '<div class="terminal-line text-muted">No trailers available.</div>';
                } else {
                    trailers.slice(0, 4).forEach(v => {
                        const el = document.createElement('div');
                        el.className = 'trailer-item';
                        el.innerHTML = `
                            <div class="trailer-thumb" style="background-image:url('https://img.youtube.com/vi/${v.key}/mqdefault.jpg')">
                                <span class="trailer-play-icon">&#9654;</span>
                            </div>
                            <div class="trailer-name">${v.name}${v.type === 'Teaser' ? ' (Teaser)' : ''}</div>
                        `;
                        el.addEventListener('click', () => {
                            window.open(`https://www.youtube.com/watch?v=${v.key}`, '_blank');
                        });
                        this.overlayTrailers.appendChild(el);
                    });
                }
            }

            /* ── Posters ── */
            if (data.images && data.images.posters && this.overlayPosters) {
                this.overlayPosters.innerHTML = '';
                const posters = data.images.posters.slice(0, 10);
                if (posters.length === 0) {
                    this.overlayPosters.innerHTML = '<div class="terminal-line text-muted">No additional posters.</div>';
                } else {
                    posters.forEach(p => {
                        const el = document.createElement('div');
                        el.className = 'poster-item';
                        const src = `${TMDB_IMG}/w342${p.file_path}`;
                        el.innerHTML = `<img src="${src}" alt="Poster" loading="lazy">`;
                        el.addEventListener('click', () => {
                            window.open(`${TMDB_IMG}/original${p.file_path}`, '_blank');
                        });
                        this.overlayPosters.appendChild(el);
                    });
                }
            }

            /* ── Cast ── */
            if (data.credits && data.credits.cast && this.overlayCast) {
                this.overlayCast.innerHTML = '';
                data.credits.cast.slice(0, 12).forEach(person => {
                    const img = person.profile_path
                        ? `<img src="${TMDB_IMG}/w185${person.profile_path}" alt="${person.name}" class="cast-img">`
                        : `<div class="cast-img cast-placeholder">${person.name.charAt(0)}</div>`;
                    const el = document.createElement('div');
                    el.className = 'cast-item';
                    el.innerHTML = `${img}<div class="cast-name">${person.name}</div><div class="cast-role">${person.character || ''}</div>`;
                    el.addEventListener('click', () => {
                        this.showCelebrityDetails({
                            id: person.id,
                            name: person.name,
                            profile_path: person.profile_path,
                            known_for_department: person.known_for_department || 'Actor',
                            popularity: person.popularity || 0,
                        });
                    });
                    this.overlayCast.appendChild(el);
                });
            }
        } catch {
            if (this.overlayCast) {
                this.overlayCast.innerHTML = '<div class="terminal-line text-muted">Extended data unavailable.</div>';
            }
            if (this.overlayTrailers) {
                this.overlayTrailers.innerHTML = '<div class="terminal-line text-muted">Trailers unavailable.</div>';
            }
            if (this.overlayPosters) {
                this.overlayPosters.innerHTML = '<div class="terminal-line text-muted">Posters unavailable.</div>';
            }
        }
    }
}

export function initMovies() {
    new MovieEngine();
}
