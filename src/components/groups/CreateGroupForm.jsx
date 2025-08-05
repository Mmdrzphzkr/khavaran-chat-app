// src/components/groups/CreateGroupForm.jsx
"use client";

import { useState, useEffect } from "react";

const CreateGroupForm = ({ onGroupCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [contacts, setContacts] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch("/api/contacts");
        const data = await response.json();
        setContacts(data);
      } catch (err) {
        console.error("Failed to fetch contacts", err);
      }
    };
    fetchContacts();
  }, []);

  const handleMemberToggle = (contactId) => {
    setSelectedMembers((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedMembers.length === 0) {
      setError("Group name and at least one member are required.");
      return;
    }
    setError("");
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupName,
          members: selectedMembers,
        }),
      });

      if (!res.ok) throw new Error("Failed to create group");
      const newGroup = await res.json();
      onGroupCreated(newGroup);
      setGroupName("");
      setSelectedMembers([]);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-2 border-t mt-4">
      <h4 className="font-semibold">Create New Group</h4>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        className="w-full p-2 rounded border dark:bg-gray-700"
      />
      <div>
        <h5 className="font-medium">Select Members:</h5>
        <div className="max-h-32 overflow-y-auto">
          {contacts.map((contact) => (
            <div key={contact.id}>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(contact.userId)}
                  onChange={() => handleMemberToggle(contact.userId)}
                />
                <span>
                  {contact.firstName} {contact.lastName}
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>
      <button
        type="submit"
        className="w-full p-2 rounded bg-green-500 text-white hover:bg-green-600"
      >
        Create Group
      </button>
    </form>
  );
};

export default CreateGroupForm;
