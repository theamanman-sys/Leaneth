/* TMDB CINEMATIC ENGINE - Full Movie Data - LEANETH VENTURES */

import { playClickSound } from './router.js';

const TMDB_KEY = '5208e5da3f57c0f88f10d53f67f8865f';
const TMDB_BASE = 'https://api.themoviedb.org/3';

const GENRE_MAP = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
    80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
    14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
    9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
    53: 'Thriller', 10752: 'War', 37: 'Western',
};

const FALLBACK_MOVIES = [
    { id: 157336, title: "Interstellar", tagline: "Mankind was born on Earth. It was never meant to die here.", overview: "The adventures of a group of explorers who make use of a newly discovered wormhole.", poster_path: "/gEU2QvEw3Fg7lsbqgZ47Lj4GlKW.jpg", backdrop_path: "/xjhKW2v9fj25elz77G60i4t4iE4.jpg", vote_average: 8.4, release_date: "2014-11-05", popularity: 184.2, genre_ids: [878, 12], runtime: 169, budget: 165000000, revenue: 701729206 },
    { id: 603, title: "The Matrix", tagline: "Free your mind.", overview: "A computer hacker joins a group of underground freedom fighters against AI systems.", poster_path: "/f89U3wz6v26tSVLI8rT88Yv35j3.jpg", backdrop_path: "/o0q6R6Bt7n364IQ24nTaC4RxvH1.jpg", vote_average: 8.2, release_date: "1999-03-30", popularity: 110.5, genre_ids: [878, 28], runtime: 136, budget: 63000000, revenue: 463517383 },
    { id: 335984, title: "Blade Runner 2049", tagline: "There's still a page left in the story.", overview: "A new blade runner unearths a long-buried secret.", poster_path: "/gGe580LnZgHYjuU1K14ysRh55S2.jpg", backdrop_path: "/mVrY4143WLv7vLAYyNHSS8nWKzs.jpg", vote_average: 7.6, release_date: "2017-10-04", popularity: 145.8, genre_ids: [878, 28], runtime: 164, budget: 150000000, revenue: 267402194 },
    { id: 27205, title: "Inception", tagline: "Your mind is the scene of the crime.", overview: "A skilled thief extracts secrets from deep within the subconscious during the dream state.", poster_path: "/l9G6Vclt2h7J3971T3i9P9c8yZ8.jpg", backdrop_path: "/s3Tld8H0oX2S6TAptHw2564R36c.jpg", vote_average: 8.4, release_date: "2010-07-14", popularity: 154.2, genre_ids: [878, 28, 12], runtime: 148, budget: 160000000, revenue: 829895144 },
    { id: 693134, title: "Dune: Part Two", tagline: "Long live the fighters.", overview: "Paul Atreides unites with the Fremen on a path of revenge.", poster_path: "/czEM0wBpTyLg5OI8nJ3r6ZAI6P4.jpg", backdrop_path: "/xOMo8BRK7ev26756u61ZcK6DC2K.jpg", vote_average: 8.3, release_date: "2024-02-27", popularity: 290.4, genre_ids: [878, 12], runtime: 166, budget: 190000000, revenue: 711800000 },
    { id: 264660, title: "Ex Machina", tagline: "To erase the line between man and machine is to obscure the line between man and god.", overview: "A coder wins a competition to spend a week at a remote mountain retreat.", poster_path: "/d75w1ndKqqcxTLIM7563uii9i44.jpg", backdrop_path: "/m99F2Y31lTOWfB14S4323E7u33.jpg", vote_average: 7.6, release_date: "2015-01-21", popularity: 88.9, genre_ids: [878, 35], runtime: 108, budget: 15000000, revenue: 36869414 },
];

