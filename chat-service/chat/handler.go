package chat

import "net/http"

// Handler handles HTTP requests for the chat resource.
type Handler struct {
	store *Store
}

// NewHandler returns a Handler backed by the given Store.
func NewHandler(store *Store) *Handler {
	return &Handler{store: store}
}

// ── Helpers ──────────────────────────────────────────────────────────────

func writeMethodNotAllowed(w http.ResponseWriter, allowed string) {
	w.Header().Set("Allow", allowed)
	w.WriteHeader(http.StatusMethodNotAllowed)
}
