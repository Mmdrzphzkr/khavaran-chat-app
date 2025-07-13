"use client";
import { useEffect, useState, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import io from "socket.io-client";
import MessageList from "@/components/messages/MessageList";
import MessageInput from "@/components/messages/MessageInput";
import ContactPanel from "@/components/contacts/ContactPanel";

export default function ChatPage() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef();
  const [selectedChatId, setSelectedChatId] = useState(null);

  useEffect(() => {
    if (!session) return;

    socketRef.current = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
      {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    socketRef.current.on("connect", () => {
      setIsConnected(true);
    });

    socketRef.current.on("disconnect", () => setIsConnected(false));
    socketRef.current.on("receive-message", () => {});

    return () => {
      socketRef.current?.disconnect();
    };
  }, [session]);

  // Function to handle chat selection
  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-6 max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Please sign in to chat</h2>
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
      {/* Contact Panel */}
      <aside className="w-80 border-r border-gray-200 dark:border-gray-700 p-4">
        <ContactPanel onSelectChat={handleSelectChat} />
      </aside>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">NextChat</h1>
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedChatId ? (
            <MessageList chatId={selectedChatId} />
          ) : (
            <p className="text-gray-700 dark:text-gray-300">Select a chat to start messaging</p>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          {selectedChatId ? (
            <MessageInput chatId={selectedChatId} />
          ) : (
            <p className="text-gray-700 dark:text-gray-300">Select a chat to start messaging</p>
          )}
        </div>
      </div>
    </div>
  );
}

