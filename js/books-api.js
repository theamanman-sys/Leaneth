import { playClickSound } from './router.js';

const OL_BASE = 'https://openlibrary.org';
const COVERS_BASE = 'https://covers.openlibrary.org/b/id';
const GUTENDEX_BASE = 'https://gutendex.com/books';

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
    { id: 'OL7353617M', title: 'The Great Gatsby', author_name: ['F. Scott Fitzgerald'], first_publish_year: 1925, cover_i: 8428193, subject: ['fiction'], ia: 'greatgatsby00fitzgoog', gutendex_id: 64317 },
    { id: 'OL21640713M', title: '1984', author_name: ['George Orwell'], first_publish_year: 1949, cover_i: 8215593, subject: ['fiction'], ia: '1984orwell', gutendex_id: 54728 },
    { id: 'OL22318317M', title: 'To Kill a Mockingbird', author_name: ['Harper Lee'], first_publish_year: 1960, cover_i: 8215594, subject: ['fiction'], ia: 'tokillamockingbird00leerich', gutendex_id: 52375 },
    { id: 'OL274482W', title: 'Moby Dick', author_name: ['Herman Melville'], first_publish_year: 1851, cover_i: 8362945, subject: ['classics'], ia: 'mobydickorwhale00melv', gutendex_id: 2701 },
    { id: 'OL16002888W', title: 'Pride and Prejudice', author_name: ['Jane Austen'], first_publish_year: 1813, cover_i: 8465938, subject: ['classics'], ia: 'prideandprejudice00aust', gutendex_id: 1342 },
    { id: 'OL24316234M', title: 'The Adventures of Sherlock Holmes', author_name: ['Arthur Conan Doyle'], first_publish_year: 1892, cover_i: 8472635, subject: ['fiction'], ia: 'adventuressherlock00doyl', gutendex_id: 1661 },
    { id: 'OL362871M', title: 'The Catcher in the Rye', author_name: ['J.D. Salinger'], first_publish_year: 1951, cover_i: 8479836, subject: ['fiction'], ia: 'catcherintherye00salirich', gutendex_id: 5107 },
    { id: 'OL892387M', title: 'Fahrenheit 451', author_name: ['Ray Bradbury'], first_publish_year: 1953, cover_i: 8274793, subject: ['fiction', 'science'], ia: 'fahrenheit45100brad', gutendex_id: 17429 },
    { id: 'OL245199X', title: 'Brave New World', author_name: ['Aldous Huxley'], first_publish_year: 1932, cover_i: 8382917, subject: ['fiction', 'science'], ia: 'bravenewworld00huxl', gutendex_id: 4981 },
    { id: 'OL16807594W', title: 'The Hobbit', author_name: ['J.R.R. Tolkien'], first_publish_year: 1937, cover_i: 8215608, subject: ['fiction'], ia: 'hobbit00tolk', gutendex_id: 5904 },
    { id: 'OL16813427W', title: 'The Lord of the Rings', author_name: ['J.R.R. Tolkien'], first_publish_year: 1954, cover_i: 8456861, subject: ['fiction'], ia: 'lordofrings00tolk', gutendex_id: 5905 },
    { id: 'OL21644313M', title: 'Dune', author_name: ['Frank Herbert'], first_publish_year: 1965, cover_i: 8293981, subject: ['science', 'fiction'], ia: 'dune00herb', gutendex_id: 53784 },
    { id: 'OL25613034M', title: 'The Alchemist', author_name: ['Paulo Coelho'], first_publish_year: 1988, cover_i: 8476251, subject: ['fiction'], ia: 'alchemist00coel' },
    { id: 'OL15842672M', title: 'The Da Vinci Code', author_name: ['Dan Brown'], first_publish_year: 2003, cover_i: 8274849, subject: ['fiction'], ia: 'davincicode00brow' },
    { id: 'OL22752093M', title: 'Harry Potter and the Sorcerer\'s Stone', author_name: ['J.K. Rowling'], first_publish_year: 1997, cover_i: 8260528, subject: ['fiction'], ia: 'harrypottersorcer00rowl', gutendex_id: 52375 },
    { id: 'OL506928W', title: 'The Art of War', author_name: ['Sun Tzu'], first_publish_year: -500, cover_i: 8437291, subject: ['philosophy', 'history'], ia: 'artofwar00sunt', gutendex_id: 132 },
    { id: 'OL16002888W', title: 'Sense and Sensibility', author_name: ['Jane Austen'], first_publish_year: 1811, cover_i: 8465828, subject: ['classics'], ia: 'senseandsensibility00aust', gutendex_id: 161 },
    { id: 'OL262102W', title: 'Dracula', author_name: ['Bram Stoker'], first_publish_year: 1897, cover_i: 8436289, subject: ['fiction', 'classics'], ia: 'dracula00stok', gutendex_id: 345 },
    { id: 'OL21192W', title: 'Frankenstein', author_name: ['Mary Shelley'], first_publish_year: 1818, cover_i: 8429381, subject: ['fiction', 'science', 'classics'], ia: 'frankenstein00shel', gutendex_id: 84 },
    { id: 'OL15209189W', title: 'The Time Machine', author_name: ['H.G. Wells'], first_publish_year: 1895, cover_i: 8260583, subject: ['science', 'fiction', 'classics'], ia: 'timemachine00well', gutendex_id: 2493 },
    { id: 'OL21729093M', title: 'Watchmen', author_name: ['Alan Moore'], first_publish_year: 1987, cover_i: 8295201, subject: ['comics'], ia: 'watchmen00alan' },
    { id: 'OL22507686M', title: 'Batman: The Killing Joke', author_name: ['Alan Moore'], first_publish_year: 1988, cover_i: 8347293, subject: ['comics'], ia: 'batmankillingjoke00alan' },
    { id: 'OL21287655M', title: 'Sapiens', author_name: ['Yuval Noah Harari'], first_publish_year: 2011, cover_i: 8420583, subject: ['history', 'non-fiction'], ia: 'sapiensbriefhistory00hara' },
    { id: 'OL259293W', title: 'A Brief History of Time', author_name: ['Stephen Hawking'], first_publish_year: 1988, cover_i: 8362917, subject: ['science', 'non-fiction'], ia: 'briefhistoryoftime00step' },
    { id: 'OL72392W', title: 'Meditations', author_name: ['Marcus Aurelius'], first_publish_year: 180, cover_i: 8481729, subject: ['philosophy', 'classics'], ia: 'meditations00marc', gutendex_id: 2680 },
    { id: 'OL280363W', title: 'The Republic', author_name: ['Plato'], first_publish_year: -375, cover_i: 8436281, subject: ['philosophy', 'classics'], ia: 'republic00plat', gutendex_id: 1497 },
    { id: 'OL16002888W', title: 'Emma', author_name: ['Jane Austen'], first_publish_year: 1815, cover_i: 8465819, subject: ['classics', 'fiction'], ia: 'emma00aust', gutendex_id: 158 },
    { id: 'OL24733870M', title: 'A Game of Thrones', author_name: ['George R.R. Martin'], first_publish_year: 1996, cover_i: 8215606, subject: ['fiction'], ia: 'gameofthrones00mart' },
    { id: 'OL257150W', title: 'The Odyssey', author_name: ['Homer'], first_publish_year: -800, cover_i: 8457261, subject: ['classics', 'fiction'], ia: 'odyssey00home', gutendex_id: 1727 },
    { id: 'OL280362W', title: 'The Iliad', author_name: ['Homer'], first_publish_year: -800, cover_i: 8457262, subject: ['classics', 'fiction'], ia: 'iliad00home', gutendex_id: 6130 },
    { id: 'OL87079W', title: 'The Divine Comedy', author_name: ['Dante Alighieri'], first_publish_year: 1320, cover_i: 8452763, subject: ['classics', 'fiction'], ia: 'divinecomedy00dant', gutendex_id: 8800 },
    { id: 'OL68144W', title: 'The Brothers Karamazov', author_name: ['Fyodor Dostoevsky'], first_publish_year: 1880, cover_i: 8473629, subject: ['classics', 'fiction'], ia: 'brotherskaramazov00dost', gutendex_id: 28054 },
    { id: 'OL81947W', title: 'Crime and Punishment', author_name: ['Fyodor Dostoevsky'], first_publish_year: 1866, cover_i: 8473628, subject: ['classics', 'fiction'], ia: 'crimeandpunishment00dost', gutendex_id: 2554 },
    { id: 'OL17213921W', title: 'The Picture of Dorian Gray', author_name: ['Oscar Wilde'], first_publish_year: 1890, cover_i: 8436284, subject: ['classics', 'fiction'], ia: 'pictureofdoriangray00wild', gutendex_id: 174 },
    { id: 'OL17201094W', title: 'Alice\'s Adventures in Wonderland', author_name: ['Lewis Carroll'], first_publish_year: 1865, cover_i: 8465830, subject: ['classics', 'fiction'], ia: 'alicesadventures00carr', gutendex_id: 11 },
    { id: 'OL173244W', title: 'The War of the Worlds', author_name: ['H.G. Wells'], first_publish_year: 1898, cover_i: 8456382, subject: ['science', 'fiction', 'classics'], ia: 'warofworlds00well', gutendex_id: 36 },
];

