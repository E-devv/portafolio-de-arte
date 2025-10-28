# Portafolio de Arte Interactivo

Este proyecto es una aplicación web de portafolio de arte interactivo. Permite a los artistas mostrar su trabajo de una manera dinámica y atractiva, con funcionalidades para que los visitantes exploren, filtren y vean las obras de arte. La aplicación está construida con un backend en Go y un frontend con HTML, CSS y JavaScript puro.

## Características Principales

- **Galería de Arte en Carrusel:** Las obras de arte se muestran en un carrusel interactivo con navegación manual y reproducción automática.
- **Carga Dinámica de Imágenes:** Los administradores pueden subir nuevas imágenes directamente desde la interfaz, incluyendo un título, descripción y categoría.
- **Gestión de Categorías:** Es posible añadir nuevas categorías de arte sobre la marcha, que se integran automáticamente en los controles de filtrado.
- **Filtrado y Búsqueda:** Los visitantes pueden filtrar las obras por categoría o utilizar una barra de búsqueda para encontrar piezas específicas por título o descripción.
- **Modo Oscuro/Claro:** Un interruptor de tema permite a los usuarios cambiar entre un tema visual claro y uno oscuro, guardando la preferencia en el almacenamiento local del navegador.
- **Diseño Responsivo:** La interfaz está diseñada para adaptarse a diferentes tamaños de pantalla, desde dispositivos móviles hasta ordenadores de escritorio.
- **Backend Eficiente en Go:** Un servidor web ligero escrito en Go se encarga de servir los archivos y gestionar la lógica de subida de imágenes.

## Estructura del Proyecto

```
.
├── static/
│   ├── css/
│   │   └── style.css       # Hojas de estilo para la aplicación
│   ├── js/
│   │   └── script.js       # Lógica del frontend (carrusel, modales, filtros, etc.)
│   └── images/
│       ├── ...             # Directorio para las imágenes subidas
│       └── (imágenes iniciales)
├── main.go                 # Servidor web principal y manejadores de API en Go
├── index.html              # Estructura principal de la página web
└── README.md               # Este archivo
```

## Configuración y Ejecución

Para ejecutar este proyecto localmente, necesitarás tener Go instalado en tu sistema.

### Prerrequisitos

- [Go (versión 1.18 o superior)](https://go.dev/doc/install)

### Pasos para la Ejecución

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/portafolio-de-arte.git
   cd portafolio-de-arte
   ```

2. **Ejecuta el servidor de Go:**
   Abre una terminal en la raíz del proyecto y ejecuta el siguiente comando:
   ```bash
   go run main.go
   ```

3. **Abre la aplicación en tu navegador:**
   Una vez que el servidor esté en funcionamiento, verás un mensaje en la terminal:
   ```
   Servidor iniciado. Abre http://localhost:8080 en tu navegador.
   ```
   Abre tu navegador web y ve a `http://localhost:8080`.

## Guía de Uso

### Para Visitantes

- **Navegar por el carrusel:** Usa las flechas a los lados del carrusel o los indicadores en la parte inferior para moverte entre las imágenes.
- **Filtrar obras:** Haz clic en los botones de categoría (como "Paisajes", "Retratos", etc.) para ver solo las obras de esa categoría.
- **Buscar obras:** Escribe en la barra de búsqueda para filtrar dinámicamente las imágenes por su título o descripción.
- **Cambiar el tema:** Haz clic en el icono de la luna/sol en la barra de navegación para cambiar entre el modo oscuro y el modo claro.

### Para Administradores (Uso Local)

- **Añadir una nueva categoría:**
  1. Haz clic en el botón "Agregar Categoría" en los controles de la galería.
  2. En el modal que aparece, introduce el nombre de la nueva categoría y selecciona un icono.
  3. Haz clic en "Agregar". La nueva categoría aparecerá como un botón de filtro.

- **Añadir una nueva imagen:**
  1. Haz clic en el botón "Agregar Imagen".
  2. En el modal, selecciona un archivo de imagen de tu ordenador (máximo 10MB).
  3. Completa los campos de título, descripción y selecciona una categoría existente.
  4. Haz clic en "Agregar Imagen". La imagen se subirá al servidor y se añadirá al carrusel.