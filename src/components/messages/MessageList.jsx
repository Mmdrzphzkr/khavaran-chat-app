// src/components/messages/MessageList.jsx
"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import ChatMessageItem from "./ChatMessageItem";
import { socket } from "@/lib/socket";

const MessageList = ({ chatId }) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) return;
      try {
        const response = await fetch(
          `/api/messages?chatId=${chatId}&query=${searchQuery}`
        );
        if (!response.ok) throw new Error("Failed to fetch messages");
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Message fetch error:", error);
      }
    };

    fetchMessages();
  }, [chatId, searchQuery]);

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      if (newMessage.chatId === chatId) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on("receive-message", handleNewMessage);

    return () => {
      socket.off("receive-message", handleNewMessage);
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search messages..."
        className="mb-2 p-2 w-full rounded border dark:bg-gray-700"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="space-y-4">
        {messages.map((message) => (
          <ChatMessageItem
            key={message.id}
            message={message}
            currentUserId={session.user.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
