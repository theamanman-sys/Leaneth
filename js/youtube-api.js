/* YOUTUBE DATA API v3 + IFrame Player - LEANETH VENTURES */

import { playClickSound } from './router.js';

const STORAGE_KEY = 'yt_api_key';
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
        this.setKeyBtn = document.getElementById('yt-set-key');
        this.apiStatus = document.getElementById('yt-api-status');
        this.latencyMetric = document.getElementById('yt-metric-latency');
        this.quotaMetric = document.getElementById('yt-metric-quota');

        this.apiKey = localStorage.getItem(STORAGE_KEY) || '';
        this.searchCache = {};
        this.quotaUsed = 0;

        if (this.apiKey) {
            this.apiKeyInput.value = this.apiKey;
            this.apiStatus.textContent = 'API Key Set';
        }

        this.init();
    }

    init() {
        if (!this.videoList) return;

        this.loadYouTubeAPI();

        this.setKeyBtn.addEventListener('click', () => this.setApiKey());
        this.apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setApiKey();
        });

        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        window.addEventListener('viewChanged', (e) => {
            if (e.detail.view === 'stream' && player && playerReady) {
                this.playerContainer.classList.remove('hidden');
            }
        });

        this.renderWelcome();
    }

    loadYouTubeAPI() {
        if (window.YT) {
            this.onAPIReady();
            return;
        }
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const first = document.getElementsByTagName('script')[0];
        first.parentNode.insertBefore(tag, first);
        window.onYouTubeIframeAPIReady = () => this.onAPIReady();
    }

    onAPIReady() {
        player = new YT.Player('yt-player', {
            height: '100%',
            width: '100%',
            playerVars: {
                rel: 0,
                modestbranding: 1,
                autoplay: 1,
            },
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

    setApiKey() {
        const key = this.apiKeyInput.value.trim();
        if (!key) {
            this.apiStatus.textContent = 'No Key';
            this.apiStatus.style.color = 'var(--error)';
            return;
        }
        this.apiKey = key;
        localStorage.setItem(STORAGE_KEY, key);
        this.apiStatus.textContent = 'API Key Set';
        this.apiStatus.style.color = '';
        this.searchCache = {};
        this.fetchTrending();
    }

    renderWelcome() {
        this.videoList.innerHTML = `
            <div class="terminal-line text-muted padding-1 text-center" style="padding:2rem 1rem;">
                <div style="font-size:2rem;margin-bottom:1rem;">&#9654;</div>
                <p>Enter a <strong>YouTube Data API v3 key</strong> above, then search or browse trending videos.</p>
                <p style="font-size:0.75rem;margin-top:0.8rem;color:var(--text-muted);">
                    Get a key at <a href="https://console.cloud.google.com/apis/credentials" target="_blank" style="color:var(--accent-cyan);">Google Cloud Console</a>
                </p>
            </div>`;
    }

    async fetchFromAPI(endpoint, params) {
        if (!this.apiKey) return null;
        const url = `https://www.googleapis.com/youtube/v3/${endpoint}?key=${this.apiKey}&${new URLSearchParams(params)}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.error) {
                this.apiStatus.textContent = `Error: ${data.error.message}`;
                this.apiStatus.style.color = 'var(--error)';
                return null;
            }
            this.apiStatus.textContent = '200 OK';
            this.apiStatus.style.color = '';
            return data;
        } catch (err) {
            this.apiStatus.textContent = 'Network Error';
            this.apiStatus.style.color = 'var(--error)';
            return null;
        }
    }

    async fetchTrending() {
        const data = await this.fetchFromAPI('videos', {
            part: 'snippet,statistics',
            chart: 'mostPopular',
            maxResults: 20,
            regionCode: 'US',
        });
        if (data && data.items) {
            this.renderCatalog(this.mapItems(data.items));
        }
    }

    async handleSearch() {
        const query = this.searchInput.value.trim();
        if (!query) {
            if (this.apiKey) this.fetchTrending();
            return;
        }

        playClickSound();

        if (this.searchCache[query]) {
            this.renderCatalog(this.searchCache[query]);
            return;
        }

        this.videoList.innerHTML = `<div class="terminal-line text-muted text-center" style="padding:2rem;">Searching...</div>`;

        const data = await this.fetchFromAPI('search', {
            part: 'snippet',
            q: query,
            maxResults: 20,
            type: 'video',
            regionCode: 'US',
        });

        if (!data || !data.items) {
            this.videoList.innerHTML = `<div class="terminal-line text-error text-center" style="padding:2rem;">Search failed. Check your API key.</div>`;
            return;
        }

        const videoIds = data.items.map(item => item.id.videoId).join(',');
        const detailData = await this.fetchFromAPI('videos', {
            part: 'snippet,statistics',
            id: videoIds,
        });

        const items = detailData && detailData.items ? this.mapItems(detailData.items) : this.mapSearchItems(data.items);
        this.searchCache[query] = items;
        this.renderCatalog(items);
    }

    mapItems(items) {
        return items.map(item => ({
            id: item.id,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
            views: item.statistics ? `${parseInt(item.statistics.viewCount).toLocaleString()} views` : '',
            latency: `${Math.floor(Math.random() * 20) + 8}ms`,
        }));
    }

    mapSearchItems(items) {
        return items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
            views: '',
            latency: `${Math.floor(Math.random() * 20) + 8}ms`,
        }));
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

        this.quotaUsed += 1;
        const remaining = Math.max(0, 10000 - this.quotaUsed);
        this.quotaMetric.textContent = `${remaining.toLocaleString()} / 10K`;

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
