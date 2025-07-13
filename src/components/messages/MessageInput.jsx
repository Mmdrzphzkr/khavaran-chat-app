'use client';

import { useState } from 'react';

const MessageInput = ({ chatId }) => {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null); // State for file
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    if (file) {
      // Upload the file
      const formData = new FormData();
      formData.append('file', file);

      try {
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          console.error('File upload failed');
          setLoading(false);
          return;
        }

        const { url, fileName } = await uploadResponse.json();
        await sendMessage(`📁 [${fileName}](${url})`, true);
      } catch (error) {
        console.error('Error uploading file:', error);
        setLoading(false);
      }
    } else if (content.trim()) {
      // Send text message
      await sendMessage(content, false);
    }

    setLoading(false);
    setContent('');
    setFile(null);
  };

  const sendMessage = async (messageContent, isFile) => {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatId: chatId, content: messageContent, isFile }),
    });

    if (response.ok) {
      setContent('');
      setFile(null);
    } else {
      console.error('Failed to send message');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*, .pdf, .doc, .docx, audio/*" // Accept audio files
        onChange={handleFileChange}
      />
      <input
        type="text"
        placeholder="Type your message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={file !== null || loading} // Disable input if file is selected or loading
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
};

export default MessageInput;