"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Settings, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { Conversation } from "@/app/dashboard/page";

interface SidebarProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}

export default function Sidebar({
  conversations,
  selectedId,
  onSelect,
  loading,
}: SidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-600" />
          Conversations
        </h1>
        <Link
          href="/dashboard/settings"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-gray-500" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-400">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">
              Messages will appear here when users text you
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full p-4 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors ${
                selectedId === conv.id ? "bg-green-50 border-l-4 border-l-green-500" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate">
                      {conv.name || conv.phone}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        conv.mode === "agent"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {conv.mode === "agent" ? "AI" : "Human"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">
                    {conv.last_message?.content || "No messages yet"}
                  </p>
                </div>
                {conv.last_message?.created_at && (
                  <span className="text-xs text-gray-400 ml-2 shrink-0">
                    {formatDistanceToNow(new Date(conv.last_message.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
