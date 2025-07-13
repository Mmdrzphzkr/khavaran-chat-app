// src/components/contacts/ContactSearch.jsx
'use client';

import { useState } from 'react';

const ContactSearch = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery);
  };

  return (
    <input
      type="text"
      placeholder="Search contacts..."
      value={query}
      onChange={handleChange}
      className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};

export default ContactSearch;