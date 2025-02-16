"use client";
import { useState, useEffect, useRef } from "react";
import { Send, PlusCircle, Trash } from "react-feather";
import LoadingDots from "@/components/LoadingDots";
import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  deleteConversation,
  renameConversation,
} from "@/lib/api";

interface Conversation {
  id: string;
  createdAt: string;
  name?: string; //
}

interface Message {
  id: string;
  content: string;
  role: "USER" | "ASSISTANT";
}

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: "bot-initial", role: "ASSISTANT", content: "How can I help you?" },
  ]);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch conversations when the component loads
  useEffect(() => {
    async function loadConversations() {
      const data = await getConversations();
      setConversations(data);
      if (data.length > 0) {
        selectConversation(data[0].id);
      }
    }
    loadConversations();
  }, []);

  // Fetch messages when a conversation is selected
  async function selectConversation(conversationId: string) {
    setCurrentConversationId(conversationId);
    const data = await getMessages(conversationId);

    // Ensure "How can I help you?" appears if no messages exist
    if (data.length === 0) {
      setMessages([{ id: "bot-initial", role: "ASSISTANT", content: "How can I help you?" }]);
    } else {
      setMessages(data);
    }
  }

  // Start a new conversation
  async function startNewConversation() {
    const newConversation = await createConversation();
    setConversations([newConversation, ...conversations]);
    setCurrentConversationId(newConversation.id);

    // Immediately show the bot message
    setMessages([{ id: "bot-initial", role: "ASSISTANT", content: "How can I help you?" }]);
  }

  // Handle sending a message
  async function handleSendMessage() {
    if (!message.trim() || loading) return;

    setLoading(true);

    // Create conversation if none exists
    let conversationId = currentConversationId;
    if (!conversationId) {
      const newConversation = await createConversation();
      setConversations((prev) => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
      conversationId = newConversation.id;
    }

    const conversationIdString = conversationId as string;

    // Add user's message to UI immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: "USER",
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    // Send message to backend
    await sendMessage(conversationIdString, message);

    // Fetch updated messages from backend (includes bot message)
    setTimeout(async () => {
      const updatedMessages = await getMessages(conversationIdString);
      setMessages(updatedMessages);
      setLoading(false);
    }, 2000);
  }



  

  // Delete a conversation
  async function handleDeleteConversation(conversationId: string) {
    await deleteConversation(conversationId);
    setConversations(conversations.filter((c) => c.id !== conversationId));
    if (currentConversationId === conversationId) {
      setMessages([{ id: "bot-initial", role: "ASSISTANT", content: "How can I help you?" }]); 
      setCurrentConversationId(null);
    }
  }

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <main className="h-screen flex bg-white">
      {/* Sidebar */}
      <aside className="w-1/4 bg-gray-900 text-white p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold">ADAMANT CODE CHATBOT</h2>
        <button
          onClick={startNewConversation}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-md"
        >
          <PlusCircle size={20} />
          New Conversation
        </button>

        <div className="mt-4 flex flex-col gap-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${
                    conv.id === currentConversationId ? "bg-violet-700" : "bg-gray-800"
                  }`}
                  onClick={() => selectConversation(conv.id)}
                >
                  {/* Editable Conversation Name */}
                  <input
                    type="text"
                    className="bg-transparent text-white border-none outline-none w-full"
                    value={conv.name || "Untitled Conversation"}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setConversations((prev) =>
                        prev.map((c) => (c.id === conv.id ? { ...c, name: newName } : c))
                      );
                    }}
                    onBlur={async (e) => {
                      const finalName = e.target.value.trim() || "Untitled Conversation";
                      await renameConversation(conv.id, finalName);
                    }}
                  />

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conv.id);
                    }}
                    className="text-red-500"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}
          </div>

      </aside>

      {/* Chat Area */}
      <div className="w-3/4 flex flex-col h-full">
        <form
          className="h-full flex flex-col bg-[url('/images/bg.png')] bg-cover overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          {/* Chat Messages */}
          <div className="flex flex-col gap-5 p-10 h-full overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={msg.id ?? idx}
                ref={idx === messages.length - 1 ? lastMessageRef : null}
                className={`flex ${msg.role === "USER" ? "self-end" : ""} gap-2`}
              >
                {msg.role === "ASSISTANT" && (
                  <img src="images/assistant-avatar.png" className="h-12 w-12 rounded-full" />
                )}
                <div className="max-w-xl bg-white rounded-xl p-4 shadow-md">
                  <p className="text-sm font-medium text-violet-500">{msg.role === "USER" ? "You" : "Adamant BOT"}</p>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && <LoadingDots />}
          </div>

          {/* Chat Input */}
            <div className="w-full px-6 pb-4 flex items-center">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Reply to Adamant BOT"
                disabled={loading} // Disable input during loading
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault(); // Prevents new line
                    handleSendMessage();
                  }
                }}
                className={`w-full rounded-full p-3 border border-gray-300 ${
                  loading ? "bg-gray-200 cursor-not-allowed" : "bg-white"
                }`}
              />
              <button
                type="button"
                disabled={loading} // Disable button during loading
                onClick={handleSendMessage}
                className={`bg-violet-600 text-white rounded-full p-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Send size={20} />
              </button>
            </div>
        </form>
      </div>
    </main>
  );
}
