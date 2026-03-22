package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
)

// ── Domain ──────────────────────────────────────────────────────────────────

type user struct {
	ID        string
	Username  string
	AuthToken string
}

// ── In-memory store ────────────────────────────────────────────────────────

type store struct {
	mu    sync.RWMutex
	byID  map[string]*user
	byUsername map[string]*user
}

func newStore() *store {
	return &store{
		byID:       make(map[string]*user),
		byUsername: make(map[string]*user),
	}
}

func (s *store) usernameExists(username string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	_, ok := s.byUsername[strings.ToLower(username)]
	return ok
}

func (s *store) add(u *user) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.byID[u.ID] = u
	s.byUsername[strings.ToLower(u.Username)] = u
}

// ── Helpers ─────────────────────────────────────────────────────────────────

func generateUUID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		panic(fmt.Sprintf("rand.Read: %v", err))
	}
	b[6] = (b[6] & 0x0f) | 0x40 // version 4
	b[8] = (b[8] & 0x3f) | 0x80 // variant
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}

func generateToken() string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		panic(fmt.Sprintf("rand.Read: %v", err))
	}
	return hex.EncodeToString(b)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

// ── Handlers ────────────────────────────────────────────────────────────────

func statusHandler(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "OK"})
}

type createUserRequest struct {
	Username string `json:"username"`
}

type createUserResponse struct {
	ID        string `json:"id"`
	AuthToken string `json:"authToken"`
}

type errorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

func makeUsersHandler(s *store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", "POST")
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		var req createUserRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeJSON(w, http.StatusBadRequest, errorResponse{
				Error:   "invalid_request",
				Message: "request body must be valid JSON with a username field",
			})
			return
		}

		if strings.TrimSpace(req.Username) == "" {
			writeJSON(w, http.StatusBadRequest, errorResponse{
				Error:   "validation_failed",
				Message: "username must not be empty",
			})
			return
		}

		if s.usernameExists(req.Username) {
			writeJSON(w, http.StatusConflict, errorResponse{
				Error:   "username_taken",
				Message: "username is already taken",
			})
			return
		}

		u := &user{
			ID:        generateUUID(),
			Username:  req.Username,
			AuthToken: generateToken(),
		}
		s.add(u)

		log.Printf("created user id=%s username=%s", u.ID, u.Username)
		writeJSON(w, http.StatusCreated, createUserResponse{
			ID:        u.ID,
			AuthToken: u.AuthToken,
		})
	}
}

// ── Main ───────────────────────────────────────────────────────────────────

func main() {
	s := newStore()

	mux := http.NewServeMux()
	mux.HandleFunc("/status", statusHandler)
	mux.HandleFunc("/users", makeUsersHandler(s))

	addr := ":8080"
	log.Printf("identity-service listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
