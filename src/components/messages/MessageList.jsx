// src/components/messages/MessageList.jsx
'use client';

import { useState, useEffect } from 'react';
import MessageItem from './MessageItem';

const MessageList = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    console.log("MessageList useEffect triggered. ChatId:", chatId, "SearchQuery:", searchQuery); // ADD THIS LINE

    const fetchMessages = async () => {
      // Implement API endpoint and call here
      const response = await fetch(`/api/messages?chatId=${chatId}&query=${searchQuery}`);
      const data = await response.json();
      setMessages(data);
    };

    fetchMessages();
  }, [chatId, searchQuery]);

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
          <MessageItem key={message.id} message={message} />
        ))}
      </ul>
    </div>
  );
};

export default MessageList;

