(function () {
    const STORAGE_KEY = 'filmvault_removed_ids';
    const grid = document.getElementById('watchlistGrid');
    const emptyState = document.getElementById('emptyState');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortDropdown = document.getElementById('sortDropdown');
    const searchBox = document.querySelector('.search-box');

    function getRemovedIds() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function markRemoved(id) {
        const removed = getRemovedIds();
        if (!removed.includes(id)) {
            removed.push(id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(removed));
        }
    }

    function getCards() {
        return Array.from(grid.querySelectorAll('.watchlist-card'));
    }

    function updateStats() {
        const visible = getCards().filter(c => c.style.display !== 'none');
        const movies = visible.filter(c => c.dataset.type === 'movie').length;
        const series = visible.filter(c => c.dataset.type === 'series').length;

        const statTotal = document.getElementById('statTotalItems');
        const statMovies = document.getElementById('statMovies');
        const statSeries = document.getElementById('statSeries');
        if (statTotal) statTotal.textContent = visible.length;
        if (statMovies) statMovies.textContent = movies;
        if (statSeries) statSeries.textContent = series;

        if (getCards().length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            grid.style.display = 'grid';
            emptyState.style.display = 'none';
        }
    }

    // Apply anything removed in a previous visit
    function applyPersistedRemovals() {
        const removed = getRemovedIds();
        removed.forEach(id => {
            const card = grid.querySelector(`.watchlist-card[data-id="${id}"]`);
            if (card) card.remove();
        });
    }

    // Filtering (All / Movies / TV Series / Recently Added)
    function applyFilter(filter) {
        const cards = getCards();

        if (filter === 'recent') {
            // "Recently added" isn't a type - show everything, most recent first
            cards
                .slice()
                .sort((a, b) => Number(a.dataset.addedDays) - Number(b.dataset.addedDays))
                .forEach(card => {
                    card.style.display = 'block';
                    grid.appendChild(card);
                });
        } else {
            cards.forEach(card => {
                const matches = filter === 'all' || card.dataset.type === filter;
                card.style.display = matches ? 'block' : 'none';
            });
        }

        updateStats();
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            applyFilter(this.dataset.filter);
        });
    });

    // Sorting
    function applySort(criterion) {
        const cards = getCards();

        const comparators = {
            'date-added': (a, b) => Number(a.dataset.addedDays) - Number(b.dataset.addedDays),
            'title': (a, b) => a.querySelector('.card-title').textContent
                .localeCompare(b.querySelector('.card-title').textContent),
            'rating': (a, b) => parseFloat(b.querySelector('.rating').textContent) -
                parseFloat(a.querySelector('.rating').textContent),
            'year': (a, b) => Number(b.dataset.year) - Number(a.dataset.year),
        };

        const comparator = comparators[criterion] || comparators['date-added'];
        cards.sort(comparator).forEach(card => grid.appendChild(card));
    }

    if (sortDropdown) {
        sortDropdown.addEventListener('change', function () {
            const criterion = this.value;
            applySort(criterion);
        });
    }

    // Remove button
    grid.addEventListener('click', function (e) {
        const removeBtn = e.target.closest('.btn-remove');
        if (!removeBtn) return;

        const card = removeBtn.closest('.watchlist-card');
        const title = card.querySelector('.card-title').textContent;
        if (!confirm(`Remove "${title}" from your watchlist?`)) return;

        markRemoved(card.dataset.id);
        card.remove();
        updateStats();
    });

    // Play button (overlay) and the main action button - no real playback
    // backend exists, so give honest feedback instead of a dead click.
    grid.addEventListener('click', function (e) {
        const playTrigger = e.target.closest('.play-button, .card-footer .btn');
        if (!playTrigger) return;

        const card = playTrigger.closest('.watchlist-card');
        const title = card.querySelector('.card-title').textContent;
        showToast(`Now playing: ${title}`);
    });

    // Search within the watchlist
    if (searchBox) {
        searchBox.addEventListener('input', function () {
            const term = this.value.toLowerCase();
            getCards().forEach(card => {
                const title = card.querySelector('.card-title').textContent.toLowerCase();
                const description = card.querySelector('.card-description').textContent.toLowerCase();
                card.style.display = (title.includes(term) || description.includes(term)) ? 'block' : 'none';
            });
            updateStats();
        });
    }

    // Minimal toast notification, styled to match the dark theme
    function showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            padding: 0.8rem 1.5rem;
            border-radius: 25px;
            font-weight: 600;
            box-shadow: 0 10px 25px rgba(255, 107, 53, 0.4);
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(toast);
        requestAnimationFrame(() => { toast.style.opacity = '1'; });
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    applyPersistedRemovals();
    updateStats();
})();
