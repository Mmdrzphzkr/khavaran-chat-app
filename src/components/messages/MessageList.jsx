import { useEffect, useState } from "react";
import MessageItem from "./MessageItem";
import { socket } from "@/lib/socket";

const MessageList = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
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
    socket.on("receive-message", (newMessage) => {
      if (newMessage.chatId === chatId) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });
    return () => {
      socket.off("receive-message");
    };
  }, [chatId]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search messages..."
        className="mb-2 p-2 w-full rounded border dark:bg-gray-700 dark:text-white"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <ul className="space-y-2">
        {messages.map((message) => (
          <li key={message.id}>
            <MessageItem message={message} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessageList;
