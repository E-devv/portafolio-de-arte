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
            if (!this.track) { // Solo necesitamos el track para empezar
                console.warn("Elemento .carousel-track no encontrado.");
                return;
            }
            this.updateItemsAndIndicators(); // Carga inicial
            if (this.items.length === 0) {
                 console.log("No hay items iniciales en el carrusel.");
                 // Aún así inicializamos listeners por si se añaden luego
            }
            this.setupEventListeners();
             if (this.items.length > 0) {
                this.showSlide(0); // Mostrar el primero si existe
             }
            this.startAutoPlay();
        },

        updateItemsAndIndicators() {
            this.items = document.querySelectorAll('.carousel-item');
            this.indicators = []; // Limpiar array de indicadores
            // Limpiar indicadores existentes en el DOM
            if (this.indicatorsContainer) this.indicatorsContainer.innerHTML = '';

            // Crear nuevos indicadores y asegurar estado inicial de items
            this.items.forEach((item, index) => {
                item.classList.remove('active', 'filtered-out');
                item.style.display = 'none';

                if (this.indicatorsContainer) {
                    const indicator = document.createElement('span');
                    indicator.className = 'indicator';
                    indicator.dataset.slide = index;
                    indicator.addEventListener('click', () => this.goToSlide(index));
                    this.indicatorsContainer.appendChild(indicator);
                    this.indicators.push(indicator); // Añadir al array
                }
            });
             // Si después de actualizar no hay items, resetea el índice
             if (this.items.length === 0) {
                 this.currentIndex = -1;
             }
        },

        setupEventListeners() {
            if (this.leftBtn) this.leftBtn.addEventListener('click', () => this.previousSlide());
            if (this.rightBtn) this.rightBtn.addEventListener('click', () => this.nextSlide());
            if (this.track) {
                this.track.addEventListener('mouseenter', () => this.stopAutoPlay());
                this.track.addEventListener('mouseleave', () => this.startAutoPlay());
            }
        },

        showSlide(index) {
            const visibleItems = Array.from(this.items).filter(item => !item.classList.contains('filtered-out'));

            if (visibleItems.length === 0) {
                 this.currentIndex = -1;
                 // Ocultar todos los items (incluso los filtrados) si no hay visibles
                 this.items.forEach(item => {
                    item.style.display = 'none';
                    item.classList.remove('active');
                 });
                 this.updateIndicatorActiveState();
                 return;
            }

            let targetIndex = index;
            let targetItem = this.items[targetIndex];

            // Si el índice es inválido o el item está filtrado, busca el primer visible
            if (targetIndex < 0 || targetIndex >= this.items.length || targetItem?.classList.contains('filtered-out')) {
                const firstVisibleItem = visibleItems[0];
                targetIndex = Array.from(this.items).indexOf(firstVisibleItem);
                targetItem = this.items[targetIndex]; // Reasignar targetItem
            }

            // Ocultar todos los items (solo afecta a los no filtrados visualmente)
            this.items.forEach(item => {
                item.classList.remove('active');
                if (!item.classList.contains('filtered-out')) {
                     item.style.display = 'none';
                }
            });

            // Mostrar el item objetivo si existe
            if (targetItem) {
                targetItem.classList.add('active');
                targetItem.style.display = 'flex';
            }

            this.currentIndex = targetIndex;
            this.updateIndicatorActiveState();
        },

        updateIndicatorActiveState() {
             this.indicators.forEach((indicator, i) => {
                const item = this.items[i];
                // Mostrar indicador solo si el item correspondiente existe y no está filtrado
                indicator.style.display = item && !item.classList.contains('filtered-out') ? 'inline-block' : 'none';
                indicator.classList.toggle('active', i === this.currentIndex);
            });
        },


        nextSlide() {
            const visibleItems = Array.from(this.items).filter(item => !item.classList.contains('filtered-out'));
            if (visibleItems.length <= 1) return; // No hay a dónde ir

            let currentVisibleIndex = visibleItems.findIndex(item => Array.from(this.items).indexOf(item) === this.currentIndex);
             if (currentVisibleIndex === -1 && visibleItems.length > 0) { // Si el actual no era visible, empieza desde el primero
                 currentVisibleIndex = 0;
             } else if (visibleItems.length === 0) {
                 return; // No hay items visibles
             }


            const nextVisibleIndex = (currentVisibleIndex + 1) % visibleItems.length;
            const nextItem = visibleItems[nextVisibleIndex];
            const nextGlobalIndex = Array.from(this.items).indexOf(nextItem);
            this.showSlide(nextGlobalIndex);
        },

        previousSlide() {
            const visibleItems = Array.from(this.items).filter(item => !item.classList.contains('filtered-out'));
             if (visibleItems.length <= 1) return;

             let currentVisibleIndex = visibleItems.findIndex(item => Array.from(this.items).indexOf(item) === this.currentIndex);
              if (currentVisibleIndex === -1 && visibleItems.length > 0) {
                 currentVisibleIndex = 0; // Si el actual no era visible, ir al último visible como previo
                 currentVisibleIndex = visibleItems.length -1;
             } else if (visibleItems.length === 0) {
                 return;
             }

            const prevVisibleIndex = (currentVisibleIndex - 1 + visibleItems.length) % visibleItems.length;
            const prevItem = visibleItems[prevVisibleIndex];
            const prevGlobalIndex = Array.from(this.items).indexOf(prevItem);
            this.showSlide(prevGlobalIndex);
        },

        goToSlide(index) {
             if (index >= 0 && index < this.items.length && this.items[index] && !this.items[index].classList.contains('filtered-out')) {
                this.showSlide(index);
             } else {
                 console.warn("Intentando ir a un slide inválido o filtrado.");
             }
        },

        startAutoPlay() {
            this.stopAutoPlay(); // Asegura que no haya intervalos duplicados
            if (this.items.length > 1) { // Solo inicia si hay más de una imagen
               this.autoPlayInterval = setInterval(() => this.nextSlide(), this.autoPlayDelay);
            }
        },

        stopAutoPlay() {
            if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
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
                         const offsetTop = targetElement.offsetTop - (document.querySelector('nav')?.offsetHeight || 0); // Ajuste por nav sticky
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                        // Opcional: cerrar menú móvil si existe
                        document.querySelector('nav ul')?.classList.remove('active');
                    }
                });
            });
        },

        setupScrollSpy() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('nav a');
            if (navLinks.length === 0 || sections.length === 0) return;

            const observerOptions = {
                 root: null,
                 rootMargin: `-${(document.querySelector('nav')?.offsetHeight || 50) + 10}px 0px -60% 0px`, // Ajusta margen superior por nav, inferior para activar antes
                 threshold: 0
             };

            const observer = new IntersectionObserver(entries => {
                let activeSectionId = null;

                // Encuentra la última sección visible desde arriba
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        activeSectionId = entry.target.id;
                    }
                });

                 // Si ninguna está activa (scroll arriba del todo), activa HOME si existe
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
            const savedTheme = localStorage.getItem('theme');
            // Preferir tema del sistema si no hay guardado y está disponible
             const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const defaultTheme = savedTheme || (prefersDark ? 'dark' : 'light');
            this.setTheme(defaultTheme);
        }
    };

     // === FILTROS Y BÚSQUEDA ===
    const galleryFilters = {
        filterButtons: [], // Se actualiza dinámicamente
        searchInput: document.getElementById('search-input'),
        addCategoryBtn: document.getElementById('add-category-btn'),
        addImageBtn: document.getElementById('add-image-btn'),
        filterButtonsContainer: document.querySelector('.filter-buttons'),
        currentFilter: 'all',

        init() {
            this.loadCategories(); // Carga y añade botones
            this.setupEventListeners(); // Asigna listeners a TODOS los botones
            this.applyFilterAndSearch(); // Aplica filtro inicial
        },

        setupEventListeners() {
            // Re-seleccionar TODOS los botones de filtro cada vez
            this.filterButtons = document.querySelectorAll('.filter-btn:not(.add-category-btn)');
            this.filterButtons.forEach(btn => {
                // Remover listener antiguo para evitar duplicados
                const oldListener = btn._filterClickListener;
                if (oldListener) {
                    btn.removeEventListener('click', oldListener);
                }
                // Añadir el nuevo listener (usando bind)
                 const newListener = this.handleFilterClick.bind(this);
                 btn.addEventListener('click', newListener);
                 btn._filterClickListener = newListener; // Guardar referencia para poder removerlo
            });

            if (this.searchInput) {
                 this.searchInput.addEventListener('input', () => this.applyFilterAndSearch());
            }
        },

        handleFilterClick(e) {
            const clickedButton = e.target.closest('.filter-btn');
            if (!clickedButton) return;
            this.currentFilter = clickedButton.dataset.filter;
            this.applyFilterAndSearch();
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
                    // No cambiar display aquí, lo hace showSlide
                    hasVisibleItems = true;
                } else {
                    item.classList.add('filtered-out');
                    item.style.display = 'none'; // Ocultar los filtrados directamente
                    item.classList.remove('active');
                }
            });

            // Re-mostrar slide adecuado
             if (hasVisibleItems) {
                // Si el item actual sigue siendo visible, quédate ahí. Si no, ve al primero visible.
                 const currentItemStillVisible = carousel.items[carousel.currentIndex] && !carousel.items[carousel.currentIndex].classList.contains('filtered-out');
                 carousel.showSlide(currentItemStillVisible ? carousel.currentIndex : -1); // -1 fuerza a buscar el primero visible
             } else {
                 carousel.showSlide(-1); // No hay nada que mostrar
             }
             // Ya no es necesario llamar a updateIndicatorActiveState aquí, showSlide lo hace.
        },

        addCategoryButton(name, filterValue, iconClass = 'fas fa-tag') {
             if (!this.filterButtonsContainer || !this.addCategoryBtn) return;
             if (document.querySelector(`.filter-btn[data-filter="${filterValue}"]`)) return; // Ya existe

            const newButton = document.createElement('button');
            newButton.className = 'filter-btn';
            newButton.dataset.filter = filterValue;
            newButton.innerHTML = `<i class="${iconClass}"></i> ${name}`;

            this.filterButtonsContainer.insertBefore(newButton, this.addCategoryBtn);

            // IMPORTANTE: Volver a configurar los event listeners
            this.setupEventListeners();

            this.saveCategories();
        },

        saveCategories() {
            const categories = [];
            // Usa la lista actualizada de botones
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
                try {
                    const categories = JSON.parse(saved);
                    if (Array.isArray(categories)) {
                       categories.forEach(cat => {
                           // Añadir botón SIN llamar a setupEventListeners dentro del loop
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
             // setupEventListeners se llamará una vez en init() después de cargar todas
        }
    };

    // === MODAL DE CATEGORÍAS ===
    const categoryModal = {
        modal: document.getElementById('categoryModal'),
        form: document.getElementById('category-form'),
        addButton: document.getElementById('add-category-btn'),
        cancelButton: document.getElementById('cancel-category'),
        closeButton: document.querySelector('#categoryModal .category-close'),

        init() {
            if (!this.modal || !this.form || !this.addButton || !this.cancelButton || !this.closeButton) return;
            this.setupEventListeners();
        },
        setupEventListeners() {
            this.addButton.addEventListener('click', () => this.open());
            this.cancelButton.addEventListener('click', () => this.close());
            this.closeButton.addEventListener('click', () => this.close());
            this.modal.addEventListener('click', (e) => { if (e.target === this.modal) this.close(); });
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        },
        open() { this.modal.style.display = 'block'; document.getElementById('category-name')?.focus(); },
        close() { this.modal.style.display = 'none'; this.form.reset(); },
        handleSubmit(e) {
            e.preventDefault();
            const nameInput = document.getElementById('category-name');
            const iconSelect = document.getElementById('category-icon');
            const name = nameInput?.value.trim();
            const icon = iconSelect?.value || 'fas fa-tag';
            const filterValue = name.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, ''); // filtro seguro

            if (!name) { alert('Ingresa un nombre para la categoría.'); return; }
            if (!filterValue) { alert('Nombre inválido para filtro.'); return;}

            galleryFilters.addCategoryButton(name, filterValue, icon);
            this.close();
            imageUploadModal.updateCategoryOptions();
        }
    };

     // === MODAL DE SUBIR IMÁGENES ===
    const imageUploadModal = {
        modal: document.getElementById('imageUploadModal'),
        form: document.getElementById('image-upload-form'),
        addButton: document.getElementById('add-image-btn'),
        cancelButton: document.getElementById('cancel-image'),
        closeButton: document.querySelector('#imageUploadModal .image-upload-close'),
        fileInput: document.getElementById('image-file'),
        fileInfo: document.getElementById('file-info'),
        categorySelect: document.getElementById('image-category'),

        init() {
            if (!this.modal || !this.form || !this.addButton || !this.cancelButton || !this.closeButton || !this.fileInput || !this.categorySelect) return;
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
            document.getElementById('image-title')?.focus();
        },
        close() {
            this.modal.style.display = 'none';
            this.form.reset();
            if (this.fileInfo) this.fileInfo.style.display = 'none';
        },
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

        // --- handleSubmit ACTUALIZADO con fetch ---
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

            // --- Enviar datos al backend usando fetch ---
            fetch('/upload-image', { method: 'POST', body: formData })
            .then(response => response.text().then(text => ({ ok: response.ok, status: response.status, text: text })))
            .then(({ ok, status, text }) => {
                if (ok) {
                    console.log('Server response:', text);
                    // EXTRAER el nuevo filename de la respuesta del servidor (asumiendo que lo devuelve)
                    // EJEMPLO: si el servidor responde "¡... guardada como '123_upload.jpg'!"
                    const match = text.match(/guardada como '([^']+)'/);
                    const newFilename = match ? match[1] : 'nueva_imagen_error.jpg'; // Nombre de respaldo

                    alert('¡Imagen subida!');
                    const tempImageUrl = URL.createObjectURL(file); // URL temporal para preview
                    // Pasar el filename real devuelto por el servidor
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

        // --- addImageToDOM ACTUALIZADO ---
        addImageToDOM(imageUrl, title, description, category, filename) { // Recibe filename
            if (!carousel.track || !carousel.indicatorsContainer) return;

            const newItem = document.createElement('div');
            newItem.className = 'carousel-item';
            newItem.dataset.category = category;
            newItem.dataset.title = title.toLowerCase();
            newItem.dataset.filename = filename; // *** GUARDAR filename REAL ***
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
            if (deleteBtn) deleteBtn.addEventListener('click', handleDeleteImageClick); // Asignar handler

            carousel.track.appendChild(newItem);

            carousel.updateItemsAndIndicators();
            galleryFilters.applyFilterAndSearch(); // Actualizar filtros y vista
            // Ir al último slide (que ahora es el nuevo)
             if (carousel.items.length > 0) {
                carousel.goToSlide(carousel.items.length - 1);
             }

            imageModal.addClickListenersToImages(); // Actualizar listeners del modal de imagen
        }
    };

    // === MODAL PARA VER IMAGEN EN GRANDE ===
    const imageModal = {
         modal: document.getElementById('imageModal'),
         modalImage: document.getElementById('modalImage'),
         modalTitle: document.getElementById('modalTitle'),
         modalDescription: document.getElementById('modalDescription'),
         closeBtn: document.querySelector('#imageModal .close'),

         init() {
             if (!this.modal || !this.modalImage || !this.modalTitle || !this.modalDescription || !this.closeBtn) return;
             this.setupEventListeners();
         },
        setupEventListeners() {
             this.closeBtn.addEventListener('click', () => this.close());
             this.modal.addEventListener('click', (e) => { if (e.target === this.modal) this.close(); });
             this.addClickListenersToImages(); // Añadir a imágenes iniciales
         },
         addClickListenersToImages() {
             document.querySelectorAll('.carousel-item img').forEach(img => {
                 // Evitar añadir listeners múltiples
                 if (!img._imageModalListenerAdded) {
                      img.addEventListener('click', this.handleImageClick.bind(this));
                      img._imageModalListenerAdded = true;
                 }
             });
         },
         handleImageClick(event) { this.open(event.currentTarget); },
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
         close() {
             this.modal.style.display = 'none';
             document.body.style.overflow = '';
         }
    };

    // --- NUEVA LÓGICA PARA ELIMINAR IMAGEN ---
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
            // Eliminar visualmente PRIMERO para respuesta rápida
            removeCarouselItem(itemToDelete);

            // Enviar petición al backend para eliminar el archivo real
            console.log(`Enviando petición para eliminar: ${filename}`);
            fetch('/delete-image', { // (Endpoint que crearemos en Go)
                method: 'POST', // Usaremos POST por simplicidad para enviar JSON
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: filename })
            })
            .then(response => response.json().then(data => ({ ok: response.ok, data }))) // Asume que Go responde JSON { success: bool, message: string }
            .then(({ ok, data }) => {
                if (ok && data.success) {
                    console.log('Imagen eliminada del servidor:', filename);
                    // alert('Imagen eliminada del servidor.'); // Opcional: Notificación más discreta
                } else {
                    console.error('Error al eliminar del servidor:', data.message || 'Error desconocido');
                    alert('Error al eliminar la imagen del servidor: ' + (data.message || 'Intenta de nuevo'));
                    // TODO: Considerar restaurar el item visualmente si falla el backend
                    // (Esto es más complejo, requiere guardar el elemento temporalmente)
                }
            })
            .catch(error => {
                console.error('Error de red al eliminar:', error);
                alert('Error de conexión al intentar eliminar la imagen.');
                // TODO: Restaurar item visualmente
            });
        }
    }

    function removeCarouselItem(itemElement) {
        if (!itemElement || !carousel.track) return;

        const indexToRemove = Array.from(carousel.items).indexOf(itemElement);
        if (indexToRemove === -1) return;

        itemElement.remove(); // Eliminar del DOM

        // Recalcular estado interno
        const wasCurrentIndex = indexToRemove === carousel.currentIndex;
        const oldLength = carousel.items.length; // Longitud ANTES de actualizar

        carousel.updateItemsAndIndicators(); // Actualiza items, indicadores y sus listeners

        let nextIndexToShow = carousel.currentIndex; // Por defecto, mantener el índice (si algo más se vuelve visible ahí)

        if (carousel.items.length === 0) {
            nextIndexToShow = -1; // No queda nada
        } else if (wasCurrentIndex) {
            // Si eliminamos el actual, intenta ir al mismo índice (ahora es otro item) o al último si era el último
             nextIndexToShow = Math.min(indexToRemove, carousel.items.length - 1);
        } else if (indexToRemove < carousel.currentIndex) {
            // Si eliminamos uno anterior, el índice actual efectivo se reduce en 1
            nextIndexToShow = carousel.currentIndex -1;
        }
         // Si se eliminó uno posterior, el índice actual sigue siendo válido

        carousel.showSlide(nextIndexToShow); // Mostrar el slide correcto
        galleryFilters.applyFilterAndSearch(); // Asegurar consistencia de filtros/indicadores
    }

    function addInitialDeleteListeners() {
        document.querySelectorAll('.delete-image-btn').forEach(button => {
             // Evitar duplicados si initApp se llama más de una vez
             if (!button._deleteListenerAdded) {
                button.addEventListener('click', handleDeleteImageClick);
                button._deleteListenerAdded = true;
             }
        });
    }

    // --- INICIALIZACIÓN GENERAL ---
    function initApp() {
        carousel.init();
        navigation.init();
        darkMode.init();
        galleryFilters.init();
        categoryModal.init();
        imageUploadModal.init();
        imageModal.init();
        addInitialDeleteListeners(); // Añadir listeners a botones de eliminar iniciales

        console.log("Portafolio inicializado con funcionalidad de eliminar.");
    }

    initApp(); // Ejecutar inicialización

}); // Fin DOMContentLoaded