package chat

import (
	"crypto/rand"
	"fmt"
	"sync"
	"time"
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
		ID:       generateUUID(),
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
		ID:        generateUUID(),
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

func generateUUID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		panic(fmt.Sprintf("rand.Read: %v", err))
	}
	b[6] = (b[6] & 0x0f) | 0x40 // version 4
	b[8] = (b[8] & 0x3f) | 0x80 // variant
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}