class MovieEngine {
    constructor() {
        this.cardsContainer = document.getElementById('movie-cards-container');
        this.btnLeft = document.getElementById('carousel-left');
        this.btnRight = document.getElementById('carousel-right');
        this.focusPanel = document.getElementById('movie-focus-panel');
        this.focusClose = document.getElementById('movie-focus-close');
        this.focusBackdrop = document.getElementById('movie-focus-backdrop');
        this.focusPoster = document.getElementById('movie-focus-poster');
        this.focusTitle = document.getElementById('movie-focus-title');
        this.focusYear = document.getElementById('movie-focus-year');
        this.focusTagline = document.getElementById('movie-focus-tagline');
        this.focusOverview = document.getElementById('movie-focus-overview');
        this.focusRating = document.getElementById('movie-focus-rating');
        this.focusPop = document.getElementById('movie-focus-pop');
        this.extraDetails = document.getElementById('movie-extra-details');
        this.castContainer = document.getElementById('movie-cast');

        this.movies = [];
        this.activeGenre = 'all';
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
            pill.addEventListener('click', (e) => {
                playClickSound();
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.activeGenre = pill.getAttribute('data-genre');
                this.filterAndRender();
            });
        });

        this.focusClose.addEventListener('click', () => {
            playClickSound();
            this.focusPanel.classList.add('hidden');
        });
    }

    async fetchAllMovies() {
        this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">Loading movies from TMDB...</div>`;

        try {
            const pages = [1, 2, 3];
            const results = await Promise.all(pages.map(p =>
                fetch(`${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&sort_by=popularity.desc&include_adult=false&page=${p}`)
                    .then(r => r.json())
            ));
            let all = [];
            results.forEach(r => { if (r.results) all = all.concat(r.results); });

            if (all.length > 20) {
                all.sort((a, b) => b.popularity - a.popularity);
                this.movies = all;
                this.filterAndRender();
                return;
            }
            throw new Error('No results');
        } catch {
            this.movies = [...FALLBACK_MOVIES];
            this.filterAndRender();
        }
    }

    filterAndRender() {
        if (this.activeGenre === 'all') {
            this.renderMovies(this.movies);
        } else {
            const filtered = this.movies.filter(m =>
                m.genre_ids && m.genre_ids.includes(parseInt(this.activeGenre))
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
            const posterUrl = movie.poster_path
                ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
                : '';
            card.innerHTML = `
                <div class="movie-poster-wrapper">
                    ${posterUrl ? `<img src="${posterUrl}" alt="${movie.title}" class="movie-poster" loading="lazy">` : '<div class="movie-poster" style="background:rgba(255,255,255,0.03)"></div>'}
                </div>
                <div class="movie-card-info">
                    <h4 class="movie-title">${movie.title}</h4>
                    <div class="movie-meta-row">
                        <span>${movie.release_date ? movie.release_date.split('-')[0] : '—'}</span>
                        <span class="rating-badge">★ ${movie.vote_average ? movie.vote_average.toFixed(1) : '—'}</span>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => this.showMovieDetails(movie));
            this.cardsContainer.appendChild(card);
        });
    }

    async showMovieDetails(movie) {
        playClickSound();

        const backdropUrl = movie.backdrop_path
            ? (movie.backdrop_path.startsWith('http') ? movie.backdrop_path : `https://image.tmdb.org/t/p/original${movie.backdrop_path}`)
            : '';
        const posterUrl = movie.poster_path
            ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
            : '';

        this.focusBackdrop.style.backgroundImage = backdropUrl ? `url('${backdropUrl}')` : 'none';
        this.focusPoster.src = posterUrl || '';
        this.focusTitle.textContent = movie.title;
        this.focusYear.textContent = movie.release_date ? movie.release_date.split('-')[0] : '—';
        this.focusTagline.textContent = movie.tagline || '';
        this.focusOverview.textContent = movie.overview;
        this.focusRating.textContent = movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : '—';
        this.focusPop.textContent = movie.popularity ? movie.popularity.toFixed(2) : '—';

        if (this.extraDetails) {
            const genres = movie.genre_ids
                ? movie.genre_ids.map(id => GENRE_MAP[id] || '').filter(Boolean).join(', ')
                : (movie.genres ? movie.genres.map(g => g.name).join(', ') : '—');
            const runtime = movie.runtime ? `${movie.runtime} min` : '—';
            const budget = movie.budget ? `$${(movie.budget / 1e6).toFixed(1)}M` : '—';
            const revenue = movie.revenue ? `$${(movie.revenue / 1e6).toFixed(1)}M` : '—';
            this.extraDetails.innerHTML = `
                <div class="movie-detail-row"><span class="detail-label">Genres</span><span class="detail-val">${genres}</span></div>
                <div class="movie-detail-row"><span class="detail-label">Runtime</span><span class="detail-val">${runtime}</span></div>
                <div class="movie-detail-row"><span class="detail-label">Budget</span><span class="detail-val">${budget}</span></div>
                <div class="movie-detail-row"><span class="detail-label">Revenue</span><span class="detail-val">${revenue}</span></div>
            `;
        }

        if (this.castContainer) {
            this.castContainer.innerHTML = '<div class="terminal-line text-muted">Loading cast...</div>';
        }

        this.focusPanel.classList.remove('hidden');
        this.focusPanel.scrollIntoView({ behavior: 'smooth', block: 'end' });

        this.fetchExtendedDetails(movie.id);
    }

    async fetchExtendedDetails(movieId) {
        try {
            const data = await fetch(`${TMDB_BASE}/movie/${movieId}?api_key=${TMDB_KEY}&append_to_response=credits`).then(r => r.json());

            if (data.runtime && this.extraDetails) {
                const genres = data.genres ? data.genres.map(g => g.name).join(', ') : '—';
                const runtime = data.runtime ? `${data.runtime} min` : '—';
                const budget = data.budget ? `$${(data.budget / 1e6).toFixed(1)}M` : '—';
                const revenue = data.revenue ? `$${(data.revenue / 1e6).toFixed(1)}M` : '—';
                const status = data.status || '—';
                const lang = data.original_language ? data.original_language.toUpperCase() : '—';
                this.extraDetails.innerHTML = `
                    <div class="movie-detail-row"><span class="detail-label">Genres</span><span class="detail-val">${genres}</span></div>
                    <div class="movie-detail-row"><span class="detail-label">Runtime</span><span class="detail-val">${runtime}</span></div>
                    <div class="movie-detail-row"><span class="detail-label">Budget</span><span class="detail-val">${budget}</span></div>
                    <div class="movie-detail-row"><span class="detail-label">Revenue</span><span class="detail-val">${revenue}</span></div>
                    <div class="movie-detail-row"><span class="detail-label">Status</span><span class="detail-val">${status}</span></div>
                    <div class="movie-detail-row"><span class="detail-label">Language</span><span class="detail-val">${lang}</span></div>
                `;
            }

            if (data.credits && data.credits.cast && this.castContainer) {
                this.castContainer.innerHTML = '';
                const topCast = data.credits.cast.slice(0, 8);
                topCast.forEach(person => {
                    const img = person.profile_path
                        ? `<img src="https://image.tmdb.org/t/p/w185${person.profile_path}" alt="${person.name}" class="cast-img">`
                        : `<div class="cast-img cast-placeholder">${person.name.charAt(0)}</div>`;
                    const el = document.createElement('div');
                    el.className = 'cast-item';
                    el.innerHTML = `${img}<div class="cast-name">${person.name}</div><div class="cast-role">${person.character || ''}</div>`;
                    this.castContainer.appendChild(el);
                });
            }
        } catch {
            if (this.castContainer) {
                this.castContainer.innerHTML = '<div class="terminal-line text-muted">Cast data unavailable.</div>';
            }
        }
    }
}

export function initMovies() {
    new MovieEngine();
}
