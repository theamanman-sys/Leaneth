/* TMDB CINEMATIC INTEGRATION ENGINE - LEANETH VENTURES */

import { playClickSound } from './router.js';

// Ultra-premium sci-fi movie dataset for instant offline rendering
const FALLBACK_MOVIES = [
    {
        id: 157336,
        title: "Interstellar",
        tagline: "Mankind was born on Earth. It was never meant to die here.",
        overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
        poster_path: "/gEU2QvEw3Fg7lsbqgZ47Lj4GlKW.jpg",
        backdrop_path: "/xjhKW2v9fj25elz77G60i4t4iE4.jpg",
        vote_average: 8.4,
        release_date: "2014-11-05",
        popularity: 184.2,
        genre_ids: [878, 12]
    },
    {
        id: 603,
        title: "The Matrix",
        tagline: "Free your mind.",
        overview: "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground freedom fighters in their battle against the powerful artificial intelligence systems that control humanity.",
        poster_path: "/f89U3wz6v26tSVLI8rT88Yv35j3.jpg",
        backdrop_path: "/o0q6R6Bt7n364IQ24nTaC4RxvH1.jpg",
        vote_average: 8.2,
        release_date: "1999-03-30",
        popularity: 110.5,
        genre_ids: [878, 28]
    },
    {
        id: 335984,
        title: "Blade Runner 2049",
        tagline: "There's still a page left in the story.",
        overview: "Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos.",
        poster_path: "/gGe580LnZgHYjuU1K14ysRh55S2.jpg",
        backdrop_path: "/mVrY4143WLv7vLAYyNHSS8nWKzs.jpg",
        vote_average: 7.6,
        release_date: "2017-10-04",
        popularity: 145.8,
        genre_ids: [878, 28]
    },
    {
        id: 27205,
        title: "Inception",
        tagline: "Your mind is the scene of the crime.",
        overview: "Cobb, a skilled thief who is the absolute best in the dangerous art of extraction, steals valuable secrets from deep within the subconscious during the dream state, when the mind is at its most vulnerable.",
        poster_path: "/l9G6Vclt2h7J3971T3i9P9c8yZ8.jpg",
        backdrop_path: "/s3Tld8H0oX2S6TAptHw2564R36c.jpg",
        vote_average: 8.4,
        release_date: "2010-07-14",
        popularity: 154.2,
        genre_ids: [878, 28, 12]
    },
    {
        id: 693134,
        title: "Dune: Part Two",
        tagline: "Long live the fighters.",
        overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.",
        poster_path: "/czEM0wBpTyLg5OI8nJ3r6ZAI6P4.jpg",
        backdrop_path: "/xOMo8BRK7ev26756u61ZcK6DC2K.jpg",
        vote_average: 8.3,
        release_date: "2024-02-27",
        popularity: 290.4,
        genre_ids: [878, 12]
    },
    {
        id: 264660,
        title: "Ex Machina",
        tagline: "To erase the line between man and machine is to obscure the line between man and god.",
        overview: "Caleb, a 26-year-old coder at the world's largest internet company, wins a competition to spend a week at a private mountain retreat belonging to Nathan, the reclusive CEO of the company. But when Caleb arrives in this remote location, he finds that he will have to participate in a strange and fascinating experiment.",
        poster_path: "/d75w1ndKqqcxTLIM7563uii9i44.jpg",
        backdrop_path: "/m99F2Y31lTOWfB14S4323E7u33.jpg",
        vote_average: 7.6,
        release_date: "2015-01-21",
        popularity: 88.9,
        genre_ids: [878, 35] // Mapped to drama/thriller/sci-fi, fits here
    }
];

class MovieEngine {
    constructor() {
        this.cardsContainer = document.getElementById('movie-cards-container');
        this.btnLeft = document.getElementById('carousel-left');
        this.btnRight = document.getElementById('carousel-right');
        
        // Key elements
        this.keyInput = document.getElementById('tmdb-key-input');
        this.connectBtn = document.getElementById('tmdb-connect-btn');
        
        // Detail panel elements
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
        
        this.movies = [...FALLBACK_MOVIES];
        this.activeGenre = 'all';
        this.tmdbKey = localStorage.getItem('leaneth_tmdb_key') || '';

        this.init();
    }

    init() {
        if (!this.cardsContainer) return;

        // Restore key input if saved
        if (this.tmdbKey) {
            this.keyInput.value = '••••••••••••••••••••••••';
            this.keyInput.setAttribute('disabled', 'true');
            this.connectBtn.textContent = 'Disconnect';
            this.connectBtn.classList.add('btn-secondary');
            this.fetchLiveMovies();
        } else {
            this.renderMovies(this.movies);
        }

        // Connect/Disconnect key button
        this.connectBtn.addEventListener('click', () => this.toggleKeyConnection());

        // Setup Carousel Scrolling controls
        this.btnLeft.addEventListener('click', () => {
            playClickSound();
            this.cardsContainer.scrollBy({ left: -300, behavior: 'smooth' });
        });
        
        this.btnRight.addEventListener('click', () => {
            playClickSound();
            this.cardsContainer.scrollBy({ left: 300, behavior: 'smooth' });
        });

        // Genre filter buttons
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

        // Detail panel close
        this.focusClose.addEventListener('click', () => {
            playClickSound();
            this.focusPanel.classList.add('hidden');
        });
    }

