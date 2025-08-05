// src/components/messages/ChatMessageItem.jsx
import React from "react";

const ChatMessageItem = ({ message, currentUserId }) => {
  const isSender = message.senderId === currentUserId;

  const getAvatarUrl = (url) => {
    return url && url.trim() !== ""
      ? `${url}?cb=${Date.now()}`
      : "/no-profile.png";
  };

  const renderMessageContent = () => {
    const regex = /📁 \[(.+?)\]\((.+?)\)/;
    const match = message.content?.match(regex);
    if (match && match[1] && match[2]) {
      const fileName = match[1];
      const fileUrl = match[2];
      return (
        <a
          href={fileUrl}
          download
          className="text-blue-300 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          📁 {fileName}
        </a>
      );
    }
    return message.content;
  };

  return (
    <div
      className={`flex items-start gap-2.5 ${isSender ? "justify-end" : ""}`}
    >
      {!isSender && (
        <img
          className="w-8 h-8 rounded-full object-cover"
          src={getAvatarUrl(message.sender?.image)}
          alt={message.sender?.name}
        />
      )}
      <div
        className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 rounded-e-xl rounded-es-xl ${
          isSender
            ? "bg-blue-600 text-white rounded-s-xl rounded-es-none"
            : "bg-gray-100 dark:bg-gray-700"
        }`}
      >
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="text-sm font-semibold">
            {message.sender?.name || "User"}
          </span>
          <span className="text-xs font-normal text-gray-400">
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm font-normal py-2.5">{renderMessageContent()}</p>
      </div>
    </div>
  );
};

export default ChatMessageItem;
