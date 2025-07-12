"use client";
import { useEffect, useState, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import io from "socket.io-client";

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef();

  // Initialize socket connection
  useEffect(() => {
    if (!session) return;

    socketRef.current = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
      {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      loadMessages();
    });

    socketRef.current.on("disconnect", () => setIsConnected(false));
    socketRef.current.on("receive-message", handleNewMessage);

    return () => {
      socketRef.current?.off("receive-message", handleNewMessage);
      socketRef.current?.disconnect();
    };
  }, [session]);

  // Load initial messages
  const loadMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  // Handle incoming messages
  const handleNewMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  // Send message handler
  const sendMessage = async () => {
    if (!message.trim() || !session?.user) return;

    const newMessage = {
      text: message,
      senderId: session.user.id,
      senderName: session.user.name,
      createdAt: new Date().toISOString(),
    };

    try {
      // Save to database
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });

      // Emit via socket
      socketRef.current?.emit("send-message", newMessage);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // File upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !session?.user) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("senderId", session.user.id);
      formData.append("senderName", session.user.name);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const { url, fileName } = await res.json();
      const newMessage = {
        text: `📁 [${fileName}](${url})`,
        senderId: session.user.id,
        senderName: session.user.name,
        createdAt: new Date().toISOString(),
        isFile: true,
      };

      socketRef.current?.emit("send-message", newMessage);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="p-6 max-w-sm w-full bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Please sign in to chat</h2>
          <button
            onClick={() => signIn()}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">NextChat</h1>
        <div className="flex items-center space-x-4">
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          <button
            onClick={() => signOut()}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.senderId === session.user.id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                msg.senderId === session.user.id
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-gray-200"
              }`}
            >
              <p className="font-medium">{msg.senderName}</p>
              {msg.isFile ? (
                <a
                  href={msg.text.match(/\((.*?)\)/)[1]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-100 hover:underline"
                >
                  {msg.text.match(/\[(.*?)\]/)[1]}
                </a>
              ) : (
                <p>{msg.text}</p>
              )}
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept="image/*, .pdf, .doc, .docx"
            />
            <label
              htmlFor="file-upload"
              className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
              title="Attach file"
            >
              <svg
                className="w-6 h-6 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </label>
          </div>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
