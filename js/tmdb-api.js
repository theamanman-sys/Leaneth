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

const GENRE_MAP = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
    80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
    14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
    9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
    10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

function mapGenres(m) {
    if (m.genres) return m.genres.map(g => g.name).join(', ');
    if (m.genre_ids) return m.genre_ids.map(id => GENRE_MAP[id]).filter(Boolean).join(', ');
    return '';
}

const WATCH_LABELS = {
    '9': 'Prime Video',
    '350': 'Apple TV+',
    '15': 'Hulu',
    '2303': 'Paramount+',
    '386': 'Peacock',
    '2528': 'YouTube TV',
    '257': 'fuboTV',
    '300': 'Pluto TV',
};

const CURATED_NETFLIX_IDS = [
    1297842, 1318447, 701387, 1290417, 875828,
    1234821, 850165, 985939, 1100988, 1306368,
    812583, 1245993, 639933, 1241983, 774370,
    744653, 1214554, 1263256, 803796, 635731,
    1151039, 1086637, 1280672, 1120911, 1180629,
    1214506, 1052280, 646097, 1154762, 974635,
    940721, 1083658, 1214521, 1226841, 906126,
    839369, 1115128, 1058647, 1400782,
];

const CURATED_HBO_IDS = [
    1233413, 933260, 1317288, 1078605, 786892,
    693134, 1054867, 1151031, 760329, 346698,
    858017, 62, 129, 78, 121,
    128, 1398, 593, 603, 286217,
    238, 240, 891, 1949, 429200,
    10775, 11368, 155, 414906, 968,
    204, 694, 25623, 348, 9552,
    31417, 30959, 346, 289, 422,
    872, 780, 5967, 3782, 499,
    445571, 391713, 914, 3082,
];

class MovieEngine {
    constructor() {
        this.cardsContainer = document.getElementById('movie-cards-container');
        this.btnLeft = document.getElementById('carousel-left');
        this.btnRight = document.getElementById('carousel-right');

        this.overlay = document.getElementById('cinema-overlay');
        this.overlayScroll = document.querySelector('.cinema-overlay-scroll');
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
        this.activeWatch = '';
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

        if (this.btnLeft) {
            this.btnLeft.addEventListener('click', () => {
                playClickSound();
                this.cardsContainer.scrollBy({ left: -300, behavior: 'smooth' });
            });
        }
        if (this.btnRight) {
            this.btnRight.addEventListener('click', () => {
                playClickSound();
                this.cardsContainer.scrollBy({ left: 300, behavior: 'smooth' });
            });
        }

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
                const genreSlider = document.getElementById('genre-pill-slider');
                if (genreSlider) genreSlider.style.display = '';
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
                const watch = tab.dataset.watch || '';
                if (company === 'celebrities') {
                    this.showCelebrities();
                    return;
                }
                document.querySelectorAll('.cinema-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const cinemaSearch = document.getElementById('cinema-search');
                if (cinemaSearch) cinemaSearch.style.display = '';
                this.activeCompany = company;
                this.activeWatch = watch;
                this.activeGenre = 'all';
                this.searchResultsMode = false;
                document.querySelectorAll('.genre-pill').forEach(p => p.classList.remove('active'));
                const allPill = document.querySelector('.genre-pill[data-genre="all"]');
                if (allPill) allPill.classList.add('active');
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

        if (this.searchBtn) this.searchBtn.addEventListener('click', () => this.doSearch());
        if (this.searchInput) {
            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.doSearch();
            });
            this.setupSearchSuggestions();
        }

