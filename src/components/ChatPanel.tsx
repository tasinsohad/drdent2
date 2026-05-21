"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Send, Bot, User } from "lucide-react";
import type { Conversation, Message } from "@/app/dashboard/page";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

interface ChatPanelProps {
  conversation: Conversation | null;
  onModeChange: () => void;
  onMessageSent: () => void;
}

export default function ChatPanel({
  conversation,
  onModeChange,
  onMessageSent,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [togglingMode, setTogglingMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversation) {
      setMessages([]);
      return;
    }

    setLoading(true);
    fetch(`/api/conversations/${conversation.id}/messages`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [conversation?.id]);

  useEffect(() => {
    if (!conversation) return;

    const supabase = getSupabaseBrowser();
    const sub = supabase
      .channel(`messages-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !conversation || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversation.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input.trim() }),
      });

      if (res.ok) {
        setInput("");
        onMessageSent();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  async function handleModeToggle() {
    if (!conversation || togglingMode) return;

    const newMode = conversation.mode === "agent" ? "human" : "agent";
    setTogglingMode(true);

    try {
      await fetch(`/api/conversations/${conversation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode }),
      });
      onModeChange();
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingMode(false);
    }
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <MessageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Select a conversation</p>
          <p className="text-sm mt-1">
            Choose a conversation from the sidebar to view messages
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-semibold text-gray-900">
              {conversation.name || conversation.phone}
            </h2>
            <p className="text-sm text-gray-500">{conversation.phone}</p>
          </div>
        </div>

        <button
          onClick={handleModeToggle}
          disabled={togglingMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            conversation.mode === "agent"
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-orange-100 text-orange-700 hover:bg-orange-200"
          } disabled:opacity-50`}
        >
          <Bot className="w-4 h-4" />
          {togglingMode
            ? "Switching..."
            : conversation.mode === "agent"
              ? "Agent Mode"
              : "Human Mode"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No messages yet</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-md rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-white text-gray-900 rounded-tl-sm"
                    : "bg-green-600 text-white rounded-tr-sm"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {msg.role === "user" ? (
                    <User className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-green-200" />
                  )}
                  <span
                    className={`text-xs ${
                      msg.role === "user" ? "text-gray-400" : "text-green-200"
                    }`}
                  >
                    {msg.role === "user" ? "User" : "AI"}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
                <p
                  className={`text-xs mt-1 text-right ${
                    msg.role === "user" ? "text-gray-400" : "text-green-200"
                  }`}
                >
                  {format(new Date(msg.created_at), "h:mm a")}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

