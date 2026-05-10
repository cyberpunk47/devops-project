package main

import (
	"log"
	"net/http"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	mux := http.NewServeMux()
	mux.Handle("/metrics", promhttp.Handler())
	mux.HandleFunc("GET /tasks", getTasks)
	mux.HandleFunc("POST /tasks", createTasks)
	mux.HandleFunc("PUT /tasks/{id}", updateTasks)
	mux.HandleFunc("DELETE /tasks/{id}", deleteTasks)
	handler := loggingMiddleware(mux)
	handler = corsMiddleware(handler)

	log.Println("Server started on port 8000")
	log.Fatal(http.ListenAndServe(":8000", handler))
}
