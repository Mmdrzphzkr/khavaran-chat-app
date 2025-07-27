"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket";

const MessageInput = ({ chatId }) => {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.id || (!content.trim() && !file)) return;

    setLoading(true);

    try {
      let messageContent = content;
      let isFile = false;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const { url, fileName } = await uploadResponse.json();
        console.log("Upload returned:", { url, fileName });

        messageContent = `📁 [${fileName}](${url})`;
        isFile = true;
      }

      const message = {
        chatId,
        content: messageContent,
        senderId: session.user.id,
        isFile,
      };

      socket.emit("send-message", message);

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        console.error("Failed to send message");
      } else {
        setContent("");
        setFile(null);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="file"
        accept="image/*,.pdf,.doc,.docx,audio/*"
        onChange={handleFileChange}
        disabled={loading}
      />
      <input
        type="text"
        placeholder="Type your message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={file !== null || loading}
        className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-gray-100"
      />
      <button
        type="submit"
        disabled={loading}
        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </form>
  );
};

export default MessageInput;
