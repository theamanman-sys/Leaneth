import { playClickSound } from './router.js';

const OL_BASE = 'https://openlibrary.org';
const COVERS_BASE = 'https://covers.openlibrary.org/b/id';
const GUTENDEX_BASE = 'https://gutendex.com/books';

const PROXIES = [
    (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

const CATEGORY_QUERIES = {
    'trending': 'popular',
    'fiction': 'fiction',
    'non-fiction': 'nonfiction',
    'science': 'science',
    'comics': 'comics+graphic+novel',
    'history': 'history',
    'philosophy': 'philosophy',
    'classics': 'classic+literature',
};

const CATEGORY_LABELS = {
    'trending': 'Trending',
    'fiction': 'Fiction',
    'non-fiction': 'Non-Fiction',
    'science': 'Science',
    'comics': 'Comics & Graphic Novels',
    'history': 'History',
    'philosophy': 'Philosophy',
    'classics': 'Classics',
};

const FALLBACK_BOOKS = [
    { id: 'OL7353617M', title: 'The Great Gatsby', author_name: ['F. Scott Fitzgerald'], first_publish_year: 1925, subject: ['fiction'], ia: 'greatgatsby00fitzgoog', gutendex_id: 64317 },
    { id: 'OL21640713M', title: '1984', author_name: ['George Orwell'], first_publish_year: 1949, subject: ['fiction'], ia: '1984orwell', gutendex_id: 54728 },
    { id: 'OL22318317M', title: 'To Kill a Mockingbird', author_name: ['Harper Lee'], first_publish_year: 1960, subject: ['fiction'], ia: 'tokillamockingbird00leerich', gutendex_id: 52375 },
    { id: 'OL274482W', title: 'Moby Dick', author_name: ['Herman Melville'], first_publish_year: 1851, subject: ['classics'], gutendex_id: 2701 },
    { id: 'OL16002888W', title: 'Pride and Prejudice', author_name: ['Jane Austen'], first_publish_year: 1813, subject: ['classics'], gutendex_id: 1342 },
    { id: 'OL24316234M', title: 'The Adventures of Sherlock Holmes', author_name: ['Arthur Conan Doyle'], first_publish_year: 1892, subject: ['fiction'], gutendex_id: 1661 },
    { id: 'OL362871M', title: 'The Catcher in the Rye', author_name: ['J.D. Salinger'], first_publish_year: 1951, subject: ['fiction'], gutendex_id: 5107 },
    { id: 'OL245199X', title: 'Brave New World', author_name: ['Aldous Huxley'], first_publish_year: 1932, subject: ['fiction', 'science'], gutendex_id: 4981 },
    { id: 'OL16807594W', title: 'The Hobbit', author_name: ['J.R.R. Tolkien'], first_publish_year: 1937, subject: ['fiction'], gutendex_id: 5904 },
    { id: 'OL21644313M', title: 'Dune', author_name: ['Frank Herbert'], first_publish_year: 1965, subject: ['science', 'fiction'], gutendex_id: 53784 },
    { id: 'OL506928W', title: 'The Art of War', author_name: ['Sun Tzu'], first_publish_year: -500, subject: ['philosophy', 'history'], gutendex_id: 132 },
    { id: 'OL262102W', title: 'Dracula', author_name: ['Bram Stoker'], first_publish_year: 1897, subject: ['fiction', 'classics'], gutendex_id: 345 },
    { id: 'OL21192W', title: 'Frankenstein', author_name: ['Mary Shelley'], first_publish_year: 1818, subject: ['fiction', 'science', 'classics'], gutendex_id: 84 },
    { id: 'OL15209189W', title: 'The Time Machine', author_name: ['H.G. Wells'], first_publish_year: 1895, subject: ['science', 'fiction', 'classics'], gutendex_id: 2493 },
    { id: 'OL16002888W', title: 'Sense and Sensibility', author_name: ['Jane Austen'], first_publish_year: 1811, subject: ['classics'], gutendex_id: 161 },
    { id: 'OL72392W', title: 'Meditations', author_name: ['Marcus Aurelius'], first_publish_year: 180, subject: ['philosophy', 'classics'], gutendex_id: 2680 },
    { id: 'OL280363W', title: 'The Republic', author_name: ['Plato'], first_publish_year: -375, subject: ['philosophy', 'classics'], gutendex_id: 1497 },
    { id: 'OL16002888W', title: 'Emma', author_name: ['Jane Austen'], first_publish_year: 1815, subject: ['classics', 'fiction'], gutendex_id: 158 },
    { id: 'OL257150W', title: 'The Odyssey', author_name: ['Homer'], first_publish_year: -800, subject: ['classics', 'fiction'], gutendex_id: 1727 },
    { id: 'OL280362W', title: 'The Iliad', author_name: ['Homer'], first_publish_year: -800, subject: ['classics', 'fiction'], gutendex_id: 6130 },
    { id: 'OL87079W', title: 'The Divine Comedy', author_name: ['Dante Alighieri'], first_publish_year: 1320, subject: ['classics', 'fiction'], gutendex_id: 8800 },
    { id: 'OL68144W', title: 'The Brothers Karamazov', author_name: ['Fyodor Dostoevsky'], first_publish_year: 1880, subject: ['classics', 'fiction'], gutendex_id: 28054 },
    { id: 'OL81947W', title: 'Crime and Punishment', author_name: ['Fyodor Dostoevsky'], first_publish_year: 1866, subject: ['classics', 'fiction'], gutendex_id: 2554 },
    { id: 'OL17213921W', title: 'The Picture of Dorian Gray', author_name: ['Oscar Wilde'], first_publish_year: 1890, subject: ['classics', 'fiction'], gutendex_id: 174 },
    { id: 'OL17201094W', title: 'Alice\'s Adventures in Wonderland', author_name: ['Lewis Carroll'], first_publish_year: 1865, subject: ['classics', 'fiction'], gutendex_id: 11 },
    { id: 'OL173244W', title: 'The War of the Worlds', author_name: ['H.G. Wells'], first_publish_year: 1898, subject: ['science', 'fiction', 'classics'], gutendex_id: 36 },
];

const HERO_BOOKS = [
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', desc: 'A story of wealth, love, and the American Dream in the Roaring Twenties.', gutendex_id: 64317 },
    { title: '1984', author: 'George Orwell', desc: 'A dystopian novel set in a totalitarian society ruled by Big Brother.', gutendex_id: 54728 },
    { title: 'Dune', author: 'Frank Herbert', desc: 'An epic science fiction saga set on the desert planet Arrakis.', gutendex_id: 53784 },
    { title: 'Moby Dick', author: 'Herman Melville', desc: 'The obsessive quest of Captain Ahab for the great white whale.', gutendex_id: 2701 },
    { title: 'The Art of War', author: 'Sun Tzu', desc: 'An ancient Chinese military treatise on strategy and philosophy.', gutendex_id: 132 },
    { title: 'Pride and Prejudice', author: 'Jane Austen', desc: 'A timeless romance and social satire of manners in 19th-century England.', gutendex_id: 1342 },
];

class BooksEngine {
    constructor() {
        this.container = document.getElementById('books-cards-container');
        this.heroBackdrop = document.getElementById('books-hero-backdrop');
        this.heroTitle = document.getElementById('books-hero-title');
        this.heroAuthor = document.getElementById('books-hero-author');
        this.heroRating = document.getElementById('books-hero-rating');
        this.heroDesc = document.getElementById('books-hero-desc');
        this.heroBadge = document.getElementById('books-hero-badge');
        this.heroDots = document.getElementById('books-hero-dots');
        this.heroReadBtn = document.getElementById('books-hero-read');

        this.overlay = document.getElementById('books-overlay');
        this.overlayScroll = document.querySelector('.books-overlay-scroll');
        this.overlayBack = document.getElementById('books-overlay-back');
        this.overlayClose = document.getElementById('books-overlay-close');
        this.overlayBackdrop = document.getElementById('books-overlay-backdrop');
        this.overlayPoster = document.getElementById('books-overlay-poster');
        this.overlayTitle = document.getElementById('books-overlay-title');
        this.overlayAuthor = document.getElementById('books-overlay-author');
        this.overlayYear = document.getElementById('books-overlay-year');
        this.overlayRating = document.getElementById('books-overlay-rating');
        this.overlayGenre = document.getElementById('books-overlay-genre');
        this.overlayOverview = document.getElementById('books-overlay-overview');
        this.overlayReadBtn = document.getElementById('books-overlay-read');
        this.overlayReader = document.getElementById('books-overlay-reader');
        this.overlayIframe = document.getElementById('books-overlay-iframe');
        this.textReader = document.getElementById('books-text-reader');
        this.readerLoading = document.getElementById('books-reader-loading');
        this.readerClose = document.getElementById('books-reader-close');
        this.readerTitle = document.getElementById('books-reader-title');
        this.overlayExtra = document.getElementById('books-overlay-extra');
        this.searchInput = document.getElementById('books-search-input');
        this.searchBtn = document.getElementById('books-search-btn');

        this.cachedCategories = {};
        this.activeCategory = 'trending';
        this.currentBook = null;
        this.heroItems = HERO_BOOKS;
        this.heroIndex = 0;
        this.heroTimer = null;
        this.searchResultsMode = false;
        this.coverCache = {};

        this.init();
    }

    init() {
        if (!this.container) return;

        this.startHeroRotation();
        this.resolveHeroCovers();
        this.loadCategory('trending');

        document.querySelectorAll('.books-cat-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                playClickSound();
                const cat = tab.dataset.cat;
                if (cat === this.activeCategory && !this.searchResultsMode) return;
                document.querySelectorAll('.books-cat-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.activeCategory = cat;
                this.searchResultsMode = false;
                this.loadCategory(cat);
            });
        });

        document.querySelectorAll('.books-carousel-nav').forEach(btn => {
            btn.addEventListener('click', () => {
                playClickSound();
                const target = btn.dataset.target;
                const dir = btn.dataset.dir;
                const el = document.getElementById(target);
                if (el) el.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
            });
        });

        if (this.searchBtn) this.searchBtn.addEventListener('click', () => this.doSearch());
        if (this.searchInput) {
            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.doSearch();
            });
        }

        if (this.overlayBack) this.overlayBack.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); playClickSound(); this.closeOverlay(); });
        if (this.overlayClose) this.overlayClose.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); playClickSound(); this.closeOverlay(); });
        if (this.overlay) this.overlay.addEventListener('click', (e) => { if (e.target === this.overlay || e.target.classList.contains('books-overlay-scroll')) this.closeOverlay(); });
        if (this.overlayReadBtn) this.overlayReadBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); this.readCurrentBook(); });
        if (this.readerClose) this.readerClose.addEventListener('click', () => this.closeReader());

        document.addEventListener('click', (e) => {
            try {
                const t = e.target;
                if (!t) return;
                const backBtn = t.closest && t.closest('#books-overlay-back');
                if (backBtn) { e.preventDefault(); e.stopPropagation(); playClickSound(); this.closeOverlay(); return; }
                const readBtn = t.closest && t.closest('#books-overlay-read');
                if (readBtn) { e.preventDefault(); e.stopPropagation(); playClickSound(); this.readCurrentBook(); return; }
            } catch (err) {}
        }, true);

        if (this.heroReadBtn) {
            this.heroReadBtn.addEventListener('click', () => {
                playClickSound();
                if (this.currentHeroItem) this.openHeroBookReader();
            });
        }

        this.setupHeroSwipe();
    }

    closeReader() {
        document.body.classList.remove('books-reading-mode');
        this.overlayReader.classList.add('hidden');
        this.overlayIframe.classList.add('hidden');
        this.textReader.classList.add('hidden');
        this.textReader.innerHTML = '';
        this.overlayIframe.src = '';
        this.overlayReadBtn.classList.remove('hidden');
    }

    async getCoverForBook(book) {
        if (book.cover_i) return `${COVERS_BASE}/${book.cover_i}-L.jpg`;
        const cacheKey = book.title + (Array.isArray(book.author_name) ? book.author_name[0] : book.author_name || '');
        if (this.coverCache[cacheKey]) return this.coverCache[cacheKey];
        try {
            const query = encodeURIComponent(`${book.title} ${Array.isArray(book.author_name) ? book.author_name[0] : book.author_name || ''}`);
            const res = await fetch(`${OL_BASE}/search.json?q=${query}&limit=1`);
            const data = await res.json();
            const doc = data.docs && data.docs[0];
            if (doc && doc.cover_i) {
                const url = `${COVERS_BASE}/${doc.cover_i}-L.jpg`;
                this.coverCache[cacheKey] = url;
                book.cover_i = doc.cover_i;
                return url;
            }
        } catch {}
        return '';
    }

    async resolveHeroCovers() {
        for (const item of this.heroItems) {
            try {
                const query = encodeURIComponent(`${item.title} ${item.author}`);
                const res = await fetch(`${OL_BASE}/search.json?q=${query}&limit=1`);
                const data = await res.json();
                const doc = data.docs && data.docs[0];
                if (doc && doc.cover_i) {
                    item.cover_i = doc.cover_i;
                    this.showHeroItem(this.heroIndex);
                }
            } catch {}
        }
    }

    setupHeroSwipe() {
        const hero = document.getElementById('books-hero');
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
        if (!this.heroItems.length) return;
        this.heroTimer = setInterval(() => {
            this.heroIndex = (this.heroIndex + 1) % this.heroItems.length;
            this.showHeroItem(this.heroIndex);
        }, 6000);
    }

    startHeroRotation() {
        if (!this.heroItems.length) return;
        this.renderHeroDots();
        this.showHeroItem(0);
        this.heroTimer = setInterval(() => {
            this.heroIndex = (this.heroIndex + 1) % this.heroItems.length;
            this.showHeroItem(this.heroIndex);
        }, 6000);
    }

    renderHeroDots() {
        if (!this.heroDots) return;
        this.heroDots.innerHTML = '';
        this.heroItems.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = 'books-hero-dot' + (i === 0 ? ' active' : '');
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

        const coverUrl = item.cover_i ? `${COVERS_BASE}/${item.cover_i}-L.jpg` : '';

        if (this.heroBackdrop) {
            this.heroBackdrop.style.backgroundImage = coverUrl ? `url('${coverUrl}')` : 'none';
            this.heroBackdrop.style.transition = 'background-image 0.8s ease';
        }
        if (this.heroBadge) this.heroBadge.textContent = 'Featured Book';
        if (this.heroTitle) this.heroTitle.textContent = item.title;
        if (this.heroAuthor) this.heroAuthor.textContent = `by ${item.author}`;
        if (this.heroDesc) this.heroDesc.textContent = item.desc || '';

        document.querySelectorAll('.books-hero-dot').forEach((d, i) => {
            d.classList.toggle('active', i === index);
        });
    }

    openHeroBookReader() {
        const item = this.currentHeroItem;
        if (!item) return;

        const book = {
            title: item.title,
            author_name: [item.author],
            cover_i: item.cover_i || null,
            first_publish_year: null,
            subject: [],
            ia: null,
            gutendex_id: item.gutendex_id || null,
            description: item.desc || '',
        };
        this.showBookDetails(book);
    }

    async loadCategory(category) {
        const cacheKey = `cat_${category}`;
        if (this.cachedCategories[cacheKey]) {
            this.renderBooks(this.cachedCategories[cacheKey]);
            return;
        }

        this.container.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">Loading ${CATEGORY_LABELS[category] || category}...</div>`;

        const query = CATEGORY_QUERIES[category] || category;

        try {
            const res = await fetch(`${OL_BASE}/search.json?q=${encodeURIComponent(query)}&limit=40&sort=rating`);
            const data = await res.json();
            const docs = (data.docs || []).filter(d => d.cover_i);

            if (docs.length > 0) {
                const mapped = docs.map(d => ({
                    id: d.key || '',
                    title: d.title || 'Untitled',
                    author_name: d.author_name || ['Unknown'],
                    first_publish_year: d.first_publish_year || null,
                    cover_i: d.cover_i || null,
                    subject: d.subject || [],
                    ia: d.ia ? d.ia[0] : null,
                    isbn: d.isbn ? d.isbn[0] : null,
                    ratings_average: d.ratings_average || null,
                    number_of_pages_median: d.number_of_pages_median || null,
                    publisher: d.publisher ? d.publisher[0] : null,
                    description: null,
                    gutendex_id: null,
                }));
                this.cachedCategories[cacheKey] = mapped;
                this.renderBooks(mapped);
                return;
            }

            const fallback = this.prepareFallback(category);
            if (fallback.length > 0) {
                await this.resolveFallbackCovers(fallback);
                this.cachedCategories[cacheKey] = fallback;
                this.renderBooks(fallback);
                return;
            }
            throw new Error('No results');
        } catch {
            const fallback = this.prepareFallback(category);
            if (fallback.length > 0) {
                await this.resolveFallbackCovers(fallback);
                this.cachedCategories[cacheKey] = fallback;
                this.renderBooks(fallback);
            } else {
                const all = this.prepareFallback('trending');
                await this.resolveFallbackCovers(all);
                this.cachedCategories[cacheKey] = all;
                this.renderBooks(all);
            }
        }
    }

    prepareFallback(category) {
        return FALLBACK_BOOKS.filter(b => {
            if (category === 'trending') return true;
            return b.subject && b.subject.some(s => s.includes(category) || category.includes(s));
        }).slice(0, 40);
    }

    async resolveFallbackCovers(books) {
        const batch = books.filter(b => !b.cover_i);
        if (!batch.length) return;
        const promises = batch.map(async (book) => {
            try {
                const query = encodeURIComponent(`${book.title} ${book.author_name[0] || ''}`);
                const res = await fetch(`${OL_BASE}/search.json?q=${query}&limit=1`);
                const data = await res.json();
                const doc = data.docs && data.docs[0];
                if (doc && doc.cover_i) book.cover_i = doc.cover_i;
            } catch {}
        });
        await Promise.all(promises);
    }

    renderBooks(bookList) {
        this.container.innerHTML = '';
        if (!bookList.length) {
            this.container.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">No books found.</div>`;
            return;
        }
        bookList.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            const coverUrl = book.cover_i ? `${COVERS_BASE}/${book.cover_i}-L.jpg` : '';
            const author = book.author_name ? (Array.isArray(book.author_name) ? book.author_name[0] : book.author_name) : 'Unknown';
            const year = book.first_publish_year || '';
            card.innerHTML = `
                <div class="book-cover-wrapper">
                    ${coverUrl ? `<img src="${coverUrl}" alt="${book.title}" class="book-cover" loading="lazy">` : '<div class="book-cover" style="background:rgba(255,255,255,0.03);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:2rem;">&#128218;</div>'}
                </div>
                <div class="book-card-info">
                    <h4 class="book-title">${book.title}</h4>
                    <div class="book-meta-row">
                        <span>${author}</span>
                        ${year ? `<span>${year}</span>` : ''}
                    </div>
                </div>
            `;
            card.addEventListener('click', () => this.showBookDetails(book));
            this.container.appendChild(card);
        });
    }

    async doSearch() {
        const query = this.searchInput.value.trim();
        if (!query) return;
        playClickSound();
        this.searchResultsMode = true;
        this.container.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">Searching "${query}"...</div>`;

        document.querySelectorAll('.books-cat-tab').forEach(t => t.classList.remove('active'));

        try {
            const res = await fetch(`${OL_BASE}/search.json?q=${encodeURIComponent(query)}&limit=40&sort=rating`);
            const data = await res.json();
            const docs = (data.docs || []).filter(d => d.cover_i);

            if (docs.length === 0) {
                this.container.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">No results for "${query}".</div>`;
                return;
            }

            const mapped = docs.map(d => ({
                id: d.key || '',
                title: d.title || 'Untitled',
                author_name: d.author_name || ['Unknown'],
                first_publish_year: d.first_publish_year || null,
                cover_i: d.cover_i || null,
                subject: d.subject || [],
                ia: d.ia ? d.ia[0] : null,
                isbn: d.isbn ? d.isbn[0] : null,
                ratings_average: d.ratings_average || null,
                number_of_pages_median: d.number_of_pages_median || null,
                publisher: d.publisher ? d.publisher[0] : null,
                description: null,
                gutendex_id: null,
            }));
            this.renderBooks(mapped);
        } catch {
            this.container.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">Search failed.</div>`;
        }
    }

    closeOverlay() {
        this.closeReader();
        this.overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }

    async showBookDetails(book) {
        playClickSound();
        this.closeOverlay();

        const coverUrl = book.cover_i ? `${COVERS_BASE}/${book.cover_i}-L.jpg` : '';
        const author = book.author_name ? (Array.isArray(book.author_name) ? book.author_name[0] : book.author_name) : 'Unknown';
        const year = book.first_publish_year || '—';
        const genres = book.subject ? book.subject.slice(0, 4).join(', ') : '—';

        this.overlayBackdrop.style.backgroundImage = coverUrl ? `url('${coverUrl}')` : 'none';
        this.overlayPoster.src = coverUrl || '';
        this.overlayTitle.textContent = book.title;
        this.overlayAuthor.textContent = `by ${author}`;
        this.overlayYear.textContent = year;
        this.overlayRating.textContent = book.ratings_average ? `★ ${book.ratings_average.toFixed(1)}` : '';
        this.overlayGenre.textContent = genres;
        this.overlayOverview.textContent = book.description || 'No description available.';

        const canRead = Boolean(book.gutendex_id) || Boolean(book.ia);

        if (this.overlayExtra) {
            this.overlayExtra.innerHTML = `
                <div class="books-extra-row"><span class="label">Author</span><span class="value">${author}</span></div>
                <div class="books-extra-row"><span class="label">Published</span><span class="value">${year}</span></div>
                ${book.publisher ? `<div class="books-extra-row"><span class="label">Publisher</span><span class="value">${book.publisher}</span></div>` : ''}
                ${book.number_of_pages_median ? `<div class="books-extra-row"><span class="label">Pages</span><span class="value">${book.number_of_pages_median}</span></div>` : ''}
                ${book.isbn ? `<div class="books-extra-row"><span class="label">ISBN</span><span class="value">${book.isbn}</span></div>` : ''}
            `;
        }

        this.overlayReadBtn.classList.remove('hidden');
        this.overlayReadBtn.textContent = canRead ? 'Read Free' : 'Find Free Copy';

        this.currentBook = book;

        this.overlay.classList.remove('hidden');
        if (this.overlayScroll) this.overlayScroll.scrollTop = 0;
        else this.overlay.scrollTop = 0;
        document.body.style.overflow = 'hidden';

        if (!book.description) this.fetchBookDescription(book);
    }

    async fetchBookDescription(book) {
        try {
            if (book.id) {
                const key = book.id.startsWith('/') ? book.id : `/works/${book.id}`;
                const res = await fetch(`${OL_BASE}${key}.json`);
                const data = await res.json();
                const desc = data.description;
                if (desc) {
                    book.description = typeof desc === 'string' ? desc : (desc.value || '');
                    if (this.currentBook === book) {
                        this.overlayOverview.textContent = book.description;
                    }
                }
            }
        } catch {}
    }

    async readCurrentBook() {
        if (!this.currentBook) return;
        const book = this.currentBook;
        playClickSound();
        this.readerTitle.textContent = book.title;

        document.body.classList.add('books-reading-mode');
        this.textReader.classList.add('hidden');
        this.overlayIframe.classList.add('hidden');
        this.readerLoading.classList.remove('hidden');
        this.overlayReader.classList.remove('hidden');

        try {
            this.overlayReader.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (e) {}

        if (book.ia) {
            this.overlayIframe.src = `https://archive.org/stream/${book.ia}?ui=embed#`;
            this.overlayIframe.classList.remove('hidden');
            this.readerLoading.classList.add('hidden');
            return;
        }

        if (book.gutendex_id) {
            await this.loadTextReader(book.gutendex_id, book);
            return;
        }

        const query = encodeURIComponent(`${book.title} ${Array.isArray(book.author_name) ? book.author_name[0] : book.author_name}`);
        await this.tryGutendexSearch(book, query);
    }

    async loadTextReader(gId, book) {
        const textUrl = `https://www.gutenberg.org/cache/epub/${gId}/pg${gId}.txt`;

        // Try styled text via CORS proxy
        for (const buildProxyUrl of PROXIES) {
            try {
                const res = await fetch(buildProxyUrl(textUrl));
                if (!res.ok) throw new Error('Fetch failed');
                let text = await res.text();
                const startMarkers = ['*** START OF THE PROJECT GUTENBERG', '*** START OF THIS PROJECT GUTENBERG',
                    '***START OF THE PROJECT GUTENBERG', '***START OF THIS PROJECT GUTENBERG'];
                const endMarkers = ['*** END OF THE PROJECT GUTENBERG', '*** END OF THIS PROJECT GUTENBERG',
                    '***END OF THE PROJECT GUTENBERG', '***END OF THIS PROJECT GUTENBERG'];

                let startIdx = 0;
                for (const m of startMarkers) {
                    const idx = text.indexOf(m);
                    if (idx !== -1) {
                        const endline = text.indexOf('\n', idx);
                        startIdx = endline !== -1 ? endline + 1 : idx + m.length;
                        break;
                    }
                }

                let endIdx = text.length;
                for (const m of endMarkers) {
                    const idx = text.indexOf(m);
                    if (idx !== -1) {
                        endIdx = idx;
                        break;
                    }
                }

                let content = text.slice(startIdx, endIdx).trim();
                content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                const lines = content.split('\n');
                const formatted = lines.map(line => {
                    const trimmed = line.trim();
                    if (!trimmed) return '<br>';
                    if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 80) {
                        return `<h3 style="text-align:center;font-family:'Georgia',serif;margin:1.5em 0 0.5em;font-size:1.2rem;font-weight:700;">${this.escapeHtml(trimmed)}</h3>`;
                    }
                    return `<p style="text-indent:1.5em;margin:0;">${this.escapeHtml(trimmed)}</p>`;
                }).join('\n');

                this.readerLoading.classList.add('hidden');
                this.textReader.innerHTML = formatted;
                this.textReader.classList.remove('hidden');
                this.textReader.scrollTop = 0;
                return;
            } catch {}
        }

        // Fallback: load raw text in iframe (works cross-origin, no CORS needed)
        this.readerLoading.classList.add('hidden');
        this.overlayIframe.src = textUrl;
        this.overlayIframe.classList.remove('hidden');
    }

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    async tryGutendexSearch(book, query) {
        this.overlayReadBtn.textContent = 'Searching...';
        this.overlayReadBtn.disabled = true;
        try {
            const res = await fetch(`${GUTENDEX_BASE}?search=${query}`);
            const data = await res.json();
            const results = data.results || [];
            if (results.length > 0) {
                const gId = results[0].id;
                book.gutendex_id = gId;
                this.readerTitle.textContent = book.title;
                document.body.classList.add('books-reading-mode');
                this.textReader.classList.add('hidden');
                this.overlayIframe.classList.add('hidden');
                this.readerLoading.classList.remove('hidden');
                this.overlayReader.classList.remove('hidden');
                try {
                    this.overlayReader.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } catch (e) {}
                await this.loadTextReader(gId, book);
            } else {
                this.overlayReadBtn.textContent = 'Not Available';
                this.overlayReadBtn.disabled = false;
                this.overlayReadBtn.classList.remove('hidden');
            }
        } catch {
            this.overlayReadBtn.textContent = 'Not Available';
            this.overlayReadBtn.disabled = false;
            this.overlayReadBtn.classList.remove('hidden');
        }
    }
}

let booksInstance;

export function initBooks() {
    const container = document.getElementById('books-cards-container');
    if (!container) return;
    booksInstance = new BooksEngine();
    return booksInstance;
}