        if (this.overlayBack) {
            this.overlayBack.addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation();
                playClickSound();
                this.closeOverlay();
            });
        }

        if (this.overlayClose) {
            this.overlayClose.addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation();
                playClickSound();
                this.closeOverlay();
            });
        }

        if (this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay || e.target.classList.contains('cinema-overlay-scroll')) this.closeOverlay();
            });
        }

        if (this.overlayPlay) this.overlayPlay.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); this.playCurrentMovie(); });

        // Delegated handlers: ensure back/play work even if direct listeners miss clicks
        document.addEventListener('click', (e) => {
            try {
                const t = e.target;
                if (!t) return;
                const backBtn = t.closest && t.closest('#cinema-overlay-back');
                if (backBtn) {
                    e.preventDefault(); e.stopPropagation(); playClickSound(); this.closeOverlay(); return;
                }
                const playBtn = t.closest && t.closest('#cinema-overlay-play');
                if (playBtn) {
                    e.preventDefault(); e.stopPropagation(); playClickSound(); this.playCurrentMovie(); return;
                }
            } catch (err) {}
        }, true);

        if (this.heroPlay) {
            this.heroPlay.addEventListener('click', () => {
                if (this.currentHeroItem) this.showItemDetails(this.currentHeroItem);
            });
        }

        if (this.heroInfo) {
            this.heroInfo.addEventListener('click', () => {
                if (this.currentHeroItem) this.showItemDetails(this.currentHeroItem);
            });
        }

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
        this.overlay.classList.remove('celebrity-mode');
        this.overlayPlayer.classList.add('hidden');
        this.overlayIframe.src = '';
        this.overlayPlay.classList.remove('hidden');
        this.overlay.classList.add('hidden');
        document.body.style.overflow = '';
        const picker = document.getElementById('episode-picker');
        if (picker) picker.classList.add('hidden');
    }

    /* ── Company Logos ── */

    loadCompanyLogos() {
        const logoMap = {
            '213': 'https://1000logos.net/wp-content/uploads/2017/05/Netflix-Logo.png',
            '19551': 'https://1000logos.net/wp-content/uploads/2022/02/HBO-Max-Logo.png',
            '174': 'https://1000logos.net/wp-content/uploads/2020/09/Warner-Bros-Logo.png',
            '420': 'https://1000logos.net/wp-content/uploads/2023/01/Marvel-Studios-logo.png',
            '2': 'https://1000logos.net/wp-content/uploads/2021/01/Disney-Plus-Logo.png',
            '9': 'https://1000logos.net/wp-content/uploads/2022/10/Amazon-Prime-Video-Logo.png',
            '350': 'https://1000logos.net/wp-content/uploads/2022/02/Apple-TV-Logo-1.png',
            '15': 'https://1000logos.net/wp-content/uploads/2021/04/Hulu-logo.png',
            '2303': 'https://1000logos.net/wp-content/uploads/2024/02/CBS-All-Access-Logo.png',
            '386': 'https://1000logos.net/wp-content/uploads/2023/09/Peacock-Logo.png',
            '2528': 'https://1000logos.net/wp-content/uploads/2021/12/YouTube-TV-Logo.png',
            '257': 'https://1000logos.net/wp-content/uploads/2024/02/FuboTV-Logo.png',
            '300': 'https://1000logos.net/wp-content/uploads/2025/07/Pluto-TV-Logo.png',
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
        const activeDot = document.querySelector('.cinema-hero-dot.active');
        if (activeDot) activeDot.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
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
            media_type: this.activeType,
            title: item.title || item.name || 'Untitled',
            release_date: (item.release_date || item.first_air_date || '').split('-')[0] || '',
            poster_path: item.poster_path ? `${TMDB_IMG}/w500${item.poster_path}` : '',
            backdrop_path: item.backdrop_path ? `${TMDB_IMG}/original${item.backdrop_path}` : '',
            vote_average: item.vote_average || 0,
            popularity: item.popularity || 0,
            genre: mapGenres(item),
            embed_url: '',
            overview: item.overview || '',
            tagline: '',
        };
    }

    async switchCompany() {
        const companyId = this.activeCompany;
        const cacheKey = `${this.activeType}_${companyId}`;

        if (companyId === '' && !this.activeWatch) {
            document.getElementById('genre-pill-slider').style.display = '';
            this.filterAndRender();
            return;
        }

        document.getElementById('genre-pill-slider').style.display = 'none';

        if (this.companyMovies[cacheKey]) {
            this.renderMovies(this.companyMovies[cacheKey]);
            return;
        }

        if (companyId === '213' && this.activeType === 'movie') {
            await this.loadCuratedNetflix();
            return;
        }

        if (companyId === '19551' && this.activeType === 'movie') {
            await this.loadCuratedHBO();
            return;
        }

        if (this.activeWatch) {
            await this.loadWatchProvider();
            return;
        }

        const label = COMPANY_NAMES[companyId] || 'content';
        this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">Loading ${label}...</div>`;

        try {
            const pages = [1, 2, 3];
            const endpoint = `/discover/${this.activeType}?with_companies=${companyId}&sort_by=popularity.desc&include_adult=false`;
            const results = await Promise.all(pages.map(p =>
                fetch(`${TMDB_BASE}${endpoint}&page=${p}`, { headers: TMDB_HEADERS }).then(r => r.json())
            ));
            let items = [];
            results.forEach(r => {
                if (r.results) items = items.concat(r.results);
            });

            const mapped = items.map(m => ({
                id: m.id,
                media_type: this.activeType,
                title: m.title || m.name || 'Untitled',
                release_date: (m.release_date || m.first_air_date || '').split('-')[0] || '',
                poster_path: m.poster_path ? `${TMDB_IMG}/w500${m.poster_path}` : '',
                backdrop_path: m.backdrop_path ? `${TMDB_IMG}/original${m.backdrop_path}` : '',
                vote_average: m.vote_average || 0,
                popularity: m.popularity || 0,
                genre: mapGenres(m),
                embed_url: '',
                overview: m.overview || '',
                tagline: '',
            }));
            this.companyMovies[cacheKey] = mapped;
            this.renderMovies(mapped);
        } catch {
            this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">Failed to load.</div>`;
        }
    }

    async loadCuratedNetflix() {
        const cacheKey = `movie_213`;
        if (this.companyMovies[cacheKey]) {
            this.renderMovies(this.companyMovies[cacheKey]);
            return;
        }

        this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">Loading Netflix...</div>`;

        const mapped = [];
        const seenIds = new Set();

        const toEntry = (m) => ({
            id: m.id,
            media_type: 'movie',
            title: m.title || 'Untitled',
            release_date: (m.release_date || '').split('-')[0] || '',
            poster_path: m.poster_path ? `${TMDB_IMG}/w500${m.poster_path}` : '',
            backdrop_path: m.backdrop_path ? `${TMDB_IMG}/original${m.backdrop_path}` : '',
            vote_average: m.vote_average || 0,
            popularity: m.popularity || 0,
            genre: mapGenres(m),
            embed_url: '',
            overview: m.overview || '',
            tagline: '',
        });

        const sleep = (ms) => new Promise(r => setTimeout(r, ms));

        for (let i = 0; i < CURATED_NETFLIX_IDS.length; i += 3) {
            const batch = CURATED_NETFLIX_IDS.slice(i, i + 3);
            const results = await Promise.all(batch.map(id =>
                fetch(`${TMDB_BASE}/movie/${id}?language=en-US`, { headers: TMDB_HEADERS })
                    .then(r => r.ok ? r.json() : null)
                    .catch(() => null)
            ));
            let changed = false;
            results.forEach(m => {
                if (m && m.success !== false && !seenIds.has(m.id)) {
                    seenIds.add(m.id);
                    mapped.push(toEntry(m));
                    changed = true;
                }
            });
            if (changed) {
                this.companyMovies[cacheKey] = [...mapped];
                this.renderMovies(this.companyMovies[cacheKey]);
            }
            await sleep(700);
        }

        if (mapped.length === 0) {
            this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">No Netflix movies loaded.</div>`;
        }
    }

    async loadCuratedHBO() {
        const cacheKey = `movie_19551`;
        if (this.companyMovies[cacheKey]) {
            this.renderMovies(this.companyMovies[cacheKey]);
            return;
        }

        this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">Loading HBO...</div>`;

        const mapped = [];
        const seenIds = new Set();

        const toEntry = (m) => ({
            id: m.id,
            media_type: 'movie',
            title: m.title || 'Untitled',
            release_date: (m.release_date || '').split('-')[0] || '',
            poster_path: m.poster_path ? `${TMDB_IMG}/w500${m.poster_path}` : '',
            backdrop_path: m.backdrop_path ? `${TMDB_IMG}/original${m.backdrop_path}` : '',
            vote_average: m.vote_average || 0,
            popularity: m.popularity || 0,
            genre: mapGenres(m),
            embed_url: '',
            overview: m.overview || '',
            tagline: '',
        });

        const sleep = (ms) => new Promise(r => setTimeout(r, ms));

        for (let i = 0; i < CURATED_HBO_IDS.length; i += 3) {
            const batch = CURATED_HBO_IDS.slice(i, i + 3);
            const results = await Promise.all(batch.map(id =>
                fetch(`${TMDB_BASE}/movie/${id}?language=en-US`, { headers: TMDB_HEADERS })
                    .then(r => r.ok ? r.json() : null)
                    .catch(() => null)
            ));
            let changed = false;
            results.forEach(m => {
                if (m && m.success !== false && !seenIds.has(m.id)) {
                    seenIds.add(m.id);
                    mapped.push(toEntry(m));
                    changed = true;
                }
            });
            if (changed) {
                this.companyMovies[cacheKey] = [...mapped];
                this.renderMovies(this.companyMovies[cacheKey]);
            }
            await sleep(700);
        }

        if (mapped.length === 0) {
            this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">No HBO movies loaded.</div>`;
        }
    }

    async loadWatchProvider() {
        const watchId = this.activeWatch;
        const cacheKey = `${this.activeType}_watch_${watchId}`;

        if (this.companyMovies[cacheKey]) {
            this.renderMovies(this.companyMovies[cacheKey]);
            return;
        }

        const label = WATCH_LABELS[watchId] || 'Streaming';
        this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">Loading ${label}...</div>`;

        try {
            const pages = [1, 2, 3];
            const endpoint = `/discover/${this.activeType}?with_watch_providers=${watchId}&watch_region=US&sort_by=popularity.desc&include_adult=false`;
            const results = await Promise.all(pages.map(p =>
                fetch(`${TMDB_BASE}${endpoint}&page=${p}`, { headers: TMDB_HEADERS }).then(r => r.json())
            ));
            let items = [];
            results.forEach(r => {
                if (r.results) items = items.concat(r.results);
            });

            const mapped = items.map(m => ({
                id: m.id,
                media_type: this.activeType,
                title: m.title || m.name || 'Untitled',
                release_date: (m.release_date || m.first_air_date || '').split('-')[0] || '',
                poster_path: m.poster_path ? `${TMDB_IMG}/w500${m.poster_path}` : '',
                backdrop_path: m.backdrop_path ? `${TMDB_IMG}/original${m.backdrop_path}` : '',
                vote_average: m.vote_average || 0,
                popularity: m.popularity || 0,
                genre: mapGenres(m),
                embed_url: '',
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
            people.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
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

        this.overlay.classList.add('celebrity-mode');
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
        if (this.overlayScroll) this.overlayScroll.scrollTop = 0;
        else this.overlay.scrollTop = 0;
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
                            genre: mapGenres(m),
                            embed_url: m.id ? `${VIDAPI_BASE}/embed/movie/${m.id}` : '',
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
                media_type: r.media_type,
                title: r.title || r.name || 'Untitled',
                release_date: (r.release_date || r.first_air_date || '').split('-')[0] || '',
                poster_path: r.poster_path ? `${TMDB_IMG}/w500${r.poster_path}` : '',
                backdrop_path: r.backdrop_path ? `${TMDB_IMG}/original${r.backdrop_path}` : '',
                vote_average: r.vote_average || 0,
                popularity: r.popularity || 0,
                genre: r.media_type === 'tv' ? 'TV' : 'Movie',
                embed_url: '',
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
            this.overlayPlay.classList.remove('hidden');
            this.overlayPlay.textContent = 'Loading...';
            this.currentMovie = item;
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
        if (this.overlayScroll) this.overlayScroll.scrollTop = 0;
        else this.overlay.scrollTop = 0;
        document.body.style.overflow = 'hidden';

        if (item.id) this.fetchExtendedDetails(item.id, item.media_type || this.activeType);
    }

    playCurrentMovie() {
        if (!this.currentMovie) return;
        const item = this.currentMovie;
        playClickSound();

        if (item.media_type === 'tv') {
            this.overlayPlay.classList.add('hidden');
            this.showSeasonPicker(item);
            return;
        }

        if (!item.embed_url) {
            item.embed_url = `${VIDAPI_BASE}/embed/movie/${item.id}`;
        }
        this.overlayIframe.src = item.embed_url;
        this.overlayPlayer.classList.remove('hidden');
        this.overlayPlay.classList.add('hidden');
        // Scroll player into view inside overlay
        try {
            if (this.overlayPlayer) {
                this.overlayPlayer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } catch (e) {}
    }

    async showSeasonPicker(item) {
        const picker = document.getElementById('episode-picker');
        const inner = document.getElementById('episode-picker-inner');
        if (!picker || !inner) return;

        picker.classList.remove('hidden');
        inner.innerHTML = '<div class="terminal-line text-muted">Loading episodes...</div>';

        try {
            const data = await fetch(`${TMDB_BASE}/tv/${item.id}`, { headers: TMDB_HEADERS }).then(r => r.json());
            const seasons = (data.seasons || []).filter(s => s.season_number > 0);
            if (seasons.length === 0) {
                inner.innerHTML = '<button class="btn btn-primary btn-glow" id="ep-play-btn">▶ Play Series</button>';
                document.getElementById('ep-play-btn').addEventListener('click', () => {
                    this.overlayIframe.src = `${VIDAPI_BASE}/embed/tv/${item.id}/1/1`;
                    this.overlayPlayer.classList.remove('hidden');
                    this.overlayPlay.classList.add('hidden');
                });
                return;
            }
            let html = '<div class="ep-picker-row"><label>Season</label><select id="ep-season-select" class="ep-select">';
            seasons.forEach(s => {
                html += `<option value="${s.season_number}">${s.name || 'Season ' + s.season_number}${s.episode_count ? ' (' + s.episode_count + ' eps)' : ''}</option>`;
            });
            html += '</select></div>';
            html += '<div class="ep-picker-row"><label>Episode</label><select id="ep-episode-select" class="ep-select"></select></div>';
            html += '<button class="btn btn-primary btn-glow" id="ep-play-btn">▶ Play Episode</button>';
            inner.innerHTML = html;

            const seasonSelect = document.getElementById('ep-season-select');
            const episodeSelect = document.getElementById('ep-episode-select');

            const loadEpisodes = async (seasonNum) => {
                try {
                    const epData = await fetch(`${TMDB_BASE}/tv/${item.id}/season/${seasonNum}`, { headers: TMDB_HEADERS }).then(r => r.json());
                    const episodes = epData.episodes || [];
                    episodeSelect.innerHTML = episodes.map(e =>
                        `<option value="${e.episode_number}">${e.episode_number}. ${e.name || 'Episode ' + e.episode_number}</option>`
                    ).join('');
                } catch {
                    episodeSelect.innerHTML = '<option value="1">Episode 1</option>';
                }
            };

            seasonSelect.addEventListener('change', () => loadEpisodes(parseInt(seasonSelect.value)));
            await loadEpisodes(parseInt(seasonSelect.value));

            document.getElementById('ep-play-btn').addEventListener('click', () => {
                const s = seasonSelect.value;
                const e = episodeSelect.value;
                this.overlayIframe.src = `${VIDAPI_BASE}/embed/tv/${item.id}/${s}/${e}`;
                this.overlayPlayer.classList.remove('hidden');
                this.overlayPlay.classList.add('hidden');
            });
        } catch {
            inner.innerHTML = '<button class="btn btn-primary btn-glow" id="ep-play-btn">▶ Play Series</button>';
            const btn = document.getElementById('ep-play-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    this.overlayIframe.src = `${VIDAPI_BASE}/embed/tv/${item.id}/1/1`;
                    this.overlayPlayer.classList.remove('hidden');
                    this.overlayPlay.classList.add('hidden');
                });
            }
        }
    }

    async fetchExtendedDetails(itemId, mediaType) {
        const isTv = mediaType === 'tv';
        const endpoint = isTv ? 'tv' : 'movie';
        try {
            const data = await fetch(`${TMDB_BASE}/${endpoint}/${itemId}?append_to_response=credits,videos,images`, { headers: TMDB_HEADERS }).then(r => r.json());

            if (this.overlayExtra) {
                const genres = data.genres ? data.genres.map(g => g.name).join(', ') : '—';
                const status = data.status || '—';
                const lang = data.original_language ? data.original_language.toUpperCase() : '—';
                let extra = `
                    <div class="cinema-extra-row"><span class="label">Genres</span><span class="value">${genres}</span></div>
                    <div class="cinema-extra-row"><span class="label">Status</span><span class="value">${status}</span></div>
                    <div class="cinema-extra-row"><span class="label">Language</span><span class="value">${lang}</span></div>
                `;
                if (isTv) {
                    const seasons = data.number_of_seasons || '—';
                    const episodes = data.number_of_episodes || '—';
                    const lastAir = data.last_air_date || '—';
                    extra += `
                        <div class="cinema-extra-row"><span class="label">Seasons</span><span class="value">${seasons}</span></div>
                        <div class="cinema-extra-row"><span class="label">Episodes</span><span class="value">${episodes}</span></div>
                        <div class="cinema-extra-row"><span class="label">Last Air</span><span class="value">${lastAir}</span></div>
                    `;
                } else {
                    const runtime = data.runtime ? `${data.runtime} min` : '—';
                    const budget = data.budget ? `$${(data.budget / 1e6).toFixed(1)}M` : '—';
                    const revenue = data.revenue ? `$${(data.revenue / 1e6).toFixed(1)}M` : '—';
                    extra += `
                        <div class="cinema-extra-row"><span class="label">Runtime</span><span class="value">${runtime}</span></div>
                        <div class="cinema-extra-row"><span class="label">Budget</span><span class="value">${budget}</span></div>
                        <div class="cinema-extra-row"><span class="label">Revenue</span><span class="value">${revenue}</span></div>
                    `;
                }
                this.overlayExtra.innerHTML = extra;
            }

            if (data.overview && this.overlayOverview) {
                this.overlayOverview.textContent = data.overview;
            }
            if (data.backdrop_path && this.overlayBackdrop) {
                this.overlayBackdrop.style.backgroundImage = `url('${TMDB_IMG}/original${data.backdrop_path}')`;
            }

            /* Enable play button or episode picker for TV */
            if (this.overlayPlay && this.currentMovie) {
                this.currentMovie.media_type = mediaType;
                if (isTv) {
                    this.overlayPlay.classList.add('hidden');
                    this.showSeasonPicker(this.currentMovie);
                } else {
                    this.overlayPlay.classList.remove('hidden');
                    this.overlayPlay.textContent = '▶ Play';
                }
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
                            const embed = `https://www.youtube.com/embed/${v.key}?autoplay=1&rel=0&modestbranding=1`;
                            if (this.overlayIframe) {
                                this.overlayIframe.src = embed;
                            }
                            if (this.overlayPlayer) {
                                this.overlayPlayer.classList.remove('hidden');
                            }
                            if (this.overlayPlay) {
                                this.overlayPlay.classList.add('hidden');
                            }
                            try {
                                if (this.overlayPlayer) {
                                    this.overlayPlayer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            } catch (e) {}
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
