package chat

import "time"

// Message is a single chat message posted by a user.
type Message struct {
	ID        string    `json:"id"`
	Timestamp time.Time `json:"timestamp"`
	Content   string    `json:"content"`
	UserID    string    `json:"userId"`
	Username  string    `json:"username"`
}
