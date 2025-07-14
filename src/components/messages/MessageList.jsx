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
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
  }, [chatId, searchQuery]);

  useEffect(() => {
    socket.on("receive-message", (newMessage) => {
      if (newMessage.chatId === chatId) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, [chatId]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search messages"
        value={searchQuery}
        onChange={handleSearch}
      />
      <ul>
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
