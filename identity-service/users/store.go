package users

import (
	"strings"
	"sync"
)

// Store is an in-memory repository of users.
type Store struct {
	mu         sync.RWMutex
	byID       map[string]*User
	byUsername map[string]*User
}

// NewStore returns an initialised, empty Store.
func NewStore() *Store {
	return &Store{
		byID:       make(map[string]*User),
		byUsername: make(map[string]*User),
	}
}

// UsernameExists reports whether a user with the given username already exists.
// The check is case-insensitive.
func (s *Store) UsernameExists(username string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	_, ok := s.byUsername[strings.ToLower(username)]
	return ok
}

// Add persists a user in the store.
func (s *Store) Add(u *User) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.byID[u.ID] = u
	s.byUsername[strings.ToLower(u.Username)] = u
}

// GetByID returns the user with the given ID, or nil if not found.
func (s *Store) GetByID(id string) *User {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.byID[id]
}
