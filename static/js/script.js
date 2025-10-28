document.addEventListener('DOMContentLoaded', function() {

    /**
     * @file script.js
     * @description Contiene toda la lógica de cliente para el portafolio interactivo.
     * Gestiona el carrusel de imágenes, la navegación, el modo oscuro, los filtros de la galería,
     * y los modales para añadir categorías e imágenes.
     */

    /**
     * Objeto `carousel`
     * @description Gestiona la funcionalidad del carrusel de imágenes, incluyendo la navegación,
     * los indicadores, la reproducción automática y la actualización dinámica de los ítems.
     */
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

        /**
         * @method init
         * @description Inicializa el carrusel, configura los listeners y comienza la reproducción automática.
         */
        init() {
            if (!this.track) {
                console.warn("Elemento .carousel-track no encontrado.");
                return;
            }
            this.updateItemsAndIndicators();
            if (this.items.length === 0) {
                 console.log("No hay items iniciales en el carrusel.");
            }
            this.setupEventListeners();
             if (this.items.length > 0) {
                this.showSlide(0);
             }
            this.startAutoPlay();
        },

        /**
         * @method updateItemsAndIndicators
         * @description Actualiza la lista de ítems y regenera los indicadores del carrusel.
         * Esencial para cuando se añaden o eliminan imágenes dinámicamente.
         */
        updateItemsAndIndicators() {
            this.items = document.querySelectorAll('.carousel-item');
            this.indicators = [];
            if (this.indicatorsContainer) this.indicatorsContainer.innerHTML = '';

            this.items.forEach((item, index) => {
                item.classList.remove('active', 'filtered-out');
                item.style.display = 'none';

                if (this.indicatorsContainer) {
                    const indicator = document.createElement('span');
                    indicator.className = 'indicator';
                    indicator.dataset.slide = index;
                    indicator.addEventListener('click', () => this.goToSlide(index));
                    this.indicatorsContainer.appendChild(indicator);
                    this.indicators.push(indicator);
                }
            });
             if (this.items.length === 0) {
                 this.currentIndex = -1;
             }
        },

        /**
         * @method setupEventListeners
         * @description Configura los listeners para los botones de navegación y el hover del carrusel.
         */
        setupEventListeners() {
            if (this.leftBtn) this.leftBtn.addEventListener('click', () => this.previousSlide());
            if (this.rightBtn) this.rightBtn.addEventListener('click', () => this.nextSlide());
            if (this.track) {
                this.track.addEventListener('mouseenter', () => this.stopAutoPlay());
                this.track.addEventListener('mouseleave', () => this.startAutoPlay());
            }
        },

        /**
         * @method showSlide
         * @description Muestra un slide específico del carrusel según su índice.
         * @param {number} index - El índice del slide a mostrar.
         */
        showSlide(index) {
            const visibleItems = Array.from(this.items).filter(item => !item.classList.contains('filtered-out'));

            if (visibleItems.length === 0) {
                 this.currentIndex = -1;
                 this.items.forEach(item => {
                    item.style.display = 'none';
                    item.classList.remove('active');
                 });
                 this.updateIndicatorActiveState();
                 return;
            }

            let targetIndex = index;
            let targetItem = this.items[targetIndex];

            if (targetIndex < 0 || targetIndex >= this.items.length || targetItem?.classList.contains('filtered-out')) {
                const firstVisibleItem = visibleItems[0];
                targetIndex = Array.from(this.items).indexOf(firstVisibleItem);
                targetItem = this.items[targetIndex];
            }

            this.items.forEach(item => {
                item.classList.remove('active');
                if (!item.classList.contains('filtered-out')) {
                     item.style.display = 'none';
                }
            });

            if (targetItem) {
                targetItem.classList.add('active');
                targetItem.style.display = 'flex';
            }

            this.currentIndex = targetIndex;
            this.updateIndicatorActiveState();
        },

        /**
         * @method updateIndicatorActiveState
         * @description Actualiza el estado visual de los indicadores para reflejar el slide actual.
         */
        updateIndicatorActiveState() {
             this.indicators.forEach((indicator, i) => {
                const item = this.items[i];
                indicator.style.display = item && !item.classList.contains('filtered-out') ? 'inline-block' : 'none';
                indicator.classList.toggle('active', i === this.currentIndex);
            });
        },

        /**
         * @method nextSlide
         * @description Avanza al siguiente slide visible en el carrusel.
         */
        nextSlide() {
            const visibleItems = Array.from(this.items).filter(item => !item.classList.contains('filtered-out'));
            if (visibleItems.length <= 1) return;

            let currentVisibleIndex = visibleItems.findIndex(item => Array.from(this.items).indexOf(item) === this.currentIndex);
             if (currentVisibleIndex === -1 && visibleItems.length > 0) {
                 currentVisibleIndex = 0;
             } else if (visibleItems.length === 0) {
                 return;
             }

            const nextVisibleIndex = (currentVisibleIndex + 1) % visibleItems.length;
            const nextItem = visibleItems[nextVisibleIndex];
            const nextGlobalIndex = Array.from(this.items).indexOf(nextItem);
            this.showSlide(nextGlobalIndex);
        },

        /**
         * @method previousSlide
         * @description Retrocede al slide visible anterior en el carrusel.
         */
        previousSlide() {
            const visibleItems = Array.from(this.items).filter(item => !item.classList.contains('filtered-out'));
             if (visibleItems.length <= 1) return;

             let currentVisibleIndex = visibleItems.findIndex(item => Array.from(this.items).indexOf(item) === this.currentIndex);
              if (currentVisibleIndex === -1 && visibleItems.length > 0) {
                 currentVisibleIndex = 0;
                 currentVisibleIndex = visibleItems.length -1;
             } else if (visibleItems.length === 0) {
                 return;
             }

            const prevVisibleIndex = (currentVisibleIndex - 1 + visibleItems.length) % visibleItems.length;
            const prevItem = visibleItems[prevVisibleIndex];
            const prevGlobalIndex = Array.from(this.items).indexOf(prevItem);
            this.showSlide(prevGlobalIndex);
        },

        /**
         * @method goToSlide
         * @description Salta a un slide específico si es un índice válido y visible.
         * @param {number} index - El índice del slide al que se quiere saltar.
         */
        goToSlide(index) {
             if (index >= 0 && index < this.items.length && this.items[index] && !this.items[index].classList.contains('filtered-out')) {
                this.showSlide(index);
             } else {
                 console.warn("Intentando ir a un slide inválido o filtrado.");
             }
        },

        /**
         * @method startAutoPlay
         * @description Inicia la reproducción automática del carrusel.
         */
        startAutoPlay() {
            this.stopAutoPlay();
            if (this.items.length > 1) {
               this.autoPlayInterval = setInterval(() => this.nextSlide(), this.autoPlayDelay);
            }
        },

        /**
         * @method stopAutoPlay
         * @description Detiene la reproducción automática del carrusel.
         */
        stopAutoPlay() {
            if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    };

    /**
     * Objeto `navigation`
     * @description Gestiona la navegación de la página, incluyendo el scroll suave
     * y el "scroll spy" para resaltar el enlace activo en la barra de navegación.
     */
    const navigation = {
        /**
         * @method init
         * @description Inicializa las funcionalidades de navegación.
         */
        init() {
            this.setupSmoothScroll();
            this.setupScrollSpy();
        },

        /**
         * @method setupSmoothScroll
         * @description Configura el desplazamiento suave para los enlaces del menú de navegación.
         */
        setupSmoothScroll() {
            document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                         const offsetTop = targetElement.offsetTop - (document.querySelector('nav')?.offsetHeight || 0);
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                        document.querySelector('nav ul')?.classList.remove('active');
                    }
                });
            });
        },

        /**
         * @method setupScrollSpy
         * @description Configura un IntersectionObserver para resaltar automáticamente el enlace
         * de navegación correspondiente a la sección visible en la pantalla.
         */
        setupScrollSpy() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('nav a');
            if (navLinks.length === 0 || sections.length === 0) return;

            const observerOptions = {
                 root: null,
                 rootMargin: `-${(document.querySelector('nav')?.offsetHeight || 50) + 10}px 0px -60% 0px`,
                 threshold: 0
             };

            const observer = new IntersectionObserver(entries => {
                let activeSectionId = null;

                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        activeSectionId = entry.target.id;
                    }
                });

                 if (!activeSectionId && window.scrollY < window.innerHeight / 2) {
                     activeSectionId = 'hero-section';
                 }

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${activeSectionId}`) {
                        link.classList.add('active');
                    }
                });

            }, observerOptions);

            sections.forEach(section => observer.observe(section));
        }
    };

    /**
     * Objeto `darkMode`
     * @description Gestiona la funcionalidad del modo oscuro, permitiendo al usuario
     * cambiar el tema y guardando la preferencia en localStorage.
     */
    const darkMode = {
        /**
         * @method init
         * @description Inicializa el modo oscuro, cargando el tema guardado y configurando el botón de cambio.
         */
        init() {
            this.themeToggle = document.getElementById('theme-toggle');
            if (this.themeToggle) {
                this.themeToggle.addEventListener('click', () => this.toggleTheme());
            }
            this.loadTheme();
        },
        /**
         * @method toggleTheme
         * @description Cambia entre el tema claro y oscuro.
         */
        toggleTheme() {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        },
        /**
         * @method setTheme
         * @description Aplica un tema específico al `body` y actualiza el icono correspondiente.
         * @param {string} theme - El tema a aplicar ('light' o 'dark').
         */
        setTheme(theme) {
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            const icon = this.themeToggle?.querySelector('i');
            if(icon) {
               icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        },
        /**
         * @method loadTheme
         * @description Carga el tema desde localStorage o prefiere el tema del sistema si no hay uno guardado.
         */
        loadTheme() {
            const savedTheme = localStorage.getItem('theme');
             const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const defaultTheme = savedTheme || (prefersDark ? 'dark' : 'light');
            this.setTheme(defaultTheme);
        }
    };

    /**
     * Objeto `galleryFilters`
     * @description Gestiona el filtrado y la búsqueda de imágenes en la galería.
     * También maneja la adición y persistencia de categorías personalizadas.
     */
    const galleryFilters = {
        filterButtons: [],
        searchInput: document.getElementById('search-input'),
        addCategoryBtn: document.getElementById('add-category-btn'),
        addImageBtn: document.getElementById('add-image-btn'),
        filterButtonsContainer: document.querySelector('.filter-buttons'),
        currentFilter: 'all',

        /**
         * @method init
         * @description Inicializa los filtros, cargando categorías y configurando listeners.
         */
        init() {
            this.loadCategories();
            this.setupEventListeners();
            this.applyFilterAndSearch();
        },

        /**
         * @method setupEventListeners
         * @description Configura los listeners para los botones de filtro y el campo de búsqueda.
         */
        setupEventListeners() {
            this.filterButtons = document.querySelectorAll('.filter-btn:not(.add-category-btn)');
            this.filterButtons.forEach(btn => {
                const oldListener = btn._filterClickListener;
                if (oldListener) {
                    btn.removeEventListener('click', oldListener);
                }
                 const newListener = this.handleFilterClick.bind(this);
                 btn.addEventListener('click', newListener);
                 btn._filterClickListener = newListener;
            });

            if (this.searchInput) {
                 this.searchInput.addEventListener('input', () => this.applyFilterAndSearch());
            }
        },

        /**
         * @method handleFilterClick
         * @description Maneja el evento de clic en un botón de filtro.
         * @param {Event} e - El objeto del evento.
         */
        handleFilterClick(e) {
            const clickedButton = e.target.closest('.filter-btn');
            if (!clickedButton) return;
            this.currentFilter = clickedButton.dataset.filter;
            this.applyFilterAndSearch();
        },

        /**
         * @method applyFilterAndSearch
         * @description Aplica el filtro de categoría y el término de búsqueda actuales
         * a los ítems del carrusel, mostrando u ocultando según corresponda.
         */
        applyFilterAndSearch() {
            const query = this.searchInput ? this.searchInput.value.toLowerCase() : '';
            let hasVisibleItems = false;

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
                    hasVisibleItems = true;
                } else {
                    item.classList.add('filtered-out');
                    item.style.display = 'none';
                    item.classList.remove('active');
                }
            });

             if (hasVisibleItems) {
                 const currentItemStillVisible = carousel.items[carousel.currentIndex] && !carousel.items[carousel.currentIndex].classList.contains('filtered-out');
                 carousel.showSlide(currentItemStillVisible ? carousel.currentIndex : -1);
             } else {
                 carousel.showSlide(-1);
             }
        },

        /**
         * @method addCategoryButton
         * @description Añade un nuevo botón de categoría al DOM y guarda el estado.
         * @param {string} name - El nombre de la categoría para mostrar.
         * @param {string} filterValue - El valor del filtro (data-filter).
         * @param {string} [iconClass='fas fa-tag'] - La clase del icono para la categoría.
         */
        addCategoryButton(name, filterValue, iconClass = 'fas fa-tag') {
             if (!this.filterButtonsContainer || !this.addCategoryBtn) return;
             if (document.querySelector(`.filter-btn[data-filter="${filterValue}"]`)) return;

            const newButton = document.createElement('button');
            newButton.className = 'filter-btn';
            newButton.dataset.filter = filterValue;
            newButton.innerHTML = `<i class="${iconClass}"></i> ${name}`;

            this.filterButtonsContainer.insertBefore(newButton, this.addCategoryBtn);

            this.setupEventListeners();

            this.saveCategories();
        },

        /**
         * @method saveCategories
         * @description Guarda las categorías personalizadas en localStorage.
         */
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

        /**
         * @method loadCategories
         * @description Carga las categorías personalizadas desde localStorage y las añade al DOM.
         */
        loadCategories() {
            const saved = localStorage.getItem('customCategories');
            if (saved) {
                try {
                    const categories = JSON.parse(saved);
                    if (Array.isArray(categories)) {
                       categories.forEach(cat => {
                           if (!this.filterButtonsContainer || !this.addCategoryBtn) return;
                           if (document.querySelector(`.filter-btn[data-filter="${cat.filter}"]`)) return;
                           const newButton = document.createElement('button');
                           newButton.className = 'filter-btn';
                           newButton.dataset.filter = cat.filter;
                           newButton.innerHTML = `<i class="${cat.icon || 'fas fa-tag'}"></i> ${cat.name}`;
                           this.filterButtonsContainer.insertBefore(newButton, this.addCategoryBtn);
                       });
                    }
                } catch (e) {
                    console.error("Error al cargar categorías:", e);
                    localStorage.removeItem('customCategories');
                }
            }
        }
    };

    /**
     * Objeto `categoryModal`
     * @description Gestiona la funcionalidad del modal para añadir nuevas categorías.
     */
    const categoryModal = {
        modal: document.getElementById('categoryModal'),
        form: document.getElementById('category-form'),
        addButton: document.getElementById('add-category-btn'),
        cancelButton: document.getElementById('cancel-category'),
        closeButton: document.querySelector('#categoryModal .category-close'),

        /**
         * @method init
         * @description Inicializa el modal de categorías y sus listeners.
         */
        init() {
            if (!this.modal || !this.form || !this.addButton || !this.cancelButton || !this.closeButton) return;
            this.setupEventListeners();
        },
        /**
         * @method setupEventListeners
         * @description Configura los listeners para abrir, cerrar y enviar el formulario del modal.
         */
        setupEventListeners() {
            this.addButton.addEventListener('click', () => this.open());
            this.cancelButton.addEventListener('click', () => this.close());
            this.closeButton.addEventListener('click', () => this.close());
            this.modal.addEventListener('click', (e) => { if (e.target === this.modal) this.close(); });
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        },
        /** @method open @description Abre el modal. */
        open() { this.modal.style.display = 'block'; document.getElementById('category-name')?.focus(); },
        /** @method close @description Cierra el modal y resetea el formulario. */
        close() { this.modal.style.display = 'none'; this.form.reset(); },
        /**
         * @method handleSubmit
         * @description Procesa el envío del formulario para añadir una nueva categoría.
         * @param {Event} e - El objeto del evento submit.
         */
        handleSubmit(e) {
            e.preventDefault();
            const nameInput = document.getElementById('category-name');
            const iconSelect = document.getElementById('category-icon');
            const name = nameInput?.value.trim();
            const icon = iconSelect?.value || 'fas fa-tag';
            const filterValue = name.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');

            if (!name) { alert('Ingresa un nombre para la categoría.'); return; }
            if (!filterValue) { alert('Nombre inválido para filtro.'); return;}

            galleryFilters.addCategoryButton(name, filterValue, icon);
            this.close();
            imageUploadModal.updateCategoryOptions();
        }
    };

    /**
     * Objeto `imageUploadModal`
     * @description Gestiona el modal para subir nuevas imágenes, incluyendo la validación
     * de archivos y la comunicación con el backend.
     */
    const imageUploadModal = {
        modal: document.getElementById('imageUploadModal'),
        form: document.getElementById('image-upload-form'),
        addButton: document.getElementById('add-image-btn'),
        cancelButton: document.getElementById('cancel-image'),
        closeButton: document.querySelector('#imageUploadModal .image-upload-close'),
        fileInput: document.getElementById('image-file'),
        fileInfo: document.getElementById('file-info'),
        categorySelect: document.getElementById('image-category'),

        /** @method init @description Inicializa el modal de subida de imágenes. */
        init() {
            if (!this.modal || !this.form || !this.addButton || !this.cancelButton || !this.closeButton || !this.fileInput || !this.categorySelect) return;
            this.setupEventListeners();
        },
        /** @method setupEventListeners @description Configura los listeners del modal. */
        setupEventListeners() {
            this.addButton.addEventListener('click', () => this.open());
            this.cancelButton.addEventListener('click', () => this.close());
            this.closeButton.addEventListener('click', () => this.close());
            this.modal.addEventListener('click', (e) => { if (e.target === this.modal) this.close(); });
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        },
        /** @method open @description Abre el modal y actualiza las opciones de categoría. */
        open() {
            this.updateCategoryOptions();
            this.modal.style.display = 'block';
            document.getElementById('image-title')?.focus();
        },
        /** @method close @description Cierra el modal y resetea su estado. */
        close() {
            this.modal.style.display = 'none';
            this.form.reset();
            if (this.fileInfo) this.fileInfo.style.display = 'none';
        },
        /** @method updateCategoryOptions @description Actualiza el `select` de categorías con las disponibles. */
        updateCategoryOptions() {
            const selectedValue = this.categorySelect.value;
            while (this.categorySelect.options.length > 1) this.categorySelect.remove(1);
            document.querySelectorAll('.filter-btn:not([data-filter="all"]):not(.add-category-btn)').forEach(btn => {
                const option = document.createElement('option');
                option.value = btn.dataset.filter;
                option.textContent = btn.textContent.trim();
                this.categorySelect.appendChild(option);
            });
            this.categorySelect.value = selectedValue;
        },
        /**
         * @method handleFileSelect
         * @description Muestra información sobre el archivo seleccionado y realiza validaciones básicas.
         * @param {Event} e - El evento `change` del input de archivo.
         */
        handleFileSelect(e) {
            const file = e.target.files[0];
            const fileNameEl = document.getElementById('file-name');
            const fileSizeEl = document.getElementById('file-size');
            if (file && this.fileInfo && fileNameEl && fileSizeEl) {
                fileNameEl.textContent = `Archivo: ${file.name}`;
                fileSizeEl.textContent = `Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
                this.fileInfo.style.display = 'block';
                 if (!file.type.startsWith('image/')) { alert('Archivo no válido.'); e.target.value = ''; this.fileInfo.style.display = 'none'; return; }
                 if (file.size > 10 * 1024 * 1024) { alert('Archivo muy grande (Máx 10MB).'); e.target.value = ''; this.fileInfo.style.display = 'none'; return; }
            } else if(this.fileInfo) { this.fileInfo.style.display = 'none'; }
        },

        /**
         * @method handleSubmit
         * @description Procesa el envío del formulario de subida, construye un `FormData`
         * y lo envía al backend mediante `fetch`.
         * @param {Event} e - El evento `submit` del formulario.
         */
        handleSubmit(e) {
            e.preventDefault();
            const fileInput = document.getElementById('image-file');
            const titleInput = document.getElementById('image-title');
            const descriptionInput = document.getElementById('image-description');
            const categorySelect = document.getElementById('image-category');

            if (!fileInput?.files || fileInput.files.length === 0) { alert('Selecciona imagen.'); return; }
            const file = fileInput.files[0];
            const title = titleInput?.value.trim();
            const description = descriptionInput?.value.trim();
            const category = categorySelect?.value;
            if (!title || !description || !category) { alert('Completa todos los campos.'); return; }
            if (!file.type.startsWith('image/')) { alert('Archivo no válido.'); return; }
            if (file.size > 10 * 1024 * 1024) { alert('Archivo muy grande.'); return; }

            const formData = new FormData();
            formData.append('image-file', file);
            formData.append('image-title', title);
            formData.append('image-description', description);
            formData.append('image-category', category);

            fetch('/upload-image', { method: 'POST', body: formData })
            .then(response => response.text().then(text => ({ ok: response.ok, status: response.status, text: text })))
            .then(({ ok, status, text }) => {
                if (ok) {
                    console.log('Server response:', text);
                    const match = text.match(/guardada como '([^']+)'/);
                    const newFilename = match ? match[1] : 'nueva_imagen_error.jpg';

                    alert('¡Imagen subida!');
                    const tempImageUrl = URL.createObjectURL(file);
                    this.addImageToDOM(tempImageUrl, title, description, category, newFilename);
                    this.close();
                } else {
                    console.error('Server Error:', status, text);
                    alert(`Error al subir: ${text}`);
                }
            })
            .catch(error => {
                console.error('Network error:', error);
                alert('Error de conexión al subir.');
            });
        },

        /**
         * @method addImageToDOM
         * @description Añade un nuevo ítem de imagen al carrusel en el DOM.
         * @param {string} imageUrl - La URL de la imagen (puede ser una URL temporal).
         * @param {string} title - El título de la imagen.
         * @param {string} description - La descripción de la imagen.
         * @param {string} category - La categoría de la imagen.
         * @param {string} filename - El nombre del archivo guardado en el servidor.
         */
        addImageToDOM(imageUrl, title, description, category, filename) {
            if (!carousel.track || !carousel.indicatorsContainer) return;

            const newItem = document.createElement('div');
            newItem.className = 'carousel-item';
            newItem.dataset.category = category;
            newItem.dataset.title = title.toLowerCase();
            newItem.dataset.filename = filename;
            newItem.style.display = 'none';
            newItem.innerHTML = `
                <img src="${imageUrl}" alt="${description}">
                <button class="delete-image-btn" aria-label="Eliminar imagen" title="Eliminar imagen">
                    <i class="fas fa-trash-alt"></i>
                </button>
                <div class="carousel-caption">
                    <h3>${title}</h3>
                    <p>${description}</p>
                </div>
            `;
            const newImg = newItem.querySelector('img');
            if (newImg) newImg.addEventListener('click', () => imageModal.open(newImg));

            const deleteBtn = newItem.querySelector('.delete-image-btn');
            if (deleteBtn) deleteBtn.addEventListener('click', handleDeleteImageClick);

            carousel.track.appendChild(newItem);

            carousel.updateItemsAndIndicators();
            galleryFilters.applyFilterAndSearch();
             if (carousel.items.length > 0) {
                carousel.goToSlide(carousel.items.length - 1);
             }

            imageModal.addClickListenersToImages();
        }
    };

    /**
     * Objeto `imageModal`
     * @description Gestiona el modal que muestra una imagen en tamaño grande.
     */
    const imageModal = {
         modal: document.getElementById('imageModal'),
         modalImage: document.getElementById('modalImage'),
         modalTitle: document.getElementById('modalTitle'),
         modalDescription: document.getElementById('modalDescription'),
         closeBtn: document.querySelector('#imageModal .close'),

         /** @method init @description Inicializa el modal de visualización de imagen. */
         init() {
             if (!this.modal || !this.modalImage || !this.modalTitle || !this.modalDescription || !this.closeBtn) return;
             this.setupEventListeners();
         },
        /** @method setupEventListeners @description Configura los listeners para abrir y cerrar el modal. */
        setupEventListeners() {
             this.closeBtn.addEventListener('click', () => this.close());
             this.modal.addEventListener('click', (e) => { if (e.target === this.modal) this.close(); });
             this.addClickListenersToImages();
         },
         /** @method addClickListenersToImages @description Añade listeners de clic a todas las imágenes del carrusel. */
         addClickListenersToImages() {
             document.querySelectorAll('.carousel-item img').forEach(img => {
                 if (!img._imageModalListenerAdded) {
                      img.addEventListener('click', this.handleImageClick.bind(this));
                      img._imageModalListenerAdded = true;
                 }
             });
         },
         /**
          * @method handleImageClick
          * @description Maneja el clic en una imagen del carrusel para abrir el modal.
          * @param {Event} event - El evento de clic.
          */
         handleImageClick(event) { this.open(event.currentTarget); },
         /**
          * @method open
          * @description Abre el modal y muestra la imagen y su información.
          * @param {HTMLImageElement} imgElement - El elemento de la imagen que se ha clickeado.
          */
         open(imgElement) {
            const item = imgElement.closest('.carousel-item');
            if (!item) return;
            this.modalImage.src = imgElement.src;
            this.modalImage.alt = imgElement.alt;
            this.modalTitle.textContent = item.querySelector('h3')?.textContent || 'Sin Título';
            this.modalDescription.textContent = item.querySelector('p')?.textContent || '';
            this.modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
         },
         /** @method close @description Cierra el modal. */
         close() {
             this.modal.style.display = 'none';
             document.body.style.overflow = '';
         }
    };

    /**
     * @function handleDeleteImageClick
     * @description Maneja el evento de clic en el botón de eliminar una imagen.
     * Pide confirmación y, si se acepta, elimina el ítem del DOM y envía una petición
     * al backend para eliminar el archivo físico.
     * @param {Event} event - El evento de clic.
     */
    function handleDeleteImageClick(event) {
        const button = event.currentTarget;
        const itemToDelete = button.closest('.carousel-item');
        if (!itemToDelete) return;

        const filename = itemToDelete.dataset.filename;
        const title = itemToDelete.dataset.title || filename;

        if (!filename) {
            alert("Error: No se encontró el nombre del archivo para eliminar.");
            return;
        }

        if (window.confirm(`¿Eliminar la imagen "${title}"?`)) {
            removeCarouselItem(itemToDelete);

            console.log(`Enviando petición para eliminar: ${filename}`);
            fetch('/delete-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: filename })
            })
            .then(response => response.json().then(data => ({ ok: response.ok, data })))
            .then(({ ok, data }) => {
                if (ok && data.success) {
                    console.log('Imagen eliminada del servidor:', filename);
                } else {
                    console.error('Error al eliminar del servidor:', data.message || 'Error desconocido');
                    alert('Error al eliminar la imagen del servidor: ' + (data.message || 'Intenta de nuevo'));
                }
            })
            .catch(error => {
                console.error('Error de red al eliminar:', error);
                alert('Error de conexión al intentar eliminar la imagen.');
            });
        }
    }

    /**
     * @function removeCarouselItem
     * @description Elimina un ítem del carrusel del DOM y recalcula el estado del carrusel.
     * @param {HTMLElement} itemElement - El elemento del carrusel a eliminar.
     */
    function removeCarouselItem(itemElement) {
        if (!itemElement || !carousel.track) return;

        const indexToRemove = Array.from(carousel.items).indexOf(itemElement);
        if (indexToRemove === -1) return;

        itemElement.remove();

        const wasCurrentIndex = indexToRemove === carousel.currentIndex;
        const oldLength = carousel.items.length;

        carousel.updateItemsAndIndicators();

        let nextIndexToShow = carousel.currentIndex;

        if (carousel.items.length === 0) {
            nextIndexToShow = -1;
        } else if (wasCurrentIndex) {
             nextIndexToShow = Math.min(indexToRemove, carousel.items.length - 1);
        } else if (indexToRemove < carousel.currentIndex) {
            nextIndexToShow = carousel.currentIndex -1;
        }

        carousel.showSlide(nextIndexToShow);
        galleryFilters.applyFilterAndSearch();
    }

    /**
     * @function addInitialDeleteListeners
     * @description Añade los listeners de eliminación a los botones de borrar que existen al cargar la página.
     */
    function addInitialDeleteListeners() {
        document.querySelectorAll('.delete-image-btn').forEach(button => {
             if (!button._deleteListenerAdded) {
                button.addEventListener('click', handleDeleteImageClick);
                button._deleteListenerAdded = true;
             }
        });
    }

    /**
     * @function initApp
     * @description Función principal que inicializa todos los módulos de la aplicación.
     */
    /**
     * Objeto `feedback`
     * @description Gestiona la carga y envío de comentarios.
     */
    const feedback = {
        commentsList: document.getElementById('comments-list'),
        commentForm: document.getElementById('comment-form'),

        /**
         * @method init
         * @description Inicializa el sistema de feedback.
         */
        init() {
            if (!this.commentsList || !this.commentForm) {
                console.warn("Elementos de feedback no encontrados. La funcionalidad de comentarios estará deshabilitada.");
                return;
            }
            this.setupEventListeners();
            this.loadComments();
        },

        /**
         * @method setupEventListeners
         * @description Configura el listener para el envío del formulario de comentarios.
         */
        setupEventListeners() {
            this.commentForm.addEventListener('submit', (e) => this.handleCommentSubmit(e));
        },

        /**
         * @method loadComments
         * @description Carga los comentarios desde la API y los renderiza en la página.
         */
        loadComments() {
            fetch('/api/comments')
                .then(response => {
                    if (!response.ok) throw new Error(`Error HTTP ${response.status} al cargar comentarios.`);
                    return response.json();
                })
                .then(comments => {
                    this.commentsList.innerHTML = ''; // Limpiar la lista actual
                    if (comments && comments.length > 0) {
                        comments.forEach(comment => this.renderComment(comment));
                    } else {
                        this.commentsList.innerHTML = '<p>Aún no hay comentarios. ¡Sé el primero en dejar tu opinión!</p>';
                    }
                })
                .catch(error => {
                    console.error("Error al cargar los comentarios:", error);
                    this.commentsList.innerHTML = '<p class="error-message">No se pudieron cargar los comentarios. Inténtalo de nuevo más tarde.</p>';
                });
        },

        /**
         * @method renderComment
         * @description Crea y añade un elemento de comentario al DOM.
         * @param {object} comment - El objeto del comentario con `author`, `text` y `timestamp`.
         */
        renderComment(comment) {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';

            const author = document.createElement('strong');
            author.className = 'comment-author';
            author.textContent = comment.author;

            const text = document.createElement('p');
            text.className = 'comment-text';
            text.textContent = comment.text;

            const timestamp = document.createElement('span');
            timestamp.className = 'comment-timestamp';
            timestamp.textContent = new Date(comment.timestamp).toLocaleString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            commentElement.appendChild(author);
            commentElement.appendChild(text);
            commentElement.appendChild(timestamp);

            // Insertar el nuevo comentario al principio de la lista
            this.commentsList.insertBefore(commentElement, this.commentsList.firstChild);
        },

        /**
         * @method handleCommentSubmit
         * @description Maneja el envío del formulario de comentarios.
         * @param {Event} e - El objeto del evento submit.
         */
        handleCommentSubmit(e) {
            e.preventDefault();
            const authorInput = document.getElementById('comment-author');
            const textInput = document.getElementById('comment-text');

            const author = authorInput.value.trim();
            const text = textInput.value.trim();

            if (!author || !text) {
                alert('Por favor, completa tu nombre y tu comentario.');
                return;
            }

            const commentData = { author, text };

            fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(commentData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(errorText => {
                        throw new Error(`Error ${response.status}: ${errorText}`);
                    });
                }
                return response.json();
            })
            .then(newComment => {
                // Si la lista mostraba el mensaje de "no hay comentarios", lo limpia
                if (this.commentsList.querySelector('p')) {
                    this.commentsList.innerHTML = '';
                }
                this.renderComment(newComment);
                this.commentForm.reset(); // Limpiar el formulario
            })
            .catch(error => {
                console.error("Error al enviar el comentario:", error);
                alert(`No se pudo enviar tu comentario: ${error.message}`);
            });
        }
    };

    function initApp() {
        carousel.init();
        navigation.init();
        darkMode.init();
        galleryFilters.init();
        categoryModal.init();
        imageUploadModal.init();
        imageModal.init();
        addInitialDeleteListeners();
        feedback.init(); // Inicializar el módulo de feedback

        console.log("Portafolio inicializado con funcionalidad de eliminar y comentarios.");
    }

    initApp();

});