import { playClickSound } from './router.js';

const VIDAPI_BASE = 'https://vidapi.ru';

const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMzQyZWNhZjBjNzNmYzU1NmI1NDk3NzQwYmJmZmE5MiIsIm5iZiI6MTc3NTIyMDE5OS42MDA5OTk4LCJzdWIiOiI2OWNmYjVlNzY4YjcwYWNmYjgyZjc2MmQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.jxycsZVC7uLmewooOKm20BvZUZ5s5H4qPsalI3FBmok';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_HEADERS = { accept: 'application/json', Authorization: `Bearer ${TMDB_TOKEN}` };

const FALLBACK_MOVIES = [
    { id: 157336, title: "Interstellar", tagline: "Mankind was born on Earth. It was never meant to die here.", overview: "The adventures of a group of explorers who make use of a newly discovered wormhole.", poster_path: "https://image.tmdb.org/t/p/w500/gEU2QvEw3Fg7lsbqgZ47Lj4GlKW.jpg", backdrop_path: "https://image.tmdb.org/t/p/original/xjhKW2v9fj25elz77G60i4t4iE4.jpg", vote_average: 8.4, release_date: "2014", popularity: 184.2, genre: "Sci-Fi, Adventure", embed_url: "" },
    { id: 603, title: "The Matrix", tagline: "Free your mind.", overview: "A computer hacker joins a group of underground freedom fighters against AI systems.", poster_path: "https://image.tmdb.org/t/p/w500/f89U3wz6v26tSVLI8rT88Yv35j3.jpg", backdrop_path: "https://image.tmdb.org/t/p/original/o0q6R6Bt7n364IQ24nTaC4RxvH1.jpg", vote_average: 8.2, release_date: "1999", popularity: 110.5, genre: "Sci-Fi, Action", embed_url: "" },
    { id: 335984, title: "Blade Runner 2049", tagline: "There's still a page left in the story.", overview: "A new blade runner unearths a long-buried secret.", poster_path: "https://image.tmdb.org/t/p/w500/gGe580LnZgHYjuU1K14ysRh55S2.jpg", backdrop_path: "https://image.tmdb.org/t/p/original/mVrY4143WLv7vLAYyNHSS8nWKzs.jpg", vote_average: 7.6, release_date: "2017", popularity: 145.8, genre: "Sci-Fi, Action", embed_url: "" },
    { id: 27205, title: "Inception", tagline: "Your mind is the scene of the crime.", overview: "A skilled thief extracts secrets from deep within the subconscious during the dream state.", poster_path: "https://image.tmdb.org/t/p/w500/l9G6Vclt2h7J3971T3i9P9c8yZ8.jpg", backdrop_path: "https://image.tmdb.org/t/p/original/s3Tld8H0oX2S6TAptHw2564R36c.jpg", vote_average: 8.4, release_date: "2010", popularity: 154.2, genre: "Sci-Fi, Action, Adventure", embed_url: "" },
    { id: 693134, title: "Dune: Part Two", tagline: "Long live the fighters.", overview: "Paul Atreides unites with the Fremen on a path of revenge.", poster_path: "https://image.tmdb.org/t/p/w500/czEM0wBpTyLg5OI8nJ3r6ZAI6P4.jpg", backdrop_path: "https://image.tmdb.org/t/p/original/xOMo8BRK7ev26756u61ZcK6DC2K.jpg", vote_average: 8.3, release_date: "2024", popularity: 290.4, genre: "Sci-Fi, Adventure", embed_url: "" },
    { id: 264660, title: "Ex Machina", tagline: "To erase the line between man and machine is to obscure the line between man and god.", overview: "A coder wins a competition to spend a week at a remote mountain retreat.", poster_path: "https://image.tmdb.org/t/p/w500/d75w1ndKqqcxTLIM7563uii9i44.jpg", backdrop_path: "https://image.tmdb.org/t/p/original/m99F2Y31lTOWfB14S4323E7u33.jpg", vote_average: 7.6, release_date: "2015", popularity: 88.9, genre: "Sci-Fi, Comedy", embed_url: "" },
];

