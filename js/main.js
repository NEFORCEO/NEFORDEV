document.addEventListener('DOMContentLoaded', function() {
    // Preloader
    const preloader = document.getElementById('preloader');
    
    window.addEventListener('load', function() {
        setTimeout(function() {
            preloader.classList.add('hidden');
            setTimeout(() => preloader.style.display = 'none', 500);
        }, 800);
    });

    const themeToggle = document.getElementById('themeToggle');
    const themeToggleFooter = document.getElementById('themeToggleFooter');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        if (newTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        localStorage.setItem('theme', newTheme);
        updateStarColor();
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (themeToggleFooter) {
        themeToggleFooter.addEventListener('click', toggleTheme);
    }

    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
        
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });


    const canvas = document.createElement('canvas');
    canvas.id = 'starfall';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
    document.body.insertBefore(canvas, preloader);
    
    const ctx = canvas.getContext('2d');
    let stars = [];
    let starColor = { r: 255, g: 255, b: 255 };
    const starCount = window.innerWidth < 768 ? 80 : 150;
    
    function updateStarColor() {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        if (isLight) {
            starColor = { r: 100, g: 120, b: 180 };
        } else {
            starColor = { r: 255, g: 255, b: 255 };
        }
    }
    updateStarColor();
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    function createStar() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 2 + 0.5,
            speedY: Math.random() * 2 + 1,
            speedX: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.8 + 0.2,
            twinkle: Math.random() * 0.02
        };
    }
    
    function initStars() {
        stars = [];
        for (let i = 0; i < starCount; i++) {
            const star = createStar();
            star.y = Math.random() * canvas.height;
            stars.push(star);
        }
    }
    
    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        stars.forEach(star => {
            const { r, g, b } = starColor;
            const gradient = ctx.createRadialGradient(
                star.x, star.y, 0,
                star.x, star.y, star.size * 2
            );
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${star.opacity})`);
            gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${star.opacity * 0.5})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${star.opacity})`;
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            
            const trailGradient = ctx.createLinearGradient(
                star.x, star.y,
                star.x - star.speedX * 10, star.y + star.speedY * 10
            );
            trailGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${star.opacity * 0.3})`);
            trailGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
            ctx.beginPath();
            ctx.strokeStyle = trailGradient;
            ctx.lineWidth = star.size;
            ctx.lineCap = 'round';
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(star.x - star.speedX * 8, star.y + star.speedY * 8);
            ctx.stroke();
            
            star.y += star.speedY;
            star.x += star.speedX;
            
            star.opacity += star.twinkle;
            if (star.opacity > 1 || star.opacity < 0.2) {
                star.twinkle = -star.twinkle;
            }
            
            if (star.y > canvas.height) {
                star.x = Math.random() * canvas.width;
                star.y = -10;
                star.size = Math.random() * 2 + 0.5;
                star.speedY = Math.random() * 2 + 1;
                star.speedX = Math.random() * 0.5 - 0.25;
                star.opacity = Math.random() * 0.8 + 0.2;
            }
            
            if (star.x > canvas.width) star.x = 0;
            if (star.x < 0) star.x = canvas.width;
        });
        
        requestAnimationFrame(drawStars);
    }
    
    resizeCanvas();
    initStars();
    drawStars();
    
    window.addEventListener('resize', function() {
        resizeCanvas();
    });

    console.log('%c NEFORCEO ', 'background: #009688; color: white; font-size: 20px; padding: 10px;');
    console.log('%c Welcome to my website! ', 'background: #455a64; color: white; font-size: 14px; padding: 5px;');
});