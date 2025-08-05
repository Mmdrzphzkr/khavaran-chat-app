// src/app/chat/page.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import MessageList from "@/components/messages/MessageList";
import MessageInput from "@/components/messages/MessageInput";
import GroupMessageList from "@/components/groups/GroupMessageList";
import GroupMessageInput from "@/components/groups/GroupMessageInput";
import ContactPanel from "@/components/contacts/ContactPanel";
import GroupPanel from "@/components/groups/GroupPanel";
import EditGroupForm from "@/components/groups/EditGroupForm";
import { socket } from "@/lib/socket";
import Link from "next/link";

export default function ChatPage() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(socket);

  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState("contacts");
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [groups, setGroups] = useState([]); // ✅ Add state for groups here

  // Fetch groups and listen for updates
  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  };

  useEffect(() => {
    if (session) {
      fetchGroups();
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    socketRef.current.connect();
    socketRef.current.on("connect", () => setIsConnected(true));
    socketRef.current.on("disconnect", () => setIsConnected(false));
    return () => {
      socketRef.current.disconnect();
    };
  }, [session]);

  useEffect(() => {
    if (selectedChat) {
      const event =
        selectedChat.type === "private" ? "join-chat" : "join-group";
      socketRef.current.emit(event, selectedChat.id);
    }
  }, [selectedChat]);

  const handleSelectChat = (chatId) => {
    setSelectedChat({ id: chatId, type: "private" });
  };

  const handleSelectGroup = (group) => {
    setSelectedChat({ id: group.id, type: "group", data: group });
  };

  // ✅ This function will update both the selected chat and the main groups list
  const handleGroupUpdated = (updatedGroup) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
    setSelectedChat((prev) => ({ ...prev, data: updatedGroup }));
    setIsEditingGroup(false);
  };

  const handleGroupCreated = (newGroup) => {
    setGroups((prev) => [...prev, newGroup]);
  };

  const getAvatarUrl = (url) => {
    return url && url.trim() !== ""
      ? `${url}?cb=${Date.now()}`
      : "/no-profile.png";
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-6 max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Please sign in to chat
          </h2>
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

  const isGroupAdmin =
    selectedChat?.type === "group" &&
    selectedChat.data.adminId === session.user.id;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="w-80 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col">
        <div className="flex items-center space-x-2 mb-4">
          <img
            src={getAvatarUrl(session.user.image)}
            alt="User"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="font-medium">{session.user.name || "Unnamed"}</div>
          </div>
        </div>
        <Link
          href="/profile"
          className="my-1 text-center inline-block w-full p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
        >
          Profile
        </Link>
        <div className="flex border-b mb-2">
          <button
            onClick={() => setActiveTab("contacts")}
            className={`flex-1 p-2 ${
              activeTab === "contacts" ? "border-b-2 border-blue-500" : ""
            }`}
          >
            Contacts
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`flex-1 p-2 ${
              activeTab === "groups" ? "border-b-2 border-blue-500" : ""
            }`}
          >
            Groups
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "contacts" ? (
            <ContactPanel onSelectChat={handleSelectChat} />
          ) : (
            <GroupPanel
              groups={groups}
              onSelectGroup={handleSelectGroup}
              onGroupCreated={handleGroupCreated}
            />
          )}
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {selectedChat?.data?.name || "NextChat"}
          </h1>
          <div className="flex items-center space-x-4">
            {isGroupAdmin && (
              <button
                onClick={() => setIsEditingGroup(true)}
                className="text-sm bg-yellow-500 text-white p-2 rounded"
              >
                Edit Group & Members
              </button>
            )}
            <span
              className={`inline-block w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Sign Out
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!selectedChat && (
            <p className="text-gray-700 dark:text-gray-300">
              Select a chat or group to start messaging
            </p>
          )}
          {selectedChat?.type === "private" && (
            <MessageList chatId={selectedChat.id} />
          )}
          {selectedChat?.type === "group" && (
            <GroupMessageList group={selectedChat.data} />
          )}
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          {!selectedChat && (
            <p className="text-gray-700 dark:text-gray-300">
              Select a chat or group to start messaging
            </p>
          )}
          {selectedChat?.type === "private" && (
            <MessageInput chatId={selectedChat.id} />
          )}
          {selectedChat?.type === "group" && (
            <GroupMessageInput groupId={selectedChat.id} />
          )}
        </div>
      </div>
      {isEditingGroup && (
        <EditGroupForm
          group={selectedChat.data}
          onGroupUpdated={handleGroupUpdated}
          onCancel={() => setIsEditingGroup(false)}
        />
      )}
    </div>
  );
}
