package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type statusResponse struct {
	Status string `json:"status"`
}

func statusHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(statusResponse{Status: "OK"})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/status", statusHandler)

	addr := ":8080"
	log.Printf("identity-service listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
