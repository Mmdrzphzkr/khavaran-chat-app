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

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(`/api/group-messages?groupId=${group.id}`);
      const data = await res.json();
      setMessages(data);
    };
    if (group) {
      fetchMessages();
    }
  }, [group]);

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
  );
};

export default GroupMessageList;
