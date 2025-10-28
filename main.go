package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// uploadPath define la ruta del directorio donde se guardarán las imágenes subidas.
// Es una constante para asegurar que la ruta sea la misma en todo el programa.
const uploadPath = "./static/images"

const commentsFilePath = "comments.json"

var (
	comments   []Comment
	commentsMu sync.Mutex
)

// Comment representa la estructura de un comentario.
type Comment struct {
	ID        int64  `json:"id"`
	Author    string `json:"author"`
	Text      string `json:"text"`
	Timestamp string `json:"timestamp"`
}

// main es la función principal que inicia el servidor web.
// Configura los manejadores de rutas para servir archivos estáticos, la página principal
// y para procesar la subida de imágenes. Finalmente, inicia el servidor en el puerto 8080.
func main() {
	// Se asegura de que el directorio de subida de archivos exista.
	// Si no existe, lo crea con permisos completos.
	// Si hay un error al crear el directorio, el programa termina.
	err := os.MkdirAll(uploadPath, os.ModePerm)
	if err != nil {
		log.Fatalf("Error al crear la carpeta de subidas '%s': %v", uploadPath, err)
	}

	// Cargar comentarios desde el archivo al iniciar.
	loadComments()

	// Configura el servidor de archivos estáticos para servir el contenido de la carpeta "./static".
	// http.StripPrefix elimina el prefijo "/static/" de la URL para que el servidor de archivos
	// pueda encontrar los archivos correctamente en el directorio "./static".
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// Configura un manejador específico para las imágenes subidas.
	// Esto permite acceder a las imágenes directamente desde "/images/nombre-archivo.jpg" en el HTML,
	// simplificando las rutas.
	http.Handle("/images/", http.StripPrefix("/images/", http.FileServer(http.Dir(uploadPath))))

	// Configura el manejador para la ruta raíz ("/").
	// Este manejador sirve el archivo "index.html".
	// Se realiza una comprobación para evitar que este manejador responda a otras rutas.
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		http.ServeFile(w, r, "index.html")
	})

	// Configura el manejador para la subida de imágenes en la ruta "/upload-image".
	// La función handleImageUpload se encargará de procesar las peticiones a esta ruta.
	http.HandleFunc("/upload-image", handleImageUpload)

	// Rutas para la API de comentarios
	http.HandleFunc("/api/comments", handleComments)

	// Inicia el servidor en el puerto 8080.
	// Si hay un error al iniciar el servidor, el programa termina.
	port := "8080"
	log.Printf("Servidor iniciado. Abre http://localhost:%s en tu navegador.", port)
	err = http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatal("Error al iniciar el servidor: ", err)
	}
}

// loadComments carga los comentarios desde el archivo JSON.
func loadComments() {
	commentsMu.Lock()
	defer commentsMu.Unlock()

	file, err := os.ReadFile(commentsFilePath)
	if err != nil {
		if os.IsNotExist(err) {
			log.Printf("El archivo de comentarios '%s' no existe. Se creará uno nuevo al guardar el primer comentario.", commentsFilePath)
			comments = []Comment{}
			return
		}
		log.Fatalf("Error al leer el archivo de comentarios: %v", err)
	}

	if len(file) == 0 {
		comments = []Comment{}
		return
	}

	err = json.Unmarshal(file, &comments)
	if err != nil {
		log.Fatalf("Error al decodificar el archivo de comentarios: %v", err)
	}
	log.Printf("Se cargaron %d comentarios.", len(comments))
}

// saveComments guarda los comentarios en el archivo JSON.
func saveComments() {
	commentsMu.Lock()
	defer commentsMu.Unlock()

	data, err := json.MarshalIndent(comments, "", "  ")
	if err != nil {
		log.Printf("Error al codificar comentarios a JSON: %v", err)
		return
	}

	err = os.WriteFile(commentsFilePath, data, 0644)
	if err != nil {
		log.Printf("Error al guardar comentarios en el archivo: %v", err)
	}
}

// handleComments gestiona las peticiones a /api/comments.
// Soporta GET para obtener comentarios y POST para agregar uno nuevo.
func handleComments(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		getComments(w, r)
	case http.MethodPost:
		addComment(w, r)
	default:
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
	}
}

