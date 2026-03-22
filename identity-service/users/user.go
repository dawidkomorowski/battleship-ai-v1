package users

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
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
		ID:        generateUUID(),
		Username:  username,
		AuthToken: generateToken(),
	}
}

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
