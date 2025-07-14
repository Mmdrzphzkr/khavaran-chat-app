// src/components/messages/MessageItem.jsx
const MessageItem = ({ message }) => {
  return (
    <div>
      {message.isFile ? (
        <a
          href={message.content.match(/\((.*?)\)/)[1]}
          target="_blank"
          rel="noopener noreferrer"
        >
          {message.content.match(/\[(.*?)\]/)[1]}
        </a>
      ) : (
        message.content
      )}
      - {message.senderId} - {message.createdAt}
    </div>
  );
};

export default MessageItem;
