package users

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

// Handler handles HTTP requests for the users resource.
type Handler struct {
	store *Store
}

// NewHandler returns a Handler backed by the given Store.
func NewHandler(store *Store) *Handler {
	return &Handler{store: store}
}

// Create handles POST /users — validates the request, creates a user, and
// returns the new user's ID and auth token.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
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

	if h.store.UsernameExists(req.Username) {
		writeJSON(w, http.StatusConflict, errorResponse{
			Error:   "username_taken",
			Message: "username is already taken",
		})
		return
	}

	u := New(req.Username)
	h.store.Add(u)

	log.Printf("created user id=%s username=%s", u.ID, u.Username)
	writeJSON(w, http.StatusCreated, createUserResponse{
		ID:        u.ID,
		AuthToken: u.AuthToken,
	})
}

// ── request / response types ─────────────────────────────────────────────

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

// ── helper ───────────────────────────────────────────────────────────────

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}
