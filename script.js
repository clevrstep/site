/* ================================================================
   CLEVRSTEP - INTERACTIVE CORE JS
   FUNCTIONALITY: Modals, Web3Forms, Scroll Reveal, Mobile Menu
================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. MOBILE MENU TOGGLE ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('nav ul');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
            // Toggle icon between bars and times (X)
            const icon = menuToggle.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // --- AUTO HIGHLIGHT NAV ITEM BASED ON PATH ---
    (function highlightNav(){
        try {
            const links = document.querySelectorAll('nav a');
            const path = window.location.pathname.split('/').pop() || 'index.html';
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (!href) return;
                // normalize index
                const cleanHref = href.split('/').pop();
                if (cleanHref === path) {
                    link.classList.add('nav-active');
                } else {
                    link.classList.remove('nav-active');
                }
            });
        } catch(e) { /* silent */ }
    })();

    // --- 2. SCROLL REVEAL ANIMATION ---
    // This adds the 'active' class to elements when they scroll into view
    const revealElements = () => {
        const reveals = document.querySelectorAll('.reveal');
        
        reveals.forEach((element, idx) => {
            const windowHeight = window.innerHeight;
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 120; // Trigger point

            if (elementTop < windowHeight - elementVisible) {
                // Add small stagger based on document order
                element.style.transitionDelay = `${(idx % 6) * 80}ms`;
                element.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealElements);
    // Trigger once on load to show header/hero elements
    revealElements(); 


    // --- 3. COURSE MODAL SYSTEM ---
    const modal = document.getElementById('courseModal');
    const courseCards = document.querySelectorAll('.course-card');
    const closeModalBtn = document.querySelector('.close-modal');

    // Only run if we are on the courses page
    if (courseCards.length > 0 && modal) {
        courseCards.forEach(card => {
            card.addEventListener('click', () => {
                // Extract data attributes from clicked card
                const title = card.getAttribute('data-title');
                const duration = card.getAttribute('data-duration');
                const tuition = card.getAttribute('data-tuition');
                const total = card.getAttribute('data-total');
                const imgSrc = card.querySelector('img').src;

                // Inject data into modal
                document.getElementById('modalTitle').innerText = title;
                document.getElementById('modalDuration').innerText = duration;
                document.getElementById('modalTuition').innerText = tuition;
                document.getElementById('modalTotal').innerText = total;
                document.getElementById('modalImg').src = imgSrc;

                // Show modal
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden'; // Stop background scrolling
            });
        });

        // Close functions
        const closeModal = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        };

        if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
        
        // Close if clicking outside the content box
        window.addEventListener('click', (e) => {
            if (e.target == modal) closeModal();
        });
    }


    // --- 4. CONTACT FORM (WEB3FORMS INTEGRATION) ---
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Stop page reload
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;

            // Loading state
            submitBtn.innerText = "Transmitting Data...";
            submitBtn.style.opacity = "0.7";
            submitBtn.disabled = true;

            // Gather data
            const formData = new FormData(contactForm);
            const jsonData = JSON.stringify(Object.fromEntries(formData));

            // Send to Web3Forms
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: jsonData
            })
            .then(async (response) => {
                let json = await response.json();
                if (response.status == 200) {
                    // Success
                    formStatus.style.color = '#2ecc71'; // Success Green
                    formStatus.innerHTML = '<i class="fas fa-check-circle"></i> Inquiry received. We will contact you shortly.';
                    contactForm.reset();
                } else {
                    // API Error
                    formStatus.style.color = '#e74c3c';
                    formStatus.innerText = json.message;
                }
            })
            .catch(error => {
                // Network Error
                formStatus.style.color = '#e74c3c';
                formStatus.innerText = "Network Error. Please check your internet connection.";
            })
            .finally(() => {
                // Reset button
                submitBtn.innerText = originalBtnText;
                submitBtn.style.opacity = "1";
                submitBtn.disabled = false;
                
                // Clear success message after 6 seconds
                setTimeout(() => {
                    formStatus.innerText = "";
                }, 6000);
            });
        });
    }

    // --- 5. REVIEW SYSTEM (LOCAL STORAGE + STAR INTERACTIONS) ---

    // --- PAGE DECOR INJECTION (add blob/shapes to every page) ---
    (function addPageDecor() {
        try {
            // Avoid duplicating
            if (document.querySelector('.page-blob')) return;

            // Create a soft blob for pages without hero or as extra layer
            const blob = document.createElement('div');
            blob.className = 'page-blob';
            document.body.appendChild(blob);

            // Add a couple of small floating shapes that subtly respond to mouse move on wide screens
            const shapes = [];
            for (let i = 0; i < 3; i++) {
                const s = document.createElement('div');
                s.className = 'page-floating-shape';
                s.style.left = `${8 + i * 14}%`;
                s.style.top = `${14 + i * 10}%`;
                s.style.opacity = String(0.95 - i * 0.18);
                s.style.transform = 'translate3d(0,0,0)';
                document.body.appendChild(s);
                shapes.push(s);
            }

            // mousemove parallax for desktop
            if (window.innerWidth > 900 && window.matchMedia && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                window.addEventListener('mousemove', (e) => {
                    const cx = e.clientX / window.innerWidth - 0.5;
                    const cy = e.clientY / window.innerHeight - 0.5;
                    shapes.forEach((el, idx) => {
                        const depth = 8 + idx * 12;
                        el.style.transform = `translate3d(${cx * depth}px, ${cy * (depth / 1.5)}px, 0)`;
                    });
                });
            }
        } catch(e) { /* silent */ }
    })();
    const REVIEW_KEY = 'clevrstep_reviews';
    const reviewFormElem = document.getElementById('reviewForm');
    const starInput = document.getElementById('starInput');
    const reviewRatingInput = document.getElementById('reviewRating');
    const reviewsContainer = document.getElementById('reviewsContainer');
    const viewAllContainer = document.getElementById('viewAllContainer');
    const viewAllBtn = document.getElementById('viewAllReviewsBtn');
    const allReviewsModal = document.getElementById('allReviewsModal');
    const modalReviewsList = document.getElementById('modalReviewsList');
    const closeReviewsModal = document.getElementById('closeReviewsModal');

    function getReviews() {
        try { return JSON.parse(localStorage.getItem(REVIEW_KEY)) || []; }
        catch(e) { return []; }
    }

    function saveReviews(arr) {
        localStorage.setItem(REVIEW_KEY, JSON.stringify(arr));
    }

    function escapeHtml(unsafe) {
        return String(unsafe)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function renderStars(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += `<i class="fas fa-star ${i <= rating ? 'active' : ''}" aria-hidden="true"></i>`;
        }
        return html;
    }

    function renderReviews(limit = 5) {
        const all = getReviews().sort((a, b) => b.time - a.time);
        reviewsContainer.innerHTML = '';

        if (all.length === 0) {
            reviewsContainer.innerHTML = `<div class="card review-card reveal active" style="text-align:center; padding:24px;">No reviews yet — be the first to share your experience!</div>`;
            viewAllContainer.style.display = 'none';
            return;
        }

        const slice = (limit && all.length > 0) ? all.slice(0, limit) : all;

        slice.forEach(r => {
            const div = document.createElement('div');
            div.className = 'card review-card reveal active';
            div.innerHTML = `
                <div class="review-stars" aria-hidden="true">${renderStars(r.rating)}</div>
                <div style="flex:1">
                    <h4 style="color:var(--text-primary); margin-bottom:5px;">${escapeHtml(r.name)}</h4>
                    <p style="color:var(--text-secondary); font-size:0.95rem; margin-bottom:8px;">"${escapeHtml(r.text)}"</p>
                    <div style="font-size:0.82rem; color:var(--text-secondary)">${new Date(r.time).toLocaleString()}</div>
                </div>
            `;
            reviewsContainer.appendChild(div);
        });

        // Update view all button (show only when more than 5 reviews)
        if (viewAllBtn) {
            if (all.length > 5) {
                viewAllContainer.style.display = 'block';
                viewAllBtn.innerHTML = `View All Reviews (${all.length}) <i class="fas fa-arrow-right" style="margin-left: 8px;"></i>`;
            } else {
                viewAllContainer.style.display = 'none';
            }
        }
    }

    function renderModalAllReviews() {
        const all = getReviews().sort((a, b) => b.time - a.time);
        modalReviewsList.innerHTML = '';
        all.forEach(r => {
            const item = document.createElement('div');
            item.className = 'card review-item';
            item.style.marginBottom = '12px';
            item.innerHTML = `
                <div style="display:flex; gap:12px; align-items:flex-start;">
                    <div class="review-stars" aria-hidden="true">${renderStars(r.rating)}</div>
                    <div style="flex:1">
                        <h4 style="color:var(--text-primary); margin-bottom:6px;">${escapeHtml(r.name)}</h4>
                        <p style="color:var(--text-secondary); margin-bottom:6px;">"${escapeHtml(r.text)}"</p>
                        <div style="font-size:0.82rem; color:var(--text-secondary)">${new Date(r.time).toLocaleString()}</div>
                    </div>
                </div>
            `;
            modalReviewsList.appendChild(item);
        });
    }

    // Update star visuals to a given rating
    function updateStarDisplay(rating) {
        reviewRatingInput.value = String(rating);
        document.querySelectorAll('#starInput i').forEach(i => {
            const v = Number(i.getAttribute('data-value'));
            if (v <= rating) i.classList.add('active'); else i.classList.remove('active');
        });
    }

    // Star interactions (hover + click)
    if (starInput) {
        starInput.querySelectorAll('i').forEach(i => {
            i.addEventListener('mouseenter', () => {
                const val = Number(i.getAttribute('data-value'));
                // temporary highlight
                document.querySelectorAll('#starInput i').forEach(s => {
                    const sv = Number(s.getAttribute('data-value'));
                    if (sv <= val) s.classList.add('active'); else s.classList.remove('active');
                });
            });

            i.addEventListener('mouseleave', () => {
                // restore to selected
                updateStarDisplay(Number(reviewRatingInput.value));
            });

            i.addEventListener('click', () => {
                const val = Number(i.getAttribute('data-value'));
                updateStarDisplay(val);
            });
        });
    }

    // Initialize default stars
    updateStarDisplay(Number(reviewRatingInput.value) || 5);

    // Form submit
    if (reviewFormElem) {
        reviewFormElem.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('reviewName').value.trim();
            const text = document.getElementById('reviewText').value.trim();
            const rating = Number(reviewRatingInput.value) || 5;

            if (!name || !text) return alert('Please provide your name and a short review.');

            const reviews = getReviews();
            reviews.push({ name, text, rating, time: Date.now() });
            saveReviews(reviews);

            // Re-render and reset
            renderReviews(5);
            renderModalAllReviews();
            reviewFormElem.reset();
            updateStarDisplay(5);

            // Friendly in-page feedback instead of alert
            const thank = document.createElement('div');
            thank.style.color = 'var(--accent-navy)';
            thank.style.fontWeight = '600';
            thank.style.marginTop = '12px';
            thank.innerText = `Thanks! Your ${rating}-star review has been saved.`;
            reviewFormElem.appendChild(thank);
            setTimeout(() => thank.remove(), 4000);
        });
    }

    // View All Reviews button
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            renderModalAllReviews();
            allReviewsModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    // Close modal
    if (closeReviewsModal) {
        closeReviewsModal.addEventListener('click', () => {
            allReviewsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === allReviewsModal) {
            allReviewsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Initial render on load

    /* --- BACKGROUND PARALLAX (homepage only) --- */
    (function(){
        try {
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // respect user setting
            // Only enable when homepage hero exists and body has a background-image
            const hasHero = !!document.querySelector('.hero');
            const bodyBg = window.getComputedStyle(document.body).backgroundImage || '';
            if (!hasHero || !bodyBg || bodyBg === 'none') return;

            let lastY = 0; let ticking = false;
            const factor = window.innerWidth < 900 ? 0.12 : 0.28; // smaller effect on mobile

            function onScroll() {
                lastY = window.scrollY;
                if (!ticking) {
                    requestAnimationFrame(updateBg);
                    ticking = true;
                }
            }

            function updateBg() {
                ticking = false;
                // Move background upward as user scrolls, give a subtle 'floating away' effect
                const offset = Math.round(lastY * factor);
                document.body.style.backgroundPosition = `center ${-offset}px`;
            }

            window.addEventListener('scroll', onScroll, { passive: true });
            // set initial position
            updateBg();
        } catch(e) { /* fail silently */ }
    })();

    /* --- HERO FLOATING IMAGE (moves & fades with scroll) --- */
    (function(){
        try {
            const hero = document.querySelector('.hero');
            const heroFloat = document.getElementById('heroFloatImage');
            if (!hero || !heroFloat) return;
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { heroFloat.style.opacity = '1'; return; }

            let raf = null;
            function update() {
                const rect = hero.getBoundingClientRect();
                if (rect.bottom <= 0) { heroFloat.style.opacity = '0'; return; }
                const progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
                const translateY = -Math.round(progress * 140);
                const opacity = Math.max(0, 1 - progress * 1.1);
                heroFloat.style.transform = `translate3d(-50%, ${translateY}px, 0)`;
                heroFloat.style.opacity = String(opacity);
            }

            function onScroll() {
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(update);
            }

            window.addEventListener('scroll', onScroll, { passive: true });
            window.addEventListener('resize', onScroll);
            // initial update
            update();
        } catch(e) { /* no-op */ }
    })();

    renderReviews(5);
    renderModalAllReviews();

});