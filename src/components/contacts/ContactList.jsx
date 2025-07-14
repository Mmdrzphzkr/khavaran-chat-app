// src/components/contacts/ContactList.jsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const ContactList = ({ searchQuery, onSelectChat, contacts }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();

  const [localContacts, setLocalContacts] = useState(contacts);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchContacts = async () => {
      try {
        const response = await fetch(`/api/contacts?query=${searchQuery}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setLocalContacts(data);
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
        setError("Failed to fetch contacts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [searchQuery]);

  const handleContactClick = async (contactId) => {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contactId: contactId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      onSelectChat(data.chatId);
    } catch (error) {
      console.error("Error getting or creating chat:", error);
      setError("Failed to start chat. Please try again.");
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setLocalContacts((prevContacts) =>
        prevContacts.filter((contact) => contact.id !== contactId)
      );
    } catch (error) {
      console.error("Failed to delete contact:", error);
      setError("Failed to delete contact. Please try again.");
    }
  };

  if (loading) {
    return (
      <p className="text-gray-700 dark:text-gray-300">Loading contacts...</p>
    );
  }

  if (error) {
    return <p className="text-red-600 dark:text-red-400">{error}</p>;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
        Contacts
      </h3>
      <ul className="space-y-2">
        {localContacts.map((contact) => (
          <li
            key={contact.id}
            className="flex items-center justify-between p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <span
              onClick={() => handleContactClick(contact.id)}
              className="cursor-pointer text-gray-700 dark:text-gray-300"
            >
              {contact.firstName} {contact.lastName}
            </span>
            <button
              onClick={() => handleDeleteContact(contact.id)}
              className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactList;
