// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add active state to current page in nav
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
    
    // Console easter egg
    console.log('%c NEFORCEO ', 'background: #009688; color: white; font-size: 20px; padding: 10px;');
    console.log('%c Welcome to my website! ', 'background: #455a64; color: white; font-size: 14px; padding: 5px;');
});