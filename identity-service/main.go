package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/battleship-ai-v1/identity-service/users"
)

func statusHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "OK"})
}

func main() {
	store := users.NewStore()
	usersHandler := users.NewHandler(store)

	mux := http.NewServeMux()
	mux.HandleFunc("/status", statusHandler)
	mux.HandleFunc("/users", usersHandler.Create)

	addr := ":8080"
	log.Printf("identity-service listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
