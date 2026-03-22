package lobby

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// Handler handles HTTP requests for the lobby resource.
type Handler struct {
	store           *Store
	identityBaseURL string
}

// NewHandler returns a Handler backed by the given Store.
// identityBaseURL is the base URL of the identity-service (e.g. "http://identity-service:8080").
func NewHandler(store *Store, identityBaseURL string) *Handler {
	return &Handler{store: store, identityBaseURL: identityBaseURL}
}

// ── Authentication helper ────────────────────────────────────────────────

type identityUser struct {
	ID       string `json:"id"`
	Username string `json:"username"`
}

// authenticate calls identity-service to verify the token for the given user ID.
// On success it returns the verified user profile.
// On 403 it returns nil, 403.
// On any other error it returns nil, 500.
func (h *Handler) authenticate(userID, token string) (*identityUser, int) {
	url := fmt.Sprintf("%s/users/%s", h.identityBaseURL, userID)
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, http.StatusInternalServerError
	}
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, http.StatusInternalServerError
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusForbidden {
		return nil, http.StatusForbidden
	}
	if resp.StatusCode != http.StatusOK {
		return nil, http.StatusInternalServerError
	}

	var u identityUser
	if err := json.NewDecoder(resp.Body).Decode(&u); err != nil {
		return nil, http.StatusInternalServerError
	}
	return &u, http.StatusOK
}

// ── Handlers ────────────────────────────────────────────────────────────

// JoinLobby handles POST /users/{id} — authenticates the user and adds them to the lobby.
func (h *Handler) JoinLobby(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.Header().Set("Allow", "POST")
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	userID := strings.TrimPrefix(r.URL.Path, "/users/")
	if userID == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	token := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
	u, status := h.authenticate(userID, token)
	if status != http.StatusOK {
		w.WriteHeader(status)
		return
	}

	h.store.Add(&User{ID: u.ID, Username: u.Username})
	w.WriteHeader(http.StatusOK)
}

// ListUsers handles GET /users — authenticates the caller and returns all lobby users.
func (h *Handler) ListUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.Header().Set("Allow", "GET")
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	// Caller provides their own user ID as a query parameter for auth.
	userID := r.URL.Query().Get("userID")
	token := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")

	if _, status := h.authenticate(userID, token); status != http.StatusOK {
		w.WriteHeader(status)
		return
	}

	type userDTO struct {
		ID       string `json:"id"`
		Username string `json:"username"`
	}

	all := h.store.List()
	result := make([]userDTO, len(all))
	for i, u := range all {
		result[i] = userDTO{ID: u.ID, Username: u.Username}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{"users": result})
}
