import React from 'react';
import Message from './Message';

type MessageListProps = {
  messages: any[];
  currentUserId: string | undefined;
};

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  if (!messages.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            className="w-8 h-8 text-indigo-600"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
            />
          </svg>
        </div>
        <p className="text-gray-500 text-center">No messages yet</p>
        <p className="text-gray-400 text-sm text-center mt-1">
          Send a message to start the conversation
        </p>
      </div>
    );
  }
  
  // Group messages by date
  const groupedMessages: Record<string, any[]> = {};
  
  messages.forEach(message => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });
  
  return (
    <div className="space-y-6">
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date}>
          <div className="flex justify-center mb-4">
            <div className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
              {date === new Date().toLocaleDateString() ? 'Today' : date}
            </div>
          </div>
          
          <div className="space-y-2">
            {msgs.map((message, index) => (
              <Message
                key={message._id}
                message={message}
                isOwnMessage={message.sender._id === currentUserId}
                showAvatar={
                  index === 0 || 
                  msgs[index - 1].sender._id !== message.sender._id
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;