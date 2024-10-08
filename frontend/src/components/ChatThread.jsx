import React, { useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import AxiosInstance from "../utils/AxiosInstance";

const ChatThread = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (message) => {
    setLoading(true);

    try {
      if (messages.length === 0) {
        const response = await AxiosInstance.post('auth/chat-thread/');
        setMessages([
          { id: response.data.id, prompt: message, response: '', is_from_user: true }
        ]);
      } else {
        const threadId = messages[0].id;
        const response = await AxiosInstance.post('auth/messages/', {
          thread_id: threadId,
          prompt: message,
        });

        const newMessages = [
          ...messages,
          { id: messages.length + 1, prompt: message, response: '', is_from_user: true },
          {
            id: response.data.id,
            prompt: message,
            response: response.data.response,
            is_from_user: false,
          },
        ];

        setMessages(newMessages);
      }
    } catch (error) {
      alert('Error sending message');
      console.error('Error sending message:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <MessageList messages={messages} loading={loading} />
      <MessageInput onSendMessage={handleSendMessage} disabled={loading} />
    </div>
  );
};

export default ChatThread;
