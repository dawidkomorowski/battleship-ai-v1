package chat

import (
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"
)

// Conversation holds an ordered list of messages for a group of users.
type Conversation struct {
	ID string `json:"id"`

	mu       sync.RWMutex
	messages []*Message
}

// newConversation creates an empty Conversation with a new GUID.
func newConversation() *Conversation {
	return &Conversation{
		ID:       uuid.NewString(),
		messages: make([]*Message, 0),
	}
}

// AddMessage appends a new message from the given user to the conversation.
// It returns the created Message.
func (c *Conversation) AddMessage(userID, username, content string) (*Message, error) {
	if content == "" {
		return nil, fmt.Errorf("content must not be empty")
	}

	msg := &Message{
		ID:        uuid.NewString(),
		Timestamp: time.Now().UTC(),
		Content:   content,
		UserID:    userID,
		Username:  username,
	}

	c.mu.Lock()
	defer c.mu.Unlock()
	c.messages = append(c.messages, msg)
	return msg, nil
}

// Messages returns a snapshot of all messages in insertion order.
func (c *Conversation) Messages() []*Message {
	c.mu.RLock()
	defer c.mu.RUnlock()
	snapshot := make([]*Message, len(c.messages))
	copy(snapshot, c.messages)
	return snapshot
}
