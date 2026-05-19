/* YOUTUBE ENGINE - Free Piped API + IFrame Player - LEANETH VENTURES */

import { playClickSound } from './router.js';

const PIPED_API = 'https://pipedapi.com';

const FALLBACK_VIDEOS = [
    { id: "erEgovG9WBs", title: "APIs Explained in 100 Seconds", channel: "Fireship", description: "What is an API? RESTful endpoints, GraphQL, and WebSockets explained.", thumbnail: "https://img.youtube.com/vi/erEgovG9WBs/mqdefault.jpg", views: "1.2M views", latency: "15ms" },
    { id: "Sxxw3qtb3_g", title: "React in 100 Seconds", channel: "Fireship", description: "React component lifecycle, hooks, virtual DOM, and modern frontend.", thumbnail: "https://img.youtube.com/vi/Sxxw3qtb3_g/mqdefault.jpg", views: "890K views", latency: "18ms" },
    { id: "4r6GrXk1ZcA", title: "Web3 Explained | Solidity, Ethereum", channel: "Fireship", description: "Smart contracts, EVM bytecode, RPC providers, and wallet bridges.", thumbnail: "https://img.youtube.com/vi/4r6GrXk1ZcA/mqdefault.jpg", views: "740K views", latency: "24ms" },
    { id: "WXsD0ZgxjRw", title: "REST APIs & HTTP Crash Course", channel: "Traversy Media", description: "HTTP methods, headers, status codes, authentication, and API design.", thumbnail: "https://img.youtube.com/vi/WXsD0ZgxjRw/mqdefault.jpg", views: "1.5M views", latency: "14ms" },
];

let player = null;
let playerReady = false;
let pendingVideoId = null;

class YouTubeEngine {
    constructor() {
        this.videoList = document.getElementById('yt-video-list');
        this.playerPlaceholder = document.getElementById('yt-player-placeholder');
        this.playerContainer = document.getElementById('yt-player');
        this.titleEl = document.getElementById('yt-video-title');
        this.descEl = document.getElementById('yt-video-desc');
        this.searchInput = document.getElementById('yt-search-input');
        this.searchBtn = document.getElementById('yt-search-btn');
        this.apiKeyInput = document.getElementById('yt-api-key');
        this.apiKeyWrap = this.apiKeyInput?.parentElement;
        this.apiStatus = document.getElementById('yt-api-status');
        this.latencyMetric = document.getElementById('yt-metric-latency');
        this.quotaMetric = document.getElementById('yt-metric-quota');

        this.searchCache = {};
        this.offlineMode = false;

        this.init();
    }

    init() {
        if (!this.videoList) return;

        if (this.apiKeyWrap) this.apiKeyWrap.style.display = 'none';

        this.loadYouTubeAPI();

        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        window.addEventListener('viewChanged', (e) => {
            if (e.detail.view === 'stream' && player && playerReady) {
                this.playerContainer.classList.remove('hidden');
            }
        });

        this.apiStatus.textContent = 'Piped API';
        this.fetchTrending();
    }

    loadYouTubeAPI() {
        if (window.YT) { this.onAPIReady(); return; }
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const first = document.getElementsByTagName('script')[0];
        first.parentNode.insertBefore(tag, first);
        window.onYouTubeIframeAPIReady = () => this.onAPIReady();
    }

    onAPIReady() {
        player = new YT.Player('yt-player', {
            height: '100%', width: '100%',
            playerVars: { rel: 0, modestbranding: 1, autoplay: 1 },
            events: {
                onReady: () => {
                    playerReady = true;
                    if (pendingVideoId) {
                        this.playVideo(pendingVideoId);
                        pendingVideoId = null;
                    }
                },
            },
        });
    }

