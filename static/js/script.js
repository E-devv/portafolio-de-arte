// Portafolio de Arte - JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // === CARRUSEL DE IMÁGENES ===
    const carousel = {
        track: null,
        items: [],
        currentIndex: 0,
        indicators: [],
        leftBtn: null,
        rightBtn: null,
        autoPlayInterval: null,
        autoPlayDelay: 5000, // 5 segundos
        
        init() {
            this.track = document.querySelector('.carousel-track');
            this.items = document.querySelectorAll('.carousel-item');
            this.indicators = document.querySelectorAll('.indicator');
            this.leftBtn = document.querySelector('.carousel-arrow.left');
            this.rightBtn = document.querySelector('.carousel-arrow.right');
            
            if (this.items.length === 0) return;
            
            this.items.forEach((item, index) => {
                item.classList.remove('active');
                item.style.display = 'none';
            });
            
            this.setupEventListeners();
            
            if (this.items.length > 0) {
                this.showSlide(0);
            }
            
            this.startAutoPlay();
        },
        
        setupEventListeners() {
            if (this.leftBtn) this.leftBtn.addEventListener('click', () => this.previousSlide());
            if (this.rightBtn) this.rightBtn.addEventListener('click', () => this.nextSlide());
            
            this.indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => this.goToSlide(index));
            });
            
            if (this.track) {
                this.track.addEventListener('mouseenter', () => this.stopAutoPlay());
                this.track.addEventListener('mouseleave', () => this.startAutoPlay());
            }
        },
        
        showSlide(index) {
            if (index < 0 || index >= this.items.length) return;
            
            this.items.forEach(item => {
                item.classList.remove('active');
                item.style.display = 'none';
            });
            
            if (this.items[index]) {
                this.items[index].classList.add('active');
                this.items[index].style.display = 'flex';
            }
            
            this.indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
            });
            
            this.currentIndex = index;
        },
        
        nextSlide() {
            const nextIndex = (this.currentIndex + 1) % this.items.length;
            this.showSlide(nextIndex);
        },
        
        previousSlide() {
            const prevIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
            this.showSlide(prevIndex);
        },
        
        goToSlide(index) {
            this.showSlide(index);
        },
        
        startAutoPlay() {
            this.stopAutoPlay();
            this.autoPlayInterval = setInterval(() => this.nextSlide(), this.autoPlayDelay);
        },
        
        stopAutoPlay() {
            if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
        }
    };
    
    // === NAVEGACIÓN SUAVE Y ACTIVA ===
    const navigation = {
        init() {
            this.setupSmoothScroll();
            this.setupScrollSpy();
        },
        
        setupSmoothScroll() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    document.querySelector(this.getAttribute('href')).scrollIntoView({
                        behavior: 'smooth'
                    });
                });
            });
        },

        setupScrollSpy() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('nav a');
            
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        navLinks.forEach(link => {
                            link.classList.remove('active');
                            if (link.getAttribute('href').substring(1) === entry.target.id) {
                                link.classList.add('active');
                            }
                        });
                    }
                });
            }, { threshold: 0.5 });

            sections.forEach(section => observer.observe(section));
        }
    };

    // === MODO OSCURO ===
    const darkMode = {
        init() {
            this.themeToggle = document.getElementById('theme-toggle');
            if (this.themeToggle) {
                this.themeToggle.addEventListener('click', () => this.toggleTheme());
            }
            this.loadTheme();
        },

        toggleTheme() {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        },

        setTheme(theme) {
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            const icon = this.themeToggle?.querySelector('i');
            if(icon) {
               icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        },

        loadTheme() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            this.setTheme(savedTheme);
        }
    };
    
    // INICIALIZACIÓN
    carousel.init();
    navigation.init();
    darkMode.init();
});

// Función simple para el menú responsive (si decides añadir uno)
function mostrarOcultarMenu() {
    const nav = document.querySelector('nav ul');
    nav.classList.toggle('active');
}