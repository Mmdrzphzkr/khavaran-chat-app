// src/components/groups/EditGroupForm.jsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import GroupMemberList from "./GroupMemberList";
import AddMemberForm from "./AddMemberForm";

const EditGroupForm = ({ group, onGroupUpdated, onCancel }) => {
  const { data: session } = useSession();
  const [name, setName] = useState(group.name);
  const [image, setImage] = useState(group.image);
  const [preview, setPreview] = useState(group.image);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);

  // ✅ Fetch the initial list of members when the form opens
  useEffect(() => {
    const fetchGroupDetails = async () => {
      const res = await fetch(`/api/groups/${group.id}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members);
      }
    };
    fetchGroupDetails();
  }, [group.id]);

  const getAvatarUrl = (url) => {
    return url && url.trim() !== "" ? url : "/no-profile.png";
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setImage(data.url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/groups/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: group.id, name, image }),
    });

    if (res.ok) {
      const updatedGroup = await res.json();
      onGroupUpdated({ ...updatedGroup, members });
    }
    setLoading(false);
  };

  const handleMemberAdded = (newMember) => {
    setMembers((prev) => [...prev, newMember]);
  };

  const handleMemberRemoved = (removedUserId) => {
    setMembers((prev) => prev.filter((m) => m.userId !== removedUserId));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Edit Group Details</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded border dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Group Image</label>
            <img
              src={getAvatarUrl(preview)}
              alt="Group Preview"
              className="w-24 h-24 rounded-full my-2 object-cover border"
            />
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        <hr className="my-6 border-gray-300 dark:border-gray-600" />

        <GroupMemberList
          members={members}
          adminId={group.adminId}
          groupId={group.id}
          onMemberRemoved={handleMemberRemoved}
          session={session}
        />
        {session?.user.id === group.adminId && (
          <AddMemberForm
            groupId={group.id}
            existingMembers={members}
            onMemberAdded={handleMemberAdded}
          />
        )}
        <button
          type="button"
          onClick={onCancel}
          className="w-full mt-6 bg-gray-300 dark:bg-gray-600 p-2 rounded hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default EditGroupForm;
