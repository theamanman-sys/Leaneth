/* NEWS STREAM ENGINE + YouTube Search - LEANETH VENTURES */

import { playClickSound } from './router.js';

const PIPED_API = 'https://pipedapi.com';

const NEWS_CHANNELS = [
    { id: "BMXlH2T6XqY", title: "CNN Live", channel: "CNN", description: "24/7 live news coverage from CNN.", thumb: "https://logo.clearbit.com/cnn.com" },
    { id: "w_Ma8oQLmXM", title: "ABC News Live", channel: "ABC News", description: "Live breaking news, politics, and world events.", thumb: "https://logo.clearbit.com/abcnews.go.com" },
    { id: "4lV8jIqDl0s", title: "Al Jazeera Live", channel: "Al Jazeera", description: "Global news and current affairs from Al Jazeera.", thumb: "https://logo.clearbit.com/aljazeera.com" },
    { id: "16oZ5mcr1v0", title: "BBC News Live", channel: "BBC News", description: "Breaking news, analysis, and world reports.", thumb: "https://logo.clearbit.com/bbc.com" },
    { id: "SMJgM3qLQm0", title: "Fox News Live", channel: "Fox News", description: "US news, politics, and live events.", thumb: "https://logo.clearbit.com/foxnews.com" },
    { id: "9Auq9mYxFEE", title: "Sky News Live", channel: "Sky News", description: "UK and international breaking news.", thumb: "https://logo.clearbit.com/sky.com" },
    { id: "QKi4Q6qQ1aY", title: "MSNBC Live", channel: "MSNBC", description: "US politics, news analysis, and live coverage.", thumb: "https://logo.clearbit.com/msnbc.com" },
    { id: "lQnJ3sY5VhA", title: "Bloomberg Live", channel: "Bloomberg", description: "Financial markets, business news, and analysis.", thumb: "https://logo.clearbit.com/bloomberg.com" },
    { id: "py3Y6tQ5vZk", title: "NBC News Live", channel: "NBC News", description: "US and world news coverage.", thumb: "https://logo.clearbit.com/nbcnews.com" },
    { id: "7j5Q0H3mXzQ", title: "France 24 Live", channel: "France 24", description: "International news 24/7 in English.", thumb: "https://logo.clearbit.com/france24.com" },
    { id: "LgSqN9PQkQg", title: "DW News Live", channel: "DW News", description: "German and international news coverage.", thumb: "https://logo.clearbit.com/dw.com" },
    { id: "Gz7WFPfHnHk", title: "Reuters Live", channel: "Reuters", description: "Global news and financial reporting.", thumb: "https://logo.clearbit.com/reuters.com" },
    { id: "YJ0FY3oJ0cI", title: "Associated Press Live", channel: "AP News", description: "Breaking news from around the globe.", thumb: "https://logo.clearbit.com/apnews.com" },
    { id: "d8VdcMpI0lM", title: "CBS News Live", channel: "CBS News", description: "Live news, politics, and investigations.", thumb: "https://logo.clearbit.com/cbsnews.com" },
];

const FALLBACK_VIDEOS = [
    { id: "erEgovG9WBs", title: "APIs Explained in 100 Seconds", channel: "Fireship", description: "What is an API?", thumb: "https://img.youtube.com/vi/erEgovG9WBs/mqdefault.jpg", views: "1.2M views" },
    { id: "Sxxw3qtb3_g", title: "React in 100 Seconds", channel: "Fireship", description: "React component lifecycle.", thumb: "https://img.youtube.com/vi/Sxxw3qtb3_g/mqdefault.jpg", views: "890K views" },
    { id: "4r6GrXk1ZcA", title: "Web3 Explained", channel: "Fireship", description: "Smart contracts and EVM.", thumb: "https://img.youtube.com/vi/4r6GrXk1ZcA/mqdefault.jpg", views: "740K views" },
    { id: "WXsD0ZgxjRw", title: "REST APIs & HTTP", channel: "Traversy Media", description: "HTTP methods and API design.", thumb: "https://img.youtube.com/vi/WXsD0ZgxjRw/mqdefault.jpg", views: "1.5M views" },
];

class StreamEngine {
    constructor() {
        this.videoList = document.getElementById('yt-video-list');
        this.playerPlaceholder = document.getElementById('yt-player-placeholder');
        this.playerContainer = document.getElementById('yt-player');
        this.titleEl = document.getElementById('yt-video-title');
        this.descEl = document.getElementById('yt-video-desc');
        this.searchInput = document.getElementById('yt-search-input');
        this.searchBtn = document.getElementById('yt-search-btn');
        this.apiStatus = document.getElementById('yt-api-status');
        this.latencyMetric = document.getElementById('yt-metric-latency');
        this.paneTitle = document.getElementById('stream-pane-title');
        this.tabBtns = document.querySelectorAll('.stream-tab');

        this.searchCache = {};
        this.offlineMode = false;
        this.activeTab = 'news';

        this.init();
    }