const HERO_BOOKS = [
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover_i: 8428193, desc: 'A story of wealth, love, and the American Dream in the Roaring Twenties.' },
    { title: '1984', author: 'George Orwell', cover_i: 8215593, desc: 'A dystopian novel set in a totalitarian society ruled by Big Brother.' },
    { title: 'Dune', author: 'Frank Herbert', cover_i: 8293981, desc: 'A epic science fiction saga set on the desert planet Arrakis.' },
    { title: 'Sapiens', author: 'Yuval Noah Harari', cover_i: 8420583, desc: 'A brief history of humankind — from Stone Age to the present.' },
    { title: 'Moby Dick', author: 'Herman Melville', cover_i: 8362945, desc: 'The obsessive quest of Captain Ahab for the great white whale.' },
    { title: 'The Art of War', author: 'Sun Tzu', cover_i: 8437291, desc: 'An ancient Chinese military treatise on strategy and philosophy.' },
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
        this.overlayExtra = document.getElementById('books-overlay-extra');
        this.searchInput = document.getElementById('books-search-input');
        this.searchBtn = document.getElementById('books-search-btn');

        this.allBooks = [];
        this.cachedCategories = {};
        this.activeCategory = 'trending';
        this.currentBook = null;
        this.heroItems = HERO_BOOKS;
        this.heroIndex = 0;
        this.heroTimer = null;
        this.searchResultsMode = false;

        this.carouselContainers = {};

        this.init();
    }

    init() {
        if (!this.container) return;

        this.startHeroRotation();
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
                if (this.currentHeroItem) this.openHeroBookReader();
            });
        }

        this.setupHeroSwipe();
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

        if (this.heroBackdrop && coverUrl) {
            this.heroBackdrop.style.backgroundImage = `url('${coverUrl}')`;
            this.heroBackdrop.style.transition = 'background-image 0.8s ease';
        }
        if (this.heroBadge) this.heroBadge.textContent = 'Featured Book';
        if (this.heroTitle) this.heroTitle.textContent = item.title;
        if (this.heroAuthor) this.heroAuthor.textContent = `by ${item.author}`;
        if (this.heroRating) this.heroRating.textContent = '';
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
            cover_i: item.cover_i,
            first_publish_year: null,
            subject: [],
            ia: null,
            gutendex_id: null,
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
                }));
                this.cachedCategories[cacheKey] = mapped;
                this.renderBooks(mapped);
                return;
            }

            const fallback = FALLBACK_BOOKS.filter(b => {
                if (category === 'trending') return true;
                return b.subject && b.subject.some(s => s.includes(category) || category.includes(s));
            }).slice(0, 40);

            if (fallback.length > 0) {
                this.cachedCategories[cacheKey] = fallback;
                this.renderBooks(fallback);
                return;
            }
            throw new Error('No results');
        } catch {
            const fallback = FALLBACK_BOOKS.filter(b => {
                if (category === 'trending') return true;
                return b.subject && b.subject.some(s => s.includes(category) || category.includes(s));
            }).slice(0, 40);

            if (fallback.length > 0) {
                this.cachedCategories[cacheKey] = fallback;
                this.renderBooks(fallback);
            } else {
                this.cachedCategories[cacheKey] = FALLBACK_BOOKS;
                this.renderBooks(FALLBACK_BOOKS);
            }
        }
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
            }));
            this.renderBooks(mapped);
        } catch {
            this.container.innerHTML = `<div class="terminal-line text-muted text-center" style="width:100%;padding:4rem;">Search failed.</div>`;
        }
    }

    closeOverlay() {
        this.overlayReader.classList.add('hidden');
        this.overlayIframe.src = '';
        this.overlayReadBtn.classList.remove('hidden');
        this.overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }

    showBookDetails(book) {
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

        if (this.overlayExtra) {
            this.overlayExtra.innerHTML = `
                <div class="books-extra-row"><span class="label">Author</span><span class="value">${author}</span></div>
                <div class="books-extra-row"><span class="label">Published</span><span class="value">${year}</span></div>
                ${book.publisher ? `<div class="books-extra-row"><span class="label">Publisher</span><span class="value">${book.publisher}</span></div>` : ''}
                ${book.number_of_pages_median ? `<div class="books-extra-row"><span class="label">Pages</span><span class="value">${book.number_of_pages_median}</span></div>` : ''}
                ${book.isbn ? `<div class="books-extra-row"><span class="label">ISBN</span><span class="value">${book.isbn}</span></div>` : ''}
                <div class="books-extra-row"><span class="label">Source</span><span class="value">Open Library ${book.gutendex_id ? '+ Gutenberg' : ''}</span></div>
            `;
        }

        this.overlayReadBtn.classList.remove('hidden');
        this.overlayReadBtn.textContent = book.gutendex_id || book.ia ? 'Read Free' : 'View Details';

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

    readCurrentBook() {
        if (!this.currentBook) return;
        const book = this.currentBook;
        playClickSound();

        let readerUrl = null;

        if (book.gutendex_id) {
            readerUrl = `https://www.gutenberg.org/ebooks/${book.gutendex_id}.html.noimages`;
        } else if (book.ia) {
            readerUrl = `https://archive.org/stream/${book.ia}?ui=embed`;
        } else {
            const searchQuery = encodeURIComponent(`${book.title} ${Array.isArray(book.author_name) ? book.author_name[0] : book.author_name}`);
            this.tryGutendexSearch(book, searchQuery);
            return;
        }

        if (readerUrl) {
            this.overlayIframe.src = readerUrl;
            this.overlayReader.classList.remove('hidden');
            try {
                this.overlayReader.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (e) {}
        }
    }

    async tryGutendexSearch(book, query) {
        try {
            const res = await fetch(`${GUTENDEX_BASE}?search=${encodeURIComponent(query)}`);
            const data = await res.json();
            const results = data.results || [];
            if (results.length > 0) {
                const gId = results[0].id;
                book.gutendex_id = gId;
                const readerUrl = `https://www.gutenberg.org/ebooks/${gId}.html.noimages`;
                this.overlayIframe.src = readerUrl;
                this.overlayReader.classList.remove('hidden');
                try {
                    this.overlayReader.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } catch (e) {}
            } else {
                const fallbackUrl = `https://openlibrary.org/search?q=${encodeURIComponent(query)}`;
                window.open(fallbackUrl, '_blank');
            }
        } catch {
            const fallbackUrl = `https://openlibrary.org/search?q=${encodeURIComponent(query)}`;
            window.open(fallbackUrl, '_blank');
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
