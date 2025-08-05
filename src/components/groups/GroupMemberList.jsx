// src/components/groups/GroupMemberList.jsx
"use client";

const GroupMemberList = ({
  members,
  adminId,
  groupId,
  onMemberRemoved,
  session,
}) => {
  const handleRemoveMember = async (userId) => {
    if (adminId === userId) {
      alert("Admin cannot be removed.");
      return;
    }

    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        onMemberRemoved(userId);
      } else {
        throw new Error("Failed to remove member");
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const getAvatarUrl = (url) => {
    return url && url.trim() !== "" ? url : "/no-profile.png";
  };

  return (
    <div className="mt-4">
      <h4 className="font-semibold">Members ({members.length})</h4>
      <ul className="space-y-2 mt-2 max-h-40 overflow-y-auto">
        {members.map(({ user }) => (
          <li
            key={user.id}
            className="flex items-center justify-between p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="flex items-center space-x-2">
              <img
                src={getAvatarUrl(user.image)}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span>
                {user.name}{" "}
                {user.id === adminId && (
                  <span className="text-xs text-green-500">(Admin)</span>
                )}
              </span>
            </div>
            {adminId === session.user.id && user.id !== adminId && (
              <button
                onClick={() => handleRemoveMember(user.id)}
                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupMemberList;
