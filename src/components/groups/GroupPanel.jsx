// src/components/groups/GroupPanel.jsx
import GroupList from "./GroupList";
import CreateGroupForm from "./CreateGroupForm";

const GroupPanel = ({ groups, onSelectGroup, onGroupCreated }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <GroupList groups={groups} onSelectGroup={onSelectGroup} />
      <CreateGroupForm onGroupCreated={onGroupCreated} />
    </div>
  );
};

export default GroupPanel;
