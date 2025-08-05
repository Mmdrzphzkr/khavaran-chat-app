// src/components/groups/AddMemberForm.jsx
"use client";
import { useState, useEffect } from "react";

const AddMemberForm = ({ groupId, existingMembers, onMemberAdded }) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState("");

  useEffect(() => {
    const fetchContacts = async () => {
      const res = await fetch("/api/contacts");
      const allContacts = await res.json();

      // Create a Set of existing member IDs for efficient lookup
      const existingMemberIds = new Set(existingMembers.map((m) => m.userId));

      // Filter out contacts who are already members
      const availableContacts = allContacts.filter(
        (c) => !existingMemberIds.has(c.userId)
      );
      setContacts(availableContacts);
    };
    fetchContacts();
  }, [existingMembers]); // Re-run when the list of existing members changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedContact) return;

    const res = await fetch(`/api/groups/${groupId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedContact }),
    });

    if (res.ok) {
      const newMemberData = await res.json();
      // Find the full user object from contacts to pass up
      const contactDetails = contacts.find(
        (c) => c.userId === newMemberData.userId
      )?.user;
      onMemberAdded({ ...newMemberData, user: contactDetails });
      setSelectedContact(""); // Reset dropdown
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <select
        value={selectedContact}
        onChange={(e) => setSelectedContact(e.target.value)}
        className="flex-1 p-2 border rounded dark:bg-gray-700"
        disabled={contacts.length === 0}
      >
        <option value="">
          {contacts.length > 0
            ? "Select a contact to add"
            : "No contacts to add"}
        </option>
        {contacts.map((contact) => (
          <option key={contact.id} value={contact.userId}>
            {contact.firstName} {contact.lastName}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-green-500 text-white px-3 rounded hover:bg-green-600 disabled:bg-gray-400"
        disabled={!selectedContact}
      >
        Add
      </button>
    </form>
  );
};

export default AddMemberForm;
