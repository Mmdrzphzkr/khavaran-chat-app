"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import MessageList from "@/components/messages/MessageList";
import MessageInput from "@/components/messages/MessageInput";
import ContactPanel from "@/components/contacts/ContactPanel";
import { socket } from "@/lib/socket";
import Link from "next/link";

export default function ChatPage() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(socket);
  const [selectedChatId, setSelectedChatId] = useState(null);

  useEffect(() => {
    if (!session) return;

    socketRef.current.connect();
    socketRef.current.on("connect", () => {
      console.log("Connected to Socket.IO server:", socketRef.current.id);
      setIsConnected(true);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setIsConnected(false);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
      setIsConnected(false);
    });

    return () => {
      socketRef.current.disconnect();
      socketRef.current.off("connect");
      socketRef.current.off("connect_error");
      socketRef.current.off("disconnect");
    };
  }, [session]);

  useEffect(() => {
    if (selectedChatId) {
      socketRef.current.emit("join-chat", selectedChatId);
    }
  }, [selectedChatId]);

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
  };

  const getAvatarUrl = (url) => {
    return url && url.trim() !== "" ? `${url}?cb=${Date.now()}` : "/no-profile.png";
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-6 max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Please sign in to chat
          </h2>
          <button
            onClick={() => signIn()}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="w-80 border-r border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <img
            src={getAvatarUrl(session.user.image)}
            alt="User"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="text-gray-800 dark:text-gray-100">
            <div className="font-medium">{session.user.name || "Unnamed"}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">You</div>
          </div>
        </div>
        <Link
          href="/profile"
          className="my-1 text-center inline-block w-full p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Profile
        </Link>
        <ContactPanel onSelectChat={handleSelectChat} />
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            NextChat
          </h1>
          <div className="flex items-center space-x-4">
            <span
              className={`inline-block w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Sign Out
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedChatId ? (
            <MessageList chatId={selectedChatId} />
          ) : (
            <p className="text-gray-700 dark:text-gray-300">
              Select a chat to start messaging
            </p>
          )}
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          {selectedChatId ? (
            <MessageInput chatId={selectedChatId} />
          ) : (
            <p className="text-gray-700 dark:text-gray-300">
              Select a chat to start messaging
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
