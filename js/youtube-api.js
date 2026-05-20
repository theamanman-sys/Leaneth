/* NEWS STREAM ENGINE + YouTube Search - LEANETH VENTURES */

import { playClickSound } from './router.js';

const PIPED_API = 'https://api.piped.private.coffee';
const PIPED_FALLBACKS = [
    'https://pipedapi.orangenet.cc',
    'https://pipedapi.reallyaweso.me',
    'https://pipedapi.leptons.xyz',
    'https://pipedapi-libre.kavin.rocks',
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.adminforge.de',
    'https://piped.moomoo.me',
];

const NEWS_CHANNELS = [
    { channelId: "UCupvZG-5ko_eiXAupbDfxWw", title: "CNN Live", channel: "CNN", description: "24/7 live news coverage from CNN.", cover: "https://yt3.googleusercontent.com/wSqAf5WdxsGsl7ZMtlyfz3qKULo_URoFjmKky0gLThm_Jtu2wsVHMu-XzGZPAb-z8zeMBYUUMYA=s900-c-k-c0x00ffffff-no-rj" },
    { channelId: "UCBi2mrWuNuyYy4gbM6fU18Q", title: "ABC News Live", channel: "ABC News", description: "Live breaking news, politics, and world events.", cover: "https://yt3.googleusercontent.com/GJ8V0NX6NddGh9bf4zED4tsjPjjBK2hdp5FWHMy09pV7sdSkkE3yEhCRSch4waEb9ZavyUrWfw=s900-c-k-c0x00ffffff-no-rj" },
    { channelId: "UCNye-wNBqNL5ZzHSJj3l8Bg", title: "Al Jazeera Live", channel: "Al Jazeera", description: "Global news and current affairs from Al Jazeera.", cover: "https://yt3.googleusercontent.com/XsTga3Nsfc1E6ZgC6HfHfzTG_3zhuZleOnsKxSK2aILMjwkkIm-0vdALFaU-yt0Lw07iLtbSifk=s900-c-k-c0x00ffffff-no-rj" },
    { channelId: "UC16niRr50-MSBwiO3YDb3RA", title: "BBC News Live", channel: "BBC News", description: "Breaking news, analysis, and world reports.", cover: "https://yt3.googleusercontent.com/v4JamQ9B-PUiJHjmZQs9UwTaoLQW8vijJMMpV5QvA2wHQ6iwWM8Q1s6O4jgTl0dtDigVWAi7SA=s900-c-k-c0x00ffffff-no-rj" },
    { channelId: "UCXIJgqnII2ZOINSWNOGFThA", title: "Fox News Live", channel: "Fox News", description: "US news, politics, and live events.", cover: "https://yt3.googleusercontent.com/G3gLy3HBgiZ21mEt1uzR0VPA6VXpsgJReuD7Z91nHwcgyFVu_QpHNpxuULN1D0YEQBwD0F1HwQ=s900-c-k-c0x00ffffff-no-rj" },
    { channelId: "UCoMdktPbSTixAyNGwb-UYkQ", title: "Sky News Live", channel: "Sky News", description: "UK and international breaking news.", cover: "https://yt3.googleusercontent.com/dGnkztdrLtXRlzkdqReeL-NES2761xxmNVcJhGKqFpR0vQBoP9XaxnXF95FDpwrjyFr2iJvV8Es=s900-c-k-c0x00ffffff-no-rj" },
    { channelId: "UCaXkIU1QidjPwiAYu6GcHjg", title: "MSNBC Live", channel: "MSNBC", description: "US politics, news analysis, and live coverage.", cover: "https://yt3.googleusercontent.com/k6bDbWwngaO6KSyL1lxkmFIbW6ncdoLKITtcqTumbD5wBazaJltUEkJdrfHjuMtDrHltYaIbLd0=s900-c-k-c0x00ffffff-no-rj" },
    { channelId: "UCIALMKvObZNtJ6AmdCLP7Lg", title: "Bloomberg Live", channel: "Bloomberg", description: "Financial markets, business news, and analysis.", cover: "https://yt3.googleusercontent.com/4-w44catDebzaDSUWgereql0G5_z5o7VpJXuIYL_eZ3H1vXy0lTmrole9V500jTUXCnQPZ5CuKQ=s900-c-k-c0x00ffffff-no-rj" },
    { channelId: "UCeY0bbntWzzVIaj2z3QigXg", title: "NBC News Live", channel: "NBC News", description: "US and world news coverage.", cover: "https://yt3.googleusercontent.com/PJj5jtuEOi5UmkFy4IBonj5WcabNcnJAIJe-jZMd1ArwIuVyQxFH_2zryBHwvfv6mJujwRpWDCM=s900-c-k-c0x00ffffff-no-rj" },
    { channelId: "UCCCPCZNChQdGa9EkATeye4g", title: "France 24 Live", channel: "France 24", description: "International news 24/7 in English.", cover: "https://yt3.googleusercontent.com/ytc/AIdro_k9aU_SRhYAWJjQ6AO7uzQDZE5mb7gmv4synLrC7hEWGjE=s900-c-k-c0x00ffffff-no-rj" },
    { channelId: "UCknLrEdhRCp1aegoMqRaCZg", title: "DW News Live", channel: "DW News", description: "German and international news coverage.", cover: "https://yt3.googleusercontent.com/NSOdTQTWlqMy8O_j32dx-ftfTCHMOt04Hm7KZ4pfAK6-eQzQSZMWvvss90kG8KQfJ7iNP3phyA=s900-c-k-c0x00ffffff-no-rj" },
    { channelId: "UChqUTb7kYRX8-EiaN3XFrSQ", title: "Reuters Live", channel: "Reuters", description: "Global news and financial reporting.", cover: "https://yt3.googleusercontent.com/bCcVVrrV0EhGFJKsSvmeZHA9Y-YzSL9Keqrrr0HWYUPQy3-mVUVNHMbjwt7IoVkpsHt4E6BZ3pM=s900-c-k-c0x00ffffff-no-rj" },
    { channelId: "UC52X5wxOL_s5yw0dQk7NtgA", title: "Associated Press Live", channel: "AP News", description: "Breaking news from around the globe.", cover: "https://yt3.googleusercontent.com/I2UXf4n7ukd9hl7UQDsPKN0QXQ9X_NoujZfOY_qPhbBwyJv-K3-rFsrWIDGc3CFylr2cL2c7=s900-c-k-c0x00ffffff-no-rj" },
    { channelId: "UC8p1vwvWtl6T73JiExfWs1g", title: "CBS News Live", channel: "CBS News", description: "Live news, politics, and investigations.", cover: "https://yt3.googleusercontent.com/ytc/AIdro_niBFv49gSx4rr1afMZU_Pv7SeuPKO2SMHvv0Ar7OKxM4o=s900-c-k-c0x00ffffff-no-rj" },
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

        this.heroBackdrop = document.getElementById('stream-hero-backdrop');
        this.heroLogo = document.getElementById('stream-hero-logo');
        this.heroTitle = document.getElementById('stream-hero-title');
        this.heroDesc = document.getElementById('stream-hero-desc');
        this.streamHero = document.getElementById('stream-hero');

        this.searchCache = {};
        this.lastQuery = '';
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
                    this.apiStatus.textContent = 'Live';
                    if (this.paneTitle) this.paneTitle.textContent = '\uD83D\uDCFA Live Channels';
                    this.searchInput.value = '';
                } else if (this.activeTab === 'search') {
                    if (this.lastQuery && this.searchCache[this.lastQuery]) {
                        this.renderCatalog(this.searchCache[this.lastQuery]);
                    } else {
                        this.searchInput.focus();
                    }
                }
            });
        });

        this.renderNewsChannels();
        this.apiStatus.textContent = 'Live News';

        this.setupSearchSuggestions();
    }

    setupSearchSuggestions() {
        let debounceTimer;
        const container = document.createElement('div');
        container.className = 'search-suggestions';
        this.searchInput.parentElement.style.position = 'relative';
        this.searchInput.parentElement.appendChild(container);

        this.searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const q = this.searchInput.value.trim();
            if (q.length < 2) { container.innerHTML = ''; container.classList.remove('active'); return; }
            debounceTimer = setTimeout(async () => {
                const data = await this.fetchPiped(`/search?q=${encodeURIComponent(q)}&filter=videos`);
                if (!data?.items) { container.innerHTML = ''; container.classList.remove('active'); return; }
                const items = data.items.slice(0, 6);
                container.innerHTML = items.map(item => `
                    <div class="suggestion-item" data-id="${item.url?.replace('/watch?v=', '') || ''}" data-title="${(item.title || '').replace(/"/g, '&quot;')}" data-channel="${(item.uploaderName || '').replace(/"/g, '&quot;')}" data-desc="${(item.shortDescription || '').replace(/"/g, '&quot;')}">
                        <span class="suggestion-icon">&#128269;</span>
                        <div class="suggestion-text">
                            <span class="suggestion-title">${item.title || ''}</span>
                            <span class="suggestion-channel">${item.uploaderName || ''}</span>
                        </div>
                    </div>
                `).join('');
                container.classList.add('active');
                container.querySelectorAll('.suggestion-item').forEach(el => {
                    el.addEventListener('click', () => {
                        container.innerHTML = '';
                        container.classList.remove('active');
                        const video = {
                            id: el.dataset.id,
                            title: el.dataset.title,
                            channel: el.dataset.channel,
                            description: el.dataset.desc,
                            thumb: `https://i.ytimg.com/vi/${el.dataset.id}/mqdefault.jpg`,
                            views: '',
                        };
                        this.searchInput.value = el.dataset.title;
                        this.lastQuery = el.dataset.title;
                        const card = document.createElement('div');
                        this.selectVideo(video, card);
                    });
                });
            }, 300);
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dashboard-actions')) {
                container.innerHTML = '';
                container.classList.remove('active');
            }
        });
    }

    renderNewsChannels() {
        this.videoList.innerHTML = '';
        NEWS_CHANNELS.forEach((ch) => {
            const card = document.createElement('div');
            card.className = 'yt-video-card news-card';
            card.innerHTML = `
                <div class="yt-thumb-wrapper news-thumb">
                    <div class="live-dot"></div>
                    <img src="${ch.cover}" alt="${ch.title}" class="yt-thumb yt-thumb-contain" loading="lazy" onerror="this.style.display='none'">
                </div>
                <div class="yt-card-info">
                    <h4 class="yt-card-title">${ch.title}</h4>
                    <span class="yt-card-channel">${ch.channel}</span>
                </div>
            `;
            card.addEventListener('click', () => this.selectVideo(ch, card));
            this.videoList.appendChild(card);
        });
        this.updateHeroForNews();
    }

    updateHeroForNews() {
        if (this.heroBackdrop) this.heroBackdrop.style.backgroundImage = 'none';
        if (this.heroLogo) this.heroLogo.innerHTML = '';
        if (this.heroTitle) this.heroTitle.textContent = 'Live News Channels';
        if (this.heroDesc) this.heroDesc.textContent = 'Select a channel from the list to start watching live news coverage.';
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

        this.lastQuery = query;

        const searchTab = [...this.tabBtns].find(b => b.dataset.tab === 'search');
        if (searchTab) searchTab.classList.add('active');

        if (this.searchCache[query]) {
            this.renderCatalog(this.searchCache[query]);
            if (this.paneTitle) this.paneTitle.textContent = `\uD83D\uDD0D Results: "${query}"`;
            return;
        }

        this.videoList.innerHTML = `<div class="terminal-line text-muted text-center" style="padding:2rem;">Searching...</div>`;
        this.offlineMode = false;

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
        const instances = [PIPED_API, ...PIPED_FALLBACKS];
        for (const base of instances) {
            try {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), 10000);
                const res = await fetch(`${base}${path}`, { signal: controller.signal });
                clearTimeout(id);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return await res.json();
            } catch { continue; }
        }
        return null;
    }

    mapPipedItems(items) {
        return items.slice(0, 30).map(item => ({
            id: item.url?.replace('/watch?v=', '') || '',
            title: item.title,
            channel: item.uploaderName || 'Unknown',
            description: item.shortDescription || item.description || '',
            thumb: `https://i.ytimg.com/vi/${item.url?.replace('/watch?v=', '')}/mqdefault.jpg`,
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
        this.titleEl.textContent = video.title;
        const desc = video.description || (video.channel ? `Live stream from ${video.channel}.` : 'No description available.');
        this.descEl.textContent = desc;
        this.latencyMetric.textContent = `${Math.floor(Math.random() * 15) + 5}ms`;
        this.latencyMetric.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => { this.latencyMetric.style.animation = ''; }, 500);

        this.updateHero(video);

        if (video.channelId) {
            this._embedNewsChannel(video);
        } else {
            this.embedVideo(video.id);
        }
    }

    updateHero(video) {
        if (this.heroTitle) this.heroTitle.textContent = video.title;
        if (this.heroDesc) this.heroDesc.textContent = (video.description || video.channel || '').substring(0, 120);
        if (this.heroBackdrop) {
            const bg = video.cover || video.thumb || '';
            this.heroBackdrop.style.backgroundImage = bg ? `url('${bg}')` : 'none';
        }
        if (this.heroLogo) {
            this.heroLogo.innerHTML = video.cover
                ? `<img src="${video.cover}" alt="${video.channel || ''}" class="stream-hero-logo-img">`
                : '';
        }
    }

    async _embedNewsChannel(video) {
        this._showLoader();
        const vid = await this._resolveLiveVideo(video.channelId, video.channel);
        if (vid) {
            this.embedVideo(vid);
        } else {
            this.embedChannel(video.channelId);
        }
    }

    async _resolveLiveVideo(channelId, channelName) {
        const cacheKey = `live_${channelId}`;
        if (this.searchCache[cacheKey]) return this.searchCache[cacheKey];

        const queries = [
            { q: `${channelName} live`, filter: 'streams' },
            { q: channelName, filter: 'streams' },
            { q: `${channelName} live`, filter: 'videos' },
        ];

        for (const { q, filter } of queries) {
            const data = await this.fetchPiped(`/search?q=${encodeURIComponent(q)}&filter=${filter}`);
            if (data?.items?.length) {
                const match = data.items.find(item =>
                    item.url?.startsWith('/watch') && (
                        item.uploaderUrl?.includes(channelId) ||
                        item.uploaderName?.toLowerCase() === channelName.toLowerCase()
                    )
                );
                if (match) {
                    const vid = match.url.replace('/watch?v=', '');
                    this.searchCache[cacheKey] = vid;
                    return vid;
                }
            }
        }
        this.searchCache[cacheKey] = null;
        return null;
    }

    _showLoader() {
        const container = document.getElementById('yt-player');
        if (container) {
            container.innerHTML = `<div class="terminal-line text-muted text-center" style="display:flex;align-items:center;justify-content:center;height:100%;padding:2rem;">Connecting to live stream...</div>`;
        }
    }

    embedVideo(videoId) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
        this._insertIframe(iframe);
    }

    embedChannel(channelId) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&rel=0&modestbranding=1`;
        this._insertIframe(iframe);
    }

    _insertIframe(iframe) {
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
