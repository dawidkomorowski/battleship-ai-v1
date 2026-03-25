package users

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"

	"github.com/google/uuid"
)

// User represents an identity in the system.
type User struct {
	ID        string
	Username  string
	AuthToken string
}

// New creates a new User for the given username, generating a UUID and an auth token.
func New(username string) *User {
	return &User{
		ID:        uuid.NewString(),
		Username:  username,
		AuthToken: generateToken(),
	}
}

func generateToken() string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		panic(fmt.Sprintf("rand.Read: %v", err))
	}
	return hex.EncodeToString(b)
}