    toggleKeyConnection() {
        playClickSound();
        if (this.tmdbKey) {
            // Disconnect Key
            this.tmdbKey = '';
            localStorage.removeItem('leaneth_tmdb_key');
            this.keyInput.removeAttribute('disabled');
            this.keyInput.value = '';
            this.connectBtn.textContent = 'Connect Key';
            this.connectBtn.classList.remove('btn-secondary');
            
            // Reload local fallback data
            this.movies = [...FALLBACK_MOVIES];
            this.filterAndRender();
        } else {
            // Connect Key
            const val = this.keyInput.value.trim();
            if (!val) {
                alert('Please input a valid TMDB Read Access Token (JWT).');
                return;
            }
            this.tmdbKey = val;
            localStorage.setItem('leaneth_tmdb_key', val);
            this.keyInput.setAttribute('disabled', 'true');
            this.keyInput.value = '••••••••••••••••••••••••';
            this.connectBtn.textContent = 'Disconnect';
            this.connectBtn.classList.add('btn-secondary');
            this.fetchLiveMovies();
        }
    }

    async fetchLiveMovies() {
        try {
            const response = await fetch('https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&include_adult=false&with_genres=878', {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${this.tmdbKey}`
                }
            });

            if (!response.ok) throw new Error('API fetch failed. Check credentials.');

            const data = await response.json();
            if (data.results && data.results.length > 0) {
                this.movies = data.results;
                this.filterAndRender();
            }
        } catch (err) {
            console.error('TMDB Live Fetch Failure, using gorgeous fallback data:', err);
            alert('Live TMDB connection failed (invalid Token or Network issues). Seamlessly falling back to native high-tech movies catalog.');
            // Revert credentials
            this.tmdbKey = '';
            localStorage.removeItem('leaneth_tmdb_key');
            this.keyInput.removeAttribute('disabled');
            this.keyInput.value = '';
            this.connectBtn.textContent = 'Connect Key';
            this.connectBtn.classList.remove('btn-secondary');
            this.movies = [...FALLBACK_MOVIES];
            this.filterAndRender();
        }
    }

    filterAndRender() {
        if (this.activeGenre === 'all') {
            this.renderMovies(this.movies);
        } else {
            const filtered = this.movies.filter(movie => 
                movie.genre_ids.includes(parseInt(this.activeGenre))
            );
            this.renderMovies(filtered);
        }
    }

    renderMovies(movieList) {
        this.cardsContainer.innerHTML = '';

        if (movieList.length === 0) {
            this.cardsContainer.innerHTML = `<div class="terminal-line text-muted text-center" style="width: 100%; padding: 4rem;">No movies loaded in this genre category.</div>`;
            return;
        }

        movieList.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            
            // Poster URL resolutions
            const posterUrl = movie.poster_path.startsWith('http') 
                ? movie.poster_path 
                : `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

            card.innerHTML = `
                <div class="movie-poster-wrapper">
                    <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" loading="lazy">
                </div>
                <div class="movie-card-info">
                    <h4 class="movie-title">${movie.title}</h4>
                    <div class="movie-meta-row">
                        <span>${movie.release_date ? movie.release_date.split('-')[0] : '2026'}</span>
                        <span class="rating-badge">★ ${movie.vote_average.toFixed(1)}</span>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => this.showMovieDetails(movie));
            this.cardsContainer.appendChild(card);
        });
    }

    showMovieDetails(movie) {
        playClickSound();

        // Backdrop URL resolution
        const backdropUrl = movie.backdrop_path.startsWith('http') 
            ? movie.backdrop_path 
            : `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
        
        const posterUrl = movie.poster_path.startsWith('http') 
            ? movie.poster_path 
            : `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

        this.focusBackdrop.style.backgroundImage = `url('${backdropUrl}')`;
        this.focusPoster.src = posterUrl;
        this.focusTitle.textContent = movie.title;
        this.focusYear.textContent = movie.release_date ? movie.release_date.split('-')[0] : '2026';
        
        // Some live results might not have taglines, handle gracefully
        this.focusTagline.textContent = movie.tagline || "A cinematic masterclass integration payload.";
        this.focusOverview.textContent = movie.overview;
        this.focusRating.textContent = `${movie.vote_average.toFixed(1)}/10`;
        this.focusPop.textContent = movie.popularity.toFixed(2);

        this.focusPanel.classList.remove('hidden');
        
        // Scroll detail card into viewport smoothly
        this.focusPanel.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
}

export function initMovies() {
    new MovieEngine();
}
