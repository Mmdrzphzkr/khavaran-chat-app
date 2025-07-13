// src/components/contacts/ContactPanel.jsx
import ContactList from "./ContactList";
import ContactSearch from "./ContactSearch";
import AddContactForm from "./AddContactForm";
import { useState } from "react";

const ContactPanel = ({ onSelectChat }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState([]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleContactAdded = (newContact) => {
    setContacts((prevContacts) => [...prevContacts, newContact]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <ContactSearch onSearch={handleSearch} />
      <AddContactForm onContactAdded={handleContactAdded} />
      <ContactList
        searchQuery={searchQuery}
        onSelectChat={onSelectChat}
        contacts={contacts}
      />
    </div>
  );
};

export default ContactPanel;
