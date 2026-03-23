package lobby

import (
	"sort"
	"sync"
	"time"
)

const evictAfter = 15 * time.Second

// Store is an in-memory repository of users currently in the lobby.
type Store struct {
	mu   sync.RWMutex
	byID map[string]*User
}

// NewStore returns an initialised, empty Store.
func NewStore() *Store {
	return &Store{byID: make(map[string]*User)}
}

// Add inserts or replaces a user in the lobby, setting LastSeen to now.
func (s *Store) Add(u *User) {
	s.mu.Lock()
	defer s.mu.Unlock()
	u.LastSeen = time.Now().UTC()
	s.byID[u.ID] = u
}

// Touch updates the LastSeen timestamp for the user with the given ID.
// It is a no-op if the user is not in the store.
func (s *Store) Touch(id string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if u, ok := s.byID[id]; ok {
		u.LastSeen = time.Now().UTC()
	}
}

// Evict removes users whose LastSeen is older than evictAfter.
func (s *Store) Evict() {
	cutoff := time.Now().UTC().Add(-evictAfter)
	s.mu.Lock()
	defer s.mu.Unlock()
	for id, u := range s.byID {
		if u.LastSeen.Before(cutoff) {
			delete(s.byID, id)
		}
	}
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
