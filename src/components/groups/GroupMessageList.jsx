// src/components/messages/GroupMessageList.jsx
"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import ChatMessageItem from "../messages/ChatMessageItem";
import { socket } from "@/lib/socket";

const GroupMessageList = ({ group }) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState(""); // ✅ State for search

  useEffect(() => {
    const fetchMessages = async () => {
      // ✅ Pass search query to the API
      const res = await fetch(
        `/api/group-messages?groupId=${group.id}&query=${searchQuery}`
      );
      const data = await res.json();
      setMessages(data);
    };
    if (group) {
      fetchMessages();
    }
  }, [group, searchQuery]); // ✅ Re-fetch when search query changes

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      if (newMessage.groupId === group?.id) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    socket.on("receive-group-message", handleNewMessage);
    return () => {
      socket.off("receive-group-message", handleNewMessage);
    };
  }, [group?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!group) return null;

  return (
    <div>
      {/* ✅ Search Input */}
      <input
        type="text"
        placeholder="Search group messages..."
        className="mb-2 p-2 w-full rounded border dark:bg-gray-700"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="space-y-4">
        {messages.map((msg) => (
          <ChatMessageItem
            key={msg.id}
            message={msg}
            currentUserId={session.user.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default GroupMessageList;
