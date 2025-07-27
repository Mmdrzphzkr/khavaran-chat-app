import { useEffect, useState } from "react";

const MessageItem = ({ message }) => {
  const [sender, setSender] = useState(null);

  useEffect(() => {
    async function fetchSender() {
      try {
        const res = await fetch(`/api/user/${message.senderId}`);
        if (res.ok) {
          const data = await res.json();
          setSender(data);
        }
      } catch (error) {
        console.error("Failed to fetch sender", error);
      }
    }

    fetchSender();
  }, [message.senderId]);

  const getAvatarUrl = (url) => {
    return url && url.trim() !== ""
      ? `${url}?cb=${Date.now()}`
      : "/no-profile.png";
  };

  const renderMessage = () => {
    const regex = /📁 \[(.+?)\]\((.+?)\)/;
    const match = message.content?.match(regex);
    if (match && match[1] && match[2]) {
      const fileName = match[1];
      const fileUrl = match[2];
      return (
        <a
          href={fileUrl}
          download
          className="text-blue-600 underline hover:text-blue-800"
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
    <div className="flex items-start space-x-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
      <img
        src={getAvatarUrl(sender?.image)}
        alt="Sender"
        className="w-8 h-8 rounded-full object-cover"
      />
      <div>
        <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {sender?.name || message.senderId}
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {renderMessage()}
        </div>
        <div className="text-xs text-gray-400">
          {new Date(message.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
