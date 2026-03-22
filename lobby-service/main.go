package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/battleship-ai-v1/lobby-service/lobby"
)

func statusHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "OK"})
}

func main() {
	identityBaseURL := os.Getenv("IDENTITY_SERVICE_URL")
	if identityBaseURL == "" {
		identityBaseURL = "http://identity-service:8080"
	}

	store := lobby.NewStore()
	lobbyHandler := lobby.NewHandler(store, identityBaseURL)

	mux := http.NewServeMux()
	mux.HandleFunc("/status", statusHandler)
	mux.HandleFunc("/users/", lobbyHandler.JoinLobby)
	mux.HandleFunc("/users", lobbyHandler.ListUsers)

	addr := ":8081"
	log.Printf("lobby-service listening on %s (identity-service: %s)", addr, identityBaseURL)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
