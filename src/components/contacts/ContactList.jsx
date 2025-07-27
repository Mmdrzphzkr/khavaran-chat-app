"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const ContactList = ({ searchQuery, onSelectChat, contacts }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingContact, setEditingContactState] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const { data: session } = useSession();

  const [localContacts, setLocalContacts] = useState(contacts);

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

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchContacts();
  }, [searchQuery]);

  const handleContactClick = async (contactId) => {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contactId }),
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

  const getAvatarUrl = (url) => {
    return url && url.trim() !== ""
      ? `${url}?cb=${Date.now()}`
      : "/no-profile.png";
  };

  const setEditingContact = (contact) => {
    setEditingContactState(contact);
    setEditForm({
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      phone: contact.phone || "",
      email: contact.email || "",
    });
  };

  const handleUpdateContact = async (e, contactId) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error("Update failed");

      setEditingContactState(null);
      await fetchContacts(); // ✅ Re-fetch contacts to include updated user.image
    } catch (err) {
      console.error("Update error", err);
    }
  };

  if (loading)
    return (
      <p className="text-gray-700 dark:text-gray-300">Loading contacts...</p>
    );
  if (error) return <p className="text-red-600 dark:text-red-400">{error}</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
        Contacts
      </h3>
      <ul className="space-y-2">
        {localContacts.map((contact) => (
          <li
            key={contact.id}
            className="flex flex-col bg-gray-100 dark:bg-gray-700 p-2 rounded"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={getAvatarUrl(contact.user?.image)}
                  alt={contact.firstName}
                  className="w-8 h-8 rounded-full object-cover mr-2"
                />
                <span
                  onClick={() => handleContactClick(contact.id)}
                  className="cursor-pointer text-gray-700 dark:text-gray-300"
                >
                  {contact.firstName} {contact.lastName}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingContact(contact)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>

            {editingContact?.id === contact.id && (
              <form
                onSubmit={(e) => handleUpdateContact(e, contact.id)}
                className="mt-2 space-y-1"
              >
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, firstName: e.target.value })
                  }
                  className="w-full p-1 border rounded"
                  placeholder="First Name"
                />
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastName: e.target.value })
                  }
                  className="w-full p-1 border rounded"
                  placeholder="Last Name"
                />
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full p-1 border rounded"
                  placeholder="Email"
                />
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full p-1 border rounded"
                  placeholder="Phone"
                />
                <button
                  type="submit"
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Save
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactList;
