package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/battleship-ai-v1/chat-service/chat"
)

func statusHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "OK"})
}

func main() {
	store := chat.NewStore()
	_ = chat.NewHandler(store)

	mux := http.NewServeMux()
	mux.HandleFunc("/status", statusHandler)

	addr := ":8082"
	log.Printf("chat-service listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
