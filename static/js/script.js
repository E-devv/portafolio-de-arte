document.addEventListener('DOMContentLoaded', function() {

    // === CARRUSEL DE IMÁGENES ===
    const carousel = {
        track: document.querySelector('.carousel-track'),
        items: document.querySelectorAll('.carousel-item'),
        indicatorsContainer: document.querySelector('.carousel-indicators'),
        indicators: document.querySelectorAll('.indicator'),
        leftBtn: document.querySelector('.carousel-arrow.left'),
        rightBtn: document.querySelector('.carousel-arrow.right'),
        currentIndex: 0,
        autoPlayInterval: null,
        autoPlayDelay: 5000,

        init() {
            if (!this.track || this.items.length === 0) return;
            this.updateItemsAndIndicators(); // Actualiza la lista inicial
            this.setupEventListeners();
            this.showSlide(0);
            this.startAutoPlay();
        },

        updateItemsAndIndicators() {
            this.items = document.querySelectorAll('.carousel-item');
            // Limpiar indicadores existentes
            if (this.indicatorsContainer) this.indicatorsContainer.innerHTML = '';
            // Crear nuevos indicadores
            this.items.forEach((item, index) => {
                // Asegurar estado inicial correcto
                item.classList.remove('active', 'filtered-out');
                item.style.display = 'none';

                // Crear indicador si el contenedor existe
                if (this.indicatorsContainer) {
                    const indicator = document.createElement('span');
                    indicator.className = 'indicator';
                    indicator.dataset.slide = index;
                    indicator.addEventListener('click', () => this.goToSlide(index));
                    this.indicatorsContainer.appendChild(indicator);
                }
            });
             // Actualizar la lista de indicadores después de crearlos
             this.indicators = document.querySelectorAll('.indicator');
        },

        setupEventListeners() {
            if (this.leftBtn) this.leftBtn.addEventListener('click', () => this.previousSlide());
            if (this.rightBtn) this.rightBtn.addEventListener('click', () => this.nextSlide());
            if (this.track) {
                this.track.addEventListener('mouseenter', () => this.stopAutoPlay());
                this.track.addEventListener('mouseleave', () => this.startAutoPlay());
            }
            // Los listeners de indicadores se añaden en updateItemsAndIndicators
        },

        showSlide(index) {
            const visibleItems = Array.from(this.items).filter(item => !item.classList.contains('filtered-out'));
            if (visibleItems.length === 0) {
                 this.currentIndex = -1; // No hay items visibles
                 this.updateIndicatorActiveState(); // Asegura que no haya indicadores activos
                 return;
            }

             // Ajustar índice si el actual no es visible
             let targetIndex = index;
             if (index < 0 || index >= this.items.length || this.items[index].classList.contains('filtered-out')) {
                 // Busca el índice visible más cercano o el primero si no hay cercano
                 const firstVisible = visibleItems[0];
                 targetIndex = Array.from(this.items).indexOf(firstVisible);
             }

            this.items.forEach(item => {
                item.classList.remove('active');
                if (!item.classList.contains('filtered-out')) { // Solo ocultar si no está filtrado
                     item.style.display = 'none';
                }
            });

            if (this.items[targetIndex]) {
                this.items[targetIndex].classList.add('active');
                this.items[targetIndex].style.display = 'flex'; // Usar flex para centrar
            }

            this.currentIndex = targetIndex;
            this.updateIndicatorActiveState();
        },

        updateIndicatorActiveState() {
             this.indicators.forEach((indicator, i) => {
                const item = this.items[i];
                // Mostrar indicador solo si el item correspondiente es visible (no filtrado)
                indicator.style.display = item && !item.classList.contains('filtered-out') ? 'inline-block' : 'none';
                // Activar el indicador si es el índice actual
                indicator.classList.toggle('active', i === this.currentIndex);
            });
        },


        nextSlide() {
            const visibleItems = Array.from(this.items).filter(item => !item.classList.contains('filtered-out'));
            if (visibleItems.length === 0) return;

            let currentVisibleIndex = -1;
            visibleItems.forEach((item, idx) => {
                if (Array.from(this.items).indexOf(item) === this.currentIndex) {
                    currentVisibleIndex = idx;
                }
            });

            const nextVisibleIndex = (currentVisibleIndex + 1) % visibleItems.length;
            const nextItem = visibleItems[nextVisibleIndex];
            const nextGlobalIndex = Array.from(this.items).indexOf(nextItem);
            this.showSlide(nextGlobalIndex);
        },

        previousSlide() {
            const visibleItems = Array.from(this.items).filter(item => !item.classList.contains('filtered-out'));
             if (visibleItems.length === 0) return;

             let currentVisibleIndex = -1;
             visibleItems.forEach((item, idx) => {
                 if (Array.from(this.items).indexOf(item) === this.currentIndex) {
                     currentVisibleIndex = idx;
                 }
             });

            const prevVisibleIndex = (currentVisibleIndex - 1 + visibleItems.length) % visibleItems.length;
            const prevItem = visibleItems[prevVisibleIndex];
            const prevGlobalIndex = Array.from(this.items).indexOf(prevItem);
            this.showSlide(prevGlobalIndex);
        },

        goToSlide(index) {
             if (this.items[index] && !this.items[index].classList.contains('filtered-out')) {
                this.showSlide(index);
             } else {
                 // Si el slide clickeado está filtrado, no hacer nada o ir al primero visible
                 console.warn("Intentando ir a un slide filtrado.");
             }
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
            document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                        // Opcional: cerrar menú móvil si existe
                        document.querySelector('nav ul')?.classList.remove('active');
                    }
                });
            });
        },

        setupScrollSpy() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('nav a');

            const observerOptions = {
                 root: null, // relative to document viewport
                 rootMargin: '-50px 0px -50% 0px', // Adjust top/bottom margins
                 threshold: 0.1 // Trigger when 10% of the section is visible
             };

            const observer = new IntersectionObserver(entries => {
                let lastActiveFound = false; // Flag to activate only the last intersecting section top-down
                entries.forEach(entry => {
                    const link = document.querySelector(`nav a[href="#${entry.target.id}"]`);
                    if (entry.isIntersecting && !lastActiveFound) {
                         navLinks.forEach(lnk => lnk.classList.remove('active'));
                         if (link) {
                             link.classList.add('active');
                             lastActiveFound = true; // Mark as found to prevent lower sections from overriding
                         }
                    } else if (link) {
                         // link.classList.remove('active'); // Only remove if needed, handled by the loop above
                    }
                });
                 // If scrolled to top, activate HOME
                 if (window.scrollY < 100) {
                     navLinks.forEach(lnk => lnk.classList.remove('active'));
                     const homeLink = document.querySelector('nav a[href="#hero-section"]');
                     if (homeLink) homeLink.classList.add('active');
                 }

            }, observerOptions);

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
            const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light
            this.setTheme(savedTheme);
        }
    };

     // === FILTROS Y BÚSQUEDA ===
    const galleryFilters = {
        filterButtons: document.querySelectorAll('.filter-btn:not(.add-category-btn)'),
        searchInput: document.getElementById('search-input'),
        addCategoryBtn: document.getElementById('add-category-btn'), // Botón para abrir modal de categoría
        addImageBtn: document.getElementById('add-image-btn'),     // Botón para abrir modal de imagen
        filterButtonsContainer: document.querySelector('.filter-buttons'), // Contenedor de botones de filtro
        currentFilter: 'all',

        init() {
            this.loadCategories(); // Cargar categorías guardadas al inicio
            this.setupEventListeners();
            this.applyFilterAndSearch(); // Aplicar filtro inicial
        },

        setupEventListeners() {
            this.filterButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.currentFilter = e.target.closest('.filter-btn').dataset.filter;
                    this.applyFilterAndSearch();
                });
            });
            if (this.searchInput) {
                 this.searchInput.addEventListener('input', () => this.applyFilterAndSearch());
            }
             // Listeners para abrir modales se añaden en categoryModal.init y imageUploadModal.init
        },

        applyFilterAndSearch() {
            const query = this.searchInput ? this.searchInput.value.toLowerCase() : '';
            let hasVisibleItems = false;

             // Actualizar botón activo
            this.filterButtons.forEach(btn => {
                 btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
            });

            carousel.items.forEach((item) => {
                const category = item.dataset.category || '';
                const title = item.dataset.title || '';
                const description = item.querySelector('p')?.textContent.toLowerCase() || '';

                const filterMatch = this.currentFilter === 'all' || category === this.currentFilter;
                const searchMatch = query === '' || title.includes(query) || description.includes(query);

                if (filterMatch && searchMatch) {
                    item.classList.remove('filtered-out');
                    item.style.display = 'none'; // Será 'flex' si es el activo
                    hasVisibleItems = true;
                } else {
                    item.classList.add('filtered-out');
                    item.style.display = 'none';
                    item.classList.remove('active');
                }
            });

             // Volver a mostrar el primer slide visible si hay alguno
            if (hasVisibleItems) {
                 carousel.showSlide(carousel.currentIndex); // Llama a showSlide para manejar la lógica de visibilidad
            } else {
                 carousel.showSlide(-1); // Indicar que no hay nada que mostrar
            }
            carousel.updateIndicatorActiveState(); // Actualizar indicadores
        },

        addCategoryButton(name, filterValue, iconClass = 'fas fa-tag') {
            if (!this.filterButtonsContainer || !this.addCategoryBtn) return;

             // Evitar duplicados
             if (document.querySelector(`.filter-btn[data-filter="${filterValue}"]`)) {
                 console.warn(`La categoría "${filterValue}" ya existe.`);
                 return;
             }

            const newButton = document.createElement('button');
            newButton.className = 'filter-btn';
            newButton.dataset.filter = filterValue;
            newButton.innerHTML = `<i class="${iconClass}"></i> ${name}`;

            newButton.addEventListener('click', (e) => {
                this.currentFilter = filterValue;
                this.applyFilterAndSearch();
            });

             // Insertar antes del botón "+"
            this.filterButtonsContainer.insertBefore(newButton, this.addCategoryBtn);

             // Actualizar la lista de botones para futuros eventos
            this.filterButtons = document.querySelectorAll('.filter-btn:not(.add-category-btn)');

            this.saveCategories(); // Guardar categorías actualizadas
        },

        saveCategories() {
            const categories = [];
            document.querySelectorAll('.filter-btn:not([data-filter="all"]):not(.add-category-btn)').forEach(btn => {
                categories.push({
                    name: btn.textContent.trim(),
                    filter: btn.dataset.filter,
                    icon: btn.querySelector('i')?.className || 'fas fa-tag'
                });
            });
            localStorage.setItem('customCategories', JSON.stringify(categories));
        },

        loadCategories() {
            const saved = localStorage.getItem('customCategories');
            if (saved) {
                const categories = JSON.parse(saved);
                categories.forEach(cat => this.addCategoryButton(cat.name, cat.filter, cat.icon));
            }
             // Actualizar lista de botones después de cargar
             this.filterButtons = document.querySelectorAll('.filter-btn:not(.add-category-btn)');
        }
    };

    // === MODAL DE CATEGORÍAS ===
    const categoryModal = {
        modal: document.getElementById('categoryModal'),
        form: document.getElementById('category-form'),
        addButton: document.getElementById('add-category-btn'),
        cancelButton: document.getElementById('cancel-category'),
        closeButton: document.querySelector('#categoryModal .category-close'), // Selector específico

        init() {
            if (!this.modal || !this.form || !this.addButton || !this.cancelButton || !this.closeButton) {
                console.warn("Elementos del modal de categoría no encontrados.");
                return;
            }
            this.setupEventListeners();
        },

        setupEventListeners() {
            this.addButton.addEventListener('click', () => this.open());
            this.cancelButton.addEventListener('click', () => this.close());
            this.closeButton.addEventListener('click', () => this.close());
            this.modal.addEventListener('click', (e) => { if (e.target === this.modal) this.close(); });
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        },

        open() { this.modal.style.display = 'block'; },
        close() { this.modal.style.display = 'none'; this.form.reset(); },

        handleSubmit(e) {
            e.preventDefault();
            const nameInput = document.getElementById('category-name');
            const iconSelect = document.getElementById('category-icon');
            const name = nameInput?.value.trim();
            const icon = iconSelect?.value || 'fas fa-tag';
            const filterValue = name.toLowerCase().replace(/\s+/g, '-'); // Crear valor de filtro

            if (!name) { alert('Ingresa un nombre para la categoría.'); return; }

            galleryFilters.addCategoryButton(name, filterValue, icon);
            this.close();
            // Actualizar opciones en el modal de imagen
            imageUploadModal.updateCategoryOptions();
        }
    };

     // === MODAL DE SUBIR IMÁGENES ===
    const imageUploadModal = {
        modal: document.getElementById('imageUploadModal'),
        form: document.getElementById('image-upload-form'),
        addButton: document.getElementById('add-image-btn'),
        cancelButton: document.getElementById('cancel-image'),
        closeButton: document.querySelector('#imageUploadModal .image-upload-close'), // Selector específico
        fileInput: document.getElementById('image-file'),
        fileInfo: document.getElementById('file-info'),
        categorySelect: document.getElementById('image-category'),

        init() {
            if (!this.modal || !this.form || !this.addButton || !this.cancelButton || !this.closeButton || !this.fileInput || !this.categorySelect) {
                 console.warn("Elementos del modal de imagen no encontrados.");
                 return;
            }
            this.setupEventListeners();
        },

        setupEventListeners() {
            this.addButton.addEventListener('click', () => this.open());
            this.cancelButton.addEventListener('click', () => this.close());
            this.closeButton.addEventListener('click', () => this.close());
            this.modal.addEventListener('click', (e) => { if (e.target === this.modal) this.close(); });
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        },

        open() {
            this.updateCategoryOptions();
            this.modal.style.display = 'block';
        },

        close() {
            this.modal.style.display = 'none';
            this.form.reset();
            if (this.fileInfo) this.fileInfo.style.display = 'none';
        },

        updateCategoryOptions() {
            // Guardar opción seleccionada si existe
            const selectedValue = this.categorySelect.value;
            // Limpiar opciones (excepto la primera)
            while (this.categorySelect.options.length > 1) {
                this.categorySelect.remove(1);
            }
            // Añadir opciones desde los botones de filtro
             document.querySelectorAll('.filter-btn:not([data-filter="all"]):not(.add-category-btn)').forEach(btn => {
                const option = document.createElement('option');
                option.value = btn.dataset.filter;
                option.textContent = btn.textContent.trim();
                this.categorySelect.appendChild(option);
            });
             // Restaurar selección si es posible
             this.categorySelect.value = selectedValue;
        },

        handleFileSelect(e) {
            const file = e.target.files[0];
            const fileNameEl = document.getElementById('file-name');
            const fileSizeEl = document.getElementById('file-size');
            if (file && this.fileInfo && fileNameEl && fileSizeEl) {
                fileNameEl.textContent = `Archivo: ${file.name}`;
                fileSizeEl.textContent = `Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
                this.fileInfo.style.display = 'block';
                // Añadir validaciones si es necesario
            } else if(this.fileInfo){
                this.fileInfo.style.display = 'none';
            }
        },

        handleSubmit(e) {
            e.preventDefault();
            const titleInput = document.getElementById('image-title');
            const descriptionInput = document.getElementById('image-description');

            const file = this.fileInput.files[0];
            const title = titleInput?.value.trim();
            const description = descriptionInput?.value.trim();
            const category = this.categorySelect.value;

            if (!file || !title || !description || !category) {
                alert('Por favor, completa todos los campos.');
                return;
            }

            const imageUrl = URL.createObjectURL(file); // URL temporal
            this.addImageToDOM(imageUrl, title, description, category);
            this.close();
            alert('Imagen agregada localmente (no se guarda permanentemente).');
        },

        addImageToDOM(imageUrl, title, description, category) {
            if (!carousel.track || !carousel.indicatorsContainer) return;

            const newItem = document.createElement('div');
            newItem.className = 'carousel-item';
            newItem.dataset.category = category;
            newItem.dataset.title = title.toLowerCase();
            newItem.style.display = 'none'; // Oculto inicialmente
            newItem.innerHTML = `
                <img src="${imageUrl}" alt="${description}">
                <div class="carousel-caption">
                    <h3>${title}</h3>
                    <p>${description}</p>
                </div>
            `;
            carousel.track.appendChild(newItem);

             // Re-inicializar/actualizar carrusel y filtros
            carousel.updateItemsAndIndicators(); // Actualiza items y crea indicadores
            galleryFilters.applyFilterAndSearch(); // Reaplica filtros
            carousel.goToSlide(carousel.items.length - 1); // Ir al nuevo slide
        }
    };

    // === MODAL PARA VER IMAGEN EN GRANDE ===
    const imageModal = {
         modal: document.getElementById('imageModal'),
         modalImage: document.getElementById('modalImage'),
         modalTitle: document.getElementById('modalTitle'),
         modalDescription: document.getElementById('modalDescription'),
         closeBtn: document.querySelector('#imageModal .close'), // Selector específico

         init() {
             if (!this.modal || !this.modalImage || !this.modalTitle || !this.modalDescription || !this.closeBtn) {
                 console.warn("Elementos del modal de visualización no encontrados.");
                 return;
             }
             this.setupEventListeners();
         },

        setupEventListeners() {
             this.closeBtn.addEventListener('click', () => this.close());
             this.modal.addEventListener('click', (e) => { if (e.target === this.modal) this.close(); });

             // Añadir listeners a las imágenes existentes y futuras (delegación podría ser mejor)
             this.addClickListenersToImages();
         },

         addClickListenersToImages() {
              // Remover listeners antiguos para evitar duplicados si se llama de nuevo
             document.querySelectorAll('.carousel-item img').forEach(img => {
                 img.removeEventListener('click', this.handleImageClick); // Remover listener anterior si existe
                 img.addEventListener('click', this.handleImageClick.bind(this)); // Añadir nuevo listener
             });
         },

          // Usar una función nombrada para poder removerla
         handleImageClick(event) {
             this.open(event.currentTarget);
         },


         open(imgElement) {
            const item = imgElement.closest('.carousel-item');
            if (!item) return;

            this.modalImage.src = imgElement.src;
            this.modalImage.alt = imgElement.alt;
            this.modalTitle.textContent = item.querySelector('h3')?.textContent || 'Sin Título';
            this.modalDescription.textContent = item.querySelector('p')?.textContent || 'Sin Descripción';
            this.modal.style.display = 'block';
         },

         close() {
             this.modal.style.display = 'none';
         }
    };


    // --- INICIALIZACIÓN GENERAL ---
    function initApp() {
        carousel.init();
        navigation.init();
        darkMode.init();
        galleryFilters.init();
        categoryModal.init();
        imageUploadModal.init();
        imageModal.init(); // Inicializar modal de visualización

        console.log("Portafolio inicializado.");
    }

    initApp(); // Ejecutar inicialización

}); // Fin DOMContentLoaded