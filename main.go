package main

import (
	"log"
	"net/http"
)

func main() {
	// Servir archivos estáticos (CSS, JS, imágenes) desde la carpeta /static
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// Servir el archivo principal index.html para la ruta raíz
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.html")
	})

	log.Println("Servidor iniciado. Abre http://localhost:8080 en tu navegador.")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("Error al iniciar el servidor: ", err)
	}
}