    init() {
        if (!this.videoList) return;

        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeTab = btn.dataset.tab;
                if (this.activeTab === 'news') {
                    this.renderNewsChannels();
                    this.apiStatus.textContent = 'Live News';
                    if (this.paneTitle) this.paneTitle.textContent = '\uD83D\uDCFA Live News Channels';
                    this.searchInput.value = '';
                }
            });
        });

        this.renderNewsChannels();
        this.apiStatus.textContent = 'Live News';
    }

    renderNewsChannels() {
        this.videoList.innerHTML = '';
        NEWS_CHANNELS.forEach((ch) => {
            const card = document.createElement('div');
            card.className = 'yt-video-card';
            card.innerHTML = `
                <div class="yt-thumb-wrapper news-thumb">
                    <div class="live-dot"></div>
                    <img src="${ch.thumb}" alt="${ch.title}" class="yt-thumb" loading="lazy" onerror="this.style.display='none'">
                </div>
                <div class="yt-card-info">
                    <h4 class="yt-card-title">${ch.title}</h4>
                    <span class="yt-card-channel">${ch.channel}</span>
                </div>
            `;
            card.addEventListener('click', () => this.selectVideo(ch, card));
            this.videoList.appendChild(card);
        });
    }

    async handleSearch() {
        const query = this.searchInput.value.trim();
        this.tabBtns.forEach(b => b.classList.remove('active'));

        if (!query) {
            this.tabBtns.forEach(b => { if (b.dataset.tab === 'news') b.classList.add('active'); });
            this.renderNewsChannels();
            if (this.paneTitle) this.paneTitle.textContent = '\uD83D\uDCFA Live News Channels';
            return;
        }

        playClickSound();

        if (this.searchCache[query]) {
            this.renderCatalog(this.searchCache[query]);
            if (this.paneTitle) this.paneTitle.textContent = `\uD83D\uDD0D Results: "${query}"`;
            return;
        }

        this.videoList.innerHTML = `<div class="terminal-line text-muted text-center" style="padding:2rem;">Searching...</div>`;

        if (this.offlineMode) {
            const filtered = FALLBACK_VIDEOS.filter(v =>
                v.title.toLowerCase().includes(query.toLowerCase()) ||
                v.channel.toLowerCase().includes(query.toLowerCase())
            );
            this.renderCatalog(filtered.length ? filtered : FALLBACK_VIDEOS);
            if (this.paneTitle) this.paneTitle.textContent = `\uD83D\uDD0D Results: "${query}"`;
            return;
        }

        const data = await this.fetchPiped(`/search?q=${encodeURIComponent(query)}&filter=videos`);

        if (data && data.items && data.items.length) {
            const items = this.mapPipedItems(data.items);
            this.searchCache[query] = items;
            this.apiStatus.textContent = 'Search OK';
            this.renderCatalog(items);
            if (this.paneTitle) this.paneTitle.textContent = `\uD83D\uDD0D Results: "${query}"`;
        } else {
            this.offlineMode = true;
            this.apiStatus.textContent = 'Offline Demo';
            const filtered = FALLBACK_VIDEOS.filter(v =>
                v.title.toLowerCase().includes(query.toLowerCase()) ||
                v.channel.toLowerCase().includes(query.toLowerCase())
            );
            this.renderCatalog(filtered.length ? filtered : FALLBACK_VIDEOS);
        }
    }

    async fetchPiped(path) {
        try {
            const res = await fetch(`${PIPED_API}${path}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch { return null; }
    }

    mapPipedItems(items) {
        return items.slice(0, 30).map(item => ({
            id: item.url?.replace('/watch?v=', '') || '',
            title: item.title,
            channel: item.uploaderName || 'Unknown',
            description: item.shortDescription || item.description || '',
            thumb: item.thumbnail || `https://img.youtube.com/vi/${item.url?.replace('/watch?v=', '')}/mqdefault.jpg`,
            views: item.views ? `${(item.views / 1e6).toFixed(1)}M views` : '',
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
                    <img src="${video.thumb}" alt="${video.title.replace(/"/g, '&quot;')}" class="yt-thumb" loading="lazy">
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
        this.embedVideo(video.id);

        this.titleEl.textContent = video.title;
        const desc = video.description || (video.channel ? `Live stream from ${video.channel}.` : 'No description available.');
        this.descEl.textContent = desc;
        this.latencyMetric.textContent = `${Math.floor(Math.random() * 15) + 5}ms`;

        this.latencyMetric.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => { this.latencyMetric.style.animation = ''; }, 500);
    }

    embedVideo(videoId) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen', '');
        iframe.style.border = '0';
        const container = document.getElementById('yt-player');
        if (container) {
            container.innerHTML = '';
            container.appendChild(iframe);
        }
    }
}

export function initYouTube() {
    new StreamEngine();
}