// getComments responde con la lista actual de comentarios en formato JSON.
func getComments(w http.ResponseWriter, r *http.Request) {
	commentsMu.Lock()
	defer commentsMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

// addComment procesa una petición para agregar un nuevo comentario.
func addComment(w http.ResponseWriter, r *http.Request) {
	var newComment Comment
	err := json.NewDecoder(r.Body).Decode(&newComment)
	if err != nil {
		http.Error(w, "Error al decodificar el cuerpo de la petición: "+err.Error(), http.StatusBadRequest)
		return
	}

	if newComment.Author == "" || newComment.Text == "" {
		http.Error(w, "El autor y el texto del comentario no pueden estar vacíos", http.StatusBadRequest)
		return
	}

	commentsMu.Lock()
	newComment.ID = time.Now().UnixNano()
	newComment.Timestamp = time.Now().Format(time.RFC3339)
	comments = append(comments, newComment)
	commentsMu.Unlock()

	go saveComments()

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newComment)
}

// handleImageUpload gestiona la subida de imágenes enviadas desde el formulario del frontend.
// Se encarga de validar la petición, parsear el formulario, guardar el archivo en el servidor
// con un nombre único y responder al cliente.
//
// Parámetros:
//   w http.ResponseWriter: El escritor de respuestas HTTP para enviar la respuesta al cliente.
//   r *http.Request: La petición HTTP recibida, que contiene el formulario con la imagen.
func handleImageUpload(w http.ResponseWriter, r *http.Request) {
	// Se asegura de que el método de la petición sea POST.
	// La subida de archivos debe realizarse mediante este método.
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Parsea el formulario multipart, que es el formato utilizado para enviar archivos.
	// Se establece un límite de 10 MB para el tamaño total de la petición.
	// r.ParseMultipartForm necesita un tamaño máximo para almacenar en memoria antes de escribir a disco.
	err := r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		log.Printf("Error al parsear formulario: %v", err)
		http.Error(w, "Error al procesar el formulario: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Obtiene el archivo de imagen del formulario. "image-file" es el nombre del campo `input` en el HTML.
	// Retorna el archivo, información sobre él (handler) y un posible error.
	file, handler, err := r.FormFile("image-file")
	if err != nil {
		log.Printf("Error al obtener el archivo 'image-file': %v", err)
		http.Error(w, "Error al obtener el archivo: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close() // Se asegura de que el archivo se cierre al final de la función.

	// Obtiene los demás campos de texto del formulario.
	title := r.FormValue("image-title")
	description := r.FormValue("image-description")
	category := r.FormValue("image-category")

	// Valida que los campos de texto no estén vacíos.
	if title == "" || description == "" || category == "" {
		http.Error(w, "Faltan datos (título, descripción o categoría)", http.StatusBadRequest)
		return
	}

	log.Printf("Archivo recibido: %s, Tamaño: %d bytes", handler.Filename, handler.Size)
	log.Printf("Datos recibidos: Título='%s', Descripción='%s', Categoría='%s'", title, description, category)

	// Crea un nombre de archivo único para evitar sobrescribir archivos existentes.
	// Se utiliza el timestamp actual en nanosegundos para garantizar la unicidad.
	ext := filepath.Ext(handler.Filename)
	uniqueFilename := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), "upload", ext)
	dstPath := filepath.Join(uploadPath, uniqueFilename)

	// Crea el archivo de destino en el servidor.
	dst, err := os.Create(dstPath)
	if err != nil {
		log.Printf("Error al crear el archivo destino '%s': %v", dstPath, err)
		http.Error(w, "Error interno al guardar el archivo", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	// Copia el contenido del archivo subido al archivo de destino que se acaba de crear.
	_, err = io.Copy(dst, file)
	if err != nil {
		log.Printf("Error al copiar el contenido del archivo a '%s': %v", dstPath, err)
		http.Error(w, "Error interno al guardar el archivo", http.StatusInternalServerError)
		return
	}

	log.Printf("Archivo guardado exitosamente en: %s", dstPath)

	// Envía una respuesta de éxito al cliente.
	// El código de estado es 200 OK y el cuerpo contiene un mensaje de confirmación
	// que incluye el nombre original y el nuevo nombre del archivo.
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "¡Imagen '%s' subida y guardada como '%s'!", handler.Filename, uniqueFilename)
}
