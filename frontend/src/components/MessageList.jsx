import React from 'react';
import './Profile.css';

const MessageList = ({ messages, loading }) => {
  return (
    <div className="chat-container">
      {loading && <p>Loading...</p>}
      {messages.length === 0 ? (
        <p>No messages yet. Try sending a prompt.</p>
      ) : (
        messages.map((message, index) => (
          <div
            key={index}
            className={`chat-bubble ${message.is_from_user ? 'user' : 'assistant'}`}
          >
            <strong>{message.is_from_user ? 'You' : 'Echo Assistant'}:</strong> {message.prompt || ''}
          </div>
        ))
      )}
    </div>
  );
};

export default MessageList;
