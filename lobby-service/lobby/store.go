package lobby

import (
	"sort"
	"sync"
)

// Store is an in-memory repository of users currently in the lobby.
type Store struct {
	mu   sync.RWMutex
	byID map[string]*User
}

// NewStore returns an initialised, empty Store.
func NewStore() *Store {
	return &Store{byID: make(map[string]*User)}
}

// Add inserts or replaces a user in the lobby.
func (s *Store) Add(u *User) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.byID[u.ID] = u
}

// List returns all users currently in the lobby, sorted by username.
func (s *Store) List() []*User {
	s.mu.RLock()
	defer s.mu.RUnlock()
	users := make([]*User, 0, len(s.byID))
	for _, u := range s.byID {
		users = append(users, u)
	}
	sort.Slice(users, func(i, j int) bool {
		return users[i].Username < users[j].Username
	})
	return users
}
