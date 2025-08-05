// src/components/messages/GroupMessageInput.jsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket";

const GroupMessageInput = ({ groupId }) => {
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
        messageContent = `📁 [${fileName}](${url})`;
        isFile = true;
      }

      const message = {
        groupId,
        content: messageContent,
        isFile,
      };

      // Send via HTTP API to persist
      await fetch("/api/group-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });

      setContent("");
      setFile(null);
    } catch (error) {
      console.error("Error sending group message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input type="file" onChange={handleFileChange} disabled={loading} />
      <input
        type="text"
        placeholder="Type a group message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={file !== null || loading}
        className="flex-1 p-2 border rounded dark:bg-gray-700"
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

export default GroupMessageInput;