class MovieEngine {
    constructor() {
        this.cardsContainer = document.getElementById('movie-cards-container');
        this.btnLeft = document.getElementById('carousel-left');
        this.btnRight = document.getElementById('carousel-right');

        this.overlay = document.getElementById('cinema-overlay');
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

        this.heroBackdrop = document.getElementById('cinema-hero-backdrop');
        this.heroTitle = document.getElementById('cinema-hero-title');
        this.heroYear = document.getElementById('cinema-hero-year');
        this.heroRating = document.getElementById('cinema-hero-rating');
        this.heroGenre = document.getElementById('cinema-hero-genre');
        this.heroDesc = document.getElementById('cinema-hero-desc');
        this.heroPlay = document.getElementById('cinema-hero-play');
        this.heroInfo = document.getElementById('cinema-hero-info');

        this.movies = [];
        this.activeGenre = 'all';
        this.currentMovie = null;
        this.init();
    }

    init() {
        if (!this.cardsContainer) return;

        this.fetchAllMovies();

        this.btnLeft.addEventListener('click', () => {
            playClickSound();
            this.cardsContainer.scrollBy({ left: -300, behavior: 'smooth' });
        });
        this.btnRight.addEventListener('click', () => {
            playClickSound();
            this.cardsContainer.scrollBy({ left: 300, behavior: 'smooth' });
        });

        const pills = document.querySelectorAll('.genre-pill');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                playClickSound();
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.activeGenre = pill.getAttribute('data-genre');
                this.filterAndRender();
            });
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
            if (this.currentMovie) {
                this.showMovieDetails(this.currentMovie);
            }
        });

        this.heroInfo.addEventListener('click', () => {
            if (this.currentMovie) {
                this.showMovieDetails(this.currentMovie);
            }
        });
    }

    closeOverlay() {
        this.overlayPlayer.classList.add('hidden');
        this.overlayIframe.src = '';
        this.overlayPlay.classList.remove('hidden');
        this.overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }

    async fetchAllMovies() {
        this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">Loading movies...</div>`;

        try {
            const pages = [1, 2, 3];
            const results = await Promise.all(pages.map(p =>
                fetch(`${VIDAPI_BASE}/movies/latest/page-${p}.json`).then(r => r.json())
            ));
            let all = [];
            results.forEach(r => {
                if (r.items) all = all.concat(r.items);
            });

            if (all.length > 0) {
                all.sort((a, b) => parseFloat(b.popularity || 0) - parseFloat(a.popularity || 0));
                this.movies = all.map(item => this.mapVidApiItem(item));
                this.setHero(this.movies[0]);
                this.filterAndRender();
                return;
            }
            throw new Error('No results');
        } catch {
            this.movies = [...FALLBACK_MOVIES];
            this.setHero(this.movies[0]);
            this.filterAndRender();
        }
    }

    setHero(movie) {
        if (!movie) return;
        this.currentMovie = movie;
        if (this.heroBackdrop && movie.backdrop_path) {
            this.heroBackdrop.style.backgroundImage = `url('${movie.backdrop_path}')`;
        }
        if (this.heroTitle) this.heroTitle.textContent = movie.title;
        if (this.heroYear) this.heroYear.textContent = movie.release_date || '—';
        if (this.heroRating) this.heroRating.textContent = `★ ${movie.vote_average ? movie.vote_average.toFixed(1) : '—'}`;
        if (this.heroGenre) this.heroGenre.textContent = movie.genre || '';
        if (this.heroDesc) this.heroDesc.textContent = movie.overview || 'Discover the latest movies';

        this.fetchBackdrop(movie);
    }

    async fetchBackdrop(movie) {
        if (!movie.id) return;
        try {
            const data = await fetch(`${TMDB_BASE}/movie/${movie.id}`, { headers: TMDB_HEADERS }).then(r => r.json());
            if (data.backdrop_path && this.heroBackdrop) {
                const url = `https://image.tmdb.org/t/p/original${data.backdrop_path}`;
                this.heroBackdrop.style.backgroundImage = `url('${url}')`;
                movie.backdrop_path = url;
            }
            if (data.overview && this.heroDesc) {
                this.heroDesc.textContent = data.overview;
                movie.overview = data.overview;
            }
            if (data.tagline) movie.tagline = data.tagline;
        } catch {}
    }

    mapVidApiItem(item) {
        const id = parseInt(item.tmdb_id) || 0;
        return {
            id: id,
            imdb_id: item.imdb_id || '',
            title: item.title || 'Untitled',
            release_date: item.year || '',
            poster_path: item.poster_url || '',
            backdrop_path: '',
            vote_average: parseFloat(item.rating) || 0,
            popularity: parseFloat(item.popularity) || 0,
            genre: item.genre || '',
            embed_url: item.embed_url || '',
            tagline: '',
            overview: '',
        };
    }

    filterAndRender() {
        if (this.activeGenre === 'all') {
            this.renderMovies(this.movies);
        } else {
            const filtered = this.movies.filter(m =>
                m.genre && m.genre.toLowerCase().includes(this.activeGenre)
            );
            this.renderMovies(filtered.length ? filtered : this.movies);
        }
    }

    renderMovies(movieList) {
        this.cardsContainer.innerHTML = '';
        if (!movieList.length) {
            this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">No movies found.</div>`;
            return;
        }
        movieList.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            const posterUrl = movie.poster_path || '';
            card.innerHTML = `
                <div class="movie-poster-wrapper">
                    ${posterUrl ? `<img src="${posterUrl}" alt="${movie.title}" class="movie-poster" loading="lazy">` : '<div class="movie-poster" style="background:rgba(255,255,255,0.03)"></div>'}
                </div>
                <div class="movie-card-info">
                    <h4 class="movie-title">${movie.title}</h4>
                    <div class="movie-meta-row">
                        <span>${movie.release_date || '—'}</span>
                        <span class="rating-badge">★ ${movie.vote_average ? movie.vote_average.toFixed(1) : '—'}</span>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => this.showMovieDetails(movie));
            this.cardsContainer.appendChild(card);
        });
    }

    showMovieDetails(movie) {
        playClickSound();
        this.closeOverlay();

        const backdropUrl = movie.backdrop_path || '';
        const posterUrl = movie.poster_path || '';

        this.overlayBackdrop.style.backgroundImage = backdropUrl ? `url('${backdropUrl}')` : 'none';
        this.overlayPoster.src = posterUrl || '';
        this.overlayTitle.textContent = movie.title;
        this.overlayYear.textContent = movie.release_date || '—';
        this.overlayRating.textContent = `★ ${movie.vote_average ? movie.vote_average.toFixed(1) : '—'}`;
        this.overlayGenre.textContent = movie.genre || '—';
        this.overlayOverview.textContent = movie.overview || '';

        if (this.overlayExtra) {
            this.overlayExtra.innerHTML = `
                <div class="cinema-extra-row"><span class="label">Genres</span><span class="value">${movie.genre || '—'}</span></div>
            `;
        }

        if (this.overlayCast) {
            this.overlayCast.innerHTML = '<div class="terminal-line text-muted">Loading details...</div>';
        }

        if (this.overlayPlay) {
            if (movie.embed_url) {
                this.overlayPlay.classList.remove('hidden');
                this.currentMovie = movie;
            } else {
                this.overlayPlay.classList.add('hidden');
            }
        }

        this.overlay.classList.remove('hidden');
        this.overlay.scrollTop = 0;
        document.body.style.overflow = 'hidden';

        if (movie.id) {
            this.fetchExtendedDetails(movie.id);
        }
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
            const data = await fetch(`${TMDB_BASE}/movie/${movieId}?append_to_response=credits`, { headers: TMDB_HEADERS }).then(r => r.json());

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
                this.overlayBackdrop.style.backgroundImage = `url('https://image.tmdb.org/t/p/original${data.backdrop_path}')`;
            }

            if (data.credits && data.credits.cast && this.overlayCast) {
                this.overlayCast.innerHTML = '';
                const topCast = data.credits.cast.slice(0, 8);
                topCast.forEach(person => {
                    const img = person.profile_path
                        ? `<img src="https://image.tmdb.org/t/p/w185${person.profile_path}" alt="${person.name}" class="cast-img">`
                        : `<div class="cast-img cast-placeholder">${person.name.charAt(0)}</div>`;
                    const el = document.createElement('div');
                    el.className = 'cast-item';
                    el.innerHTML = `${img}<div class="cast-name">${person.name}</div><div class="cast-role">${person.character || ''}</div>`;
                    this.overlayCast.appendChild(el);
                });
            }
        } catch {
            if (this.overlayCast) {
                this.overlayCast.innerHTML = '<div class="terminal-line text-muted">Extended data unavailable.</div>';
            }
        }
    }
}

export function initMovies() {
    new MovieEngine();
}