    async fetchPiped(path) {
        try {
            const res = await fetch(`${PIPED_API}${path}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch {
            return null;
        }
    }

    async fetchTrending() {
        this.videoList.innerHTML = `<div class="terminal-line text-muted text-center" style="padding:2rem;">Loading trending...</div>`;

        const data = await this.fetchPiped('/trending?region=US');

        if (data && data.items && data.items.length) {
            this.apiStatus.textContent = 'Trending';
            this.renderCatalog(this.mapPipedItems(data.items));
        } else {
            this.offlineMode = true;
            this.apiStatus.textContent = 'Offline Demo';
            this.renderCatalog(FALLBACK_VIDEOS);
        }
    }

    async handleSearch() {
        const query = this.searchInput.value.trim();

        if (!query) {
            this.fetchTrending();
            return;
        }

        playClickSound();

        if (this.searchCache[query]) {
            this.renderCatalog(this.searchCache[query]);
            return;
        }

        this.videoList.innerHTML = `<div class="terminal-line text-muted text-center" style="padding:2rem;">Searching...</div>`;

        if (this.offlineMode) {
            const filtered = FALLBACK_VIDEOS.filter(v =>
                v.title.toLowerCase().includes(query.toLowerCase()) ||
                v.channel.toLowerCase().includes(query.toLowerCase())
            );
            const results = filtered.length ? filtered : FALLBACK_VIDEOS;
            this.renderCatalog(results);
            return;
        }

        const data = await this.fetchPiped(`/search?q=${encodeURIComponent(query)}&filter=videos`);

        if (data && data.items && data.items.length) {
            const items = this.mapPipedItems(data.items);
            this.searchCache[query] = items;
            this.apiStatus.textContent = 'Search OK';
            this.renderCatalog(items);
        } else {
            this.offlineMode = true;
            this.apiStatus.textContent = 'Offline Demo';
            this.searchCache[query] = FALLBACK_VIDEOS;
            this.renderCatalog(FALLBACK_VIDEOS);
        }
    }

    mapPipedItems(items) {
        return items.slice(0, 30).map(item => ({
            id: item.url?.replace('/watch?v=', '') || item.url?.split('=')[1] || '',
            title: item.title,
            channel: item.uploaderName || 'Unknown',
            description: item.shortDescription || item.description || '',
            thumbnail: item.thumbnail || `https://img.youtube.com/vi/${item.url?.replace('/watch?v=', '')}/mqdefault.jpg`,
            views: item.views ? `${(item.views / 1e6).toFixed(1)}M views` : '',
            latency: `${Math.floor(Math.random() * 20) + 8}ms`,
        })).filter(v => v.id);
    }

    renderCatalog(videos) {
        this.videoList.innerHTML = '';

        if (!videos || videos.length === 0) {
            this.videoList.innerHTML = `<div class="terminal-line text-muted padding-1 text-center">No results found.</div>`;
            return;
        }

        videos.forEach(video => {
            const card = document.createElement('div');
            card.className = 'yt-video-card';
            card.innerHTML = `
                <div class="yt-thumb-wrapper">
                    <img src="${video.thumbnail}" alt="${video.title.replace(/"/g, '&quot;')}" class="yt-thumb" loading="lazy">
                </div>
                <div class="yt-card-info">
                    <h4 class="yt-card-title">${video.title}</h4>
                    <span class="yt-card-channel">${video.channel}${video.views ? ' • ' + video.views : ''}</span>
                </div>
            `;
            card.addEventListener('click', () => this.selectVideo(video, card));
            this.videoList.appendChild(card);
        });
    }

    selectVideo(video, cardEl) {
        playClickSound();

        this.videoList.querySelectorAll('.yt-video-card').forEach(c => c.classList.remove('active'));
        if (cardEl) cardEl.classList.add('active');

        this.playerPlaceholder.classList.add('hidden');

        if (player && playerReady) {
            this.playVideo(video.id);
        } else {
            pendingVideoId = video.id;
        }

        this.titleEl.textContent = video.title;
        this.descEl.textContent = video.description || 'No description available.';
        this.latencyMetric.textContent = video.latency;

        this.latencyMetric.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => { this.latencyMetric.style.animation = ''; }, 500);
    }

    playVideo(videoId) {
        if (player && playerReady) {
            player.loadVideoById(videoId);
        }
    }
}

export function initYouTube() {
    new YouTubeEngine();
}
