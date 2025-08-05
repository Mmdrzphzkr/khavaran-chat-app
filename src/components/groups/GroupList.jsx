// src/components/groups/GroupList.jsx
"use client";

const GroupList = ({ groups, loading, onSelectGroup }) => {
  const getAvatarUrl = (url) => {
    return url && url.trim() !== "" ? url : "/no-profile.png";
  };

  if (loading) return <p>Loading groups...</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
        Groups
      </h3>
      <ul className="space-y-2">
        {groups.map((group) => (
          <li
            key={group.id}
            onClick={() => onSelectGroup(group)}
            className="flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <img
              src={getAvatarUrl(group.image)}
              alt={group.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span>{group.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupList;
