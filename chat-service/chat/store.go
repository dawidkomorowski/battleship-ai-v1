package chat

import (
	"fmt"
	"sync"
)

// Store is an in-memory repository of all conversations.
type Store struct {
	mu   sync.RWMutex
	byID map[string]*Conversation
}

// NewStore returns an initialised, empty Store.
func NewStore() *Store {
	return &Store{byID: make(map[string]*Conversation)}
}

// Create creates a new, empty Conversation, stores it, and returns it.
func (s *Store) Create() *Conversation {
	c := newConversation()
	s.mu.Lock()
	defer s.mu.Unlock()
	s.byID[c.ID] = c
	return c
}

// Get returns the Conversation with the given ID.
// It returns an error if no such conversation exists.
func (s *Store) Get(id string) (*Conversation, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	c, ok := s.byID[id]
	if !ok {
		return nil, fmt.Errorf("conversation %q not found", id)
	}
	return c, nil
}
