const API_URL = "http://localhost:5000/api";

// Fetch all conversations
export async function getConversations() {
  const res = await fetch(`${API_URL}/conversations`);
  return res.json();
}

// Create a new conversation
export async function createConversation() {
  const res = await fetch(`${API_URL}/conversations`, { method: "POST" });
  return res.json();
}

// Fetch messages for a conversation
export async function getMessages(conversationId: string) {
  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`);
  return res.json();
}

// Send a message
export async function sendMessage(conversationId: string, content: string) {
  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return res.json();
}

// Delete a conversation
export async function deleteConversation(conversationId: string) {
  await fetch(`${API_URL}/conversations/${conversationId}`, { method: "DELETE" });
}

// Rename a conversation
export async function renameConversation(conversationId: string, name: string) {
  const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}
