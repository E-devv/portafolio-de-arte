package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

// Define la ruta donde se guardarán las imágenes subidas
const uploadPath = "./static/images"

func main() {
	// Asegúrate de que la carpeta de subidas exista
	err := os.MkdirAll(uploadPath, os.ModePerm)
	if err != nil {
		log.Fatalf("Error al crear la carpeta de subidas '%s': %v", uploadPath, err)
	}

	// --- Servir archivos estáticos (CSS, JS, imágenes existentes) ---
	fs := http.FileServer(http.Dir("./static"))
	// Hacemos que /static/ sirva archivos desde la carpeta ./static
	// Hacemos que /images/ también sirva archivos desde ./static/images (para simplificar rutas en HTML)
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	http.Handle("/images/", http.StripPrefix("/images/", http.FileServer(http.Dir(uploadPath))))

	// --- Servir el archivo principal index.html ---
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Asegúrate de que solo se sirva index.html para la ruta raíz exacta
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		http.ServeFile(w, r, "index.html")
	})

	// --- NUEVO: Manejador para la subida de imágenes ---
	http.HandleFunc("/upload-image", handleImageUpload)

	// --- Iniciar el servidor ---
	port := "8080"
	log.Printf("Servidor iniciado. Abre http://localhost:%s en tu navegador.", port)
	err = http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatal("Error al iniciar el servidor: ", err)
	}
}

// handleImageUpload procesa la subida de archivos desde el modal
func handleImageUpload(w http.ResponseWriter, r *http.Request) {
	// Solo permitir método POST
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Parsear el formulario multipart (límite de 10MB para el archivo)
	// r.ParseMultipartForm necesita un tamaño máximo en memoria antes de escribir a disco
	err := r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		log.Printf("Error al parsear formulario: %v", err)
		http.Error(w, "Error al procesar el formulario: "+err.Error(), http.StatusBadRequest)
		return
	}

	// --- Obtener el archivo de imagen ---
	file, handler, err := r.FormFile("image-file") // "image-file" debe coincidir con el name del input en HTML
	if err != nil {
		log.Printf("Error al obtener el archivo 'image-file': %v", err)
		http.Error(w, "Error al obtener el archivo: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close() // Asegúrate de cerrar el archivo

	// --- Obtener los otros datos del formulario ---
	title := r.FormValue("image-title")
	description := r.FormValue("image-description")
	category := r.FormValue("image-category")

	// Validar que los datos no estén vacíos (puedes añadir más validaciones)
	if title == "" || description == "" || category == "" {
		http.Error(w, "Faltan datos (título, descripción o categoría)", http.StatusBadRequest)
		return
	}

	log.Printf("Archivo recibido: %s, Tamaño: %d bytes", handler.Filename, handler.Size)
	log.Printf("Datos recibidos: Título='%s', Descripción='%s', Categoría='%s'", title, description, category)

	// --- Guardar el archivo en el servidor ---
	// Crear un nombre de archivo único para evitar colisiones
	// Usaremos timestamp + nombre original (podrías usar UUIDs también)
	ext := filepath.Ext(handler.Filename)
	uniqueFilename := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), "upload", ext) // Ejemplo: 1678886400123456789_upload.jpg
	dstPath := filepath.Join(uploadPath, uniqueFilename)

	// Crear el archivo destino en el servidor
	dst, err := os.Create(dstPath)
	if err != nil {
		log.Printf("Error al crear el archivo destino '%s': %v", dstPath, err)
		http.Error(w, "Error interno al guardar el archivo", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	// Copiar el contenido del archivo subido al archivo destino
	_, err = io.Copy(dst, file)
	if err != nil {
		log.Printf("Error al copiar el contenido del archivo a '%s': %v", dstPath, err)
		http.Error(w, "Error interno al guardar el archivo", http.StatusInternalServerError)
		return
	}

	log.Printf("Archivo guardado exitosamente en: %s", dstPath)

	// --- (Próximo paso: Guardar la información en un JSON) ---
	// Por ahora, solo respondemos con éxito

	// Enviar respuesta exitosa al frontend (podrías enviar JSON con la nueva ruta de imagen)
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "¡Imagen '%s' subida y guardada como '%s'!", handler.Filename, uniqueFilename)
}
