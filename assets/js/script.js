
        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });

        // Header glass surface deepens on scroll (see .header.scrolled in style.css)
        window.addEventListener('scroll', function() {
            const header = document.querySelector('.header');
            header.classList.toggle('scrolled', window.scrollY > 100);
        });

        // Category filter functionality
        const categoryBtns = document.querySelectorAll('.category-btn');

        function applyCategoryFilter(category) {
            const normalized = category.trim().toLowerCase();
            const cards = document.querySelectorAll('#movies-grid .content-card');

            cards.forEach((card, index) => {
                const meta = card.querySelector('.card-meta')?.textContent.toLowerCase() || '';
                const matches = normalized === 'all' || meta.includes(normalized);

                card.style.display = matches ? 'flex' : 'none';

                if (matches) {
                    card.style.animation = 'none';
                    setTimeout(() => {
                        card.style.animation = `fadeInUp 0.6s ease forwards`;
                        card.style.animationDelay = `${index * 0.1}s`;
                    }, 50);
                }
            });
        }

        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                applyCategoryFilter(this.textContent);
            });
        });

        // Support ?genre=Action style links (used by genre.html cards)
        const requestedGenre = new URLSearchParams(window.location.search).get('genre');
        if (requestedGenre) {
            const matchingBtn = Array.from(categoryBtns).find(
                b => b.textContent.trim().toLowerCase() === requestedGenre.trim().toLowerCase()
            );
            if (matchingBtn) {
                matchingBtn.click();
            } else {
                // Genre has no matching category button/data yet - show nothing
                // rather than silently ignoring the request.
                applyCategoryFilter(requestedGenre);
                categoryBtns.forEach(b => b.classList.remove('active'));
            }
        }

        // Search functionality
        const searchBox = document.querySelector('.search-box');
        searchBox.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const cards = document.querySelectorAll('.content-card');
            
            cards.forEach(card => {
                const title = card.querySelector('.card-title').textContent.toLowerCase();
                const description = card.querySelector('.card-description').textContent.toLowerCase();
                
                const matches = title.includes(searchTerm) || description.includes(searchTerm);
                card.style.display = matches ? 'flex' : 'none';
            });
        });

        // Add click animations to cards
        document.querySelectorAll('.content-card').forEach(card => {
            card.addEventListener('click', function() {
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = 'translateY(-10px)';
                }, 100);
            });
        });

        // Random rating animation
        function animateRatings() {
            const ratings = document.querySelectorAll('.rating');
            ratings.forEach(rating => {
                const currentRating = parseFloat(rating.textContent);
                let displayRating = 0;
                const increment = currentRating / 50;
                
                const timer = setInterval(() => {
                    displayRating += increment;
                    if (displayRating >= currentRating) {
                        displayRating = currentRating;
                        clearInterval(timer);
                    }
                    rating.textContent = displayRating.toFixed(1);
                }, 20);
            });
        }

        // Trigger rating animation when cards come into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        animateRatings();
                    }, 500);
                    observer.unobserve(entry.target);
                }
            });
        });

        document.querySelectorAll('.content-grid').forEach(grid => {
            observer.observe(grid);
        });
