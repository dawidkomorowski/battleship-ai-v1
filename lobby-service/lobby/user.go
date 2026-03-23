package lobby

import "time"

// User represents a participant in the lobby.
type User struct {
	ID       string
	Username string
	LastSeen time.Time
}
