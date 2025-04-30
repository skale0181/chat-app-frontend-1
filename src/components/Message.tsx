import React from 'react';
import { formatTime } from '../utils/dateUtils';
import FilePreview from './FilePreview';

type MessageProps = {
  message: any;
  isOwnMessage: boolean;
  showAvatar: boolean;
};

const Message: React.FC<MessageProps> = ({ message, isOwnMessage, showAvatar }) => {
  const time = formatTime(new Date(message.createdAt));
  const isRead = message.readBy && message.readBy.length > 1;
  
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      {!isOwnMessage && showAvatar && (
        <div className="flex-shrink-0 mr-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs">
            {message.sender.username.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      
      {!isOwnMessage && !showAvatar && <div className="w-8 mr-2"></div>}
      
      <div className={`max-w-[75%] sm:max-w-[60%] md:max-w-[50%]`}>
        <div
          className={`rounded-lg px-4 py-2 inline-block ${
            isOwnMessage
              ? 'bg-indigo-600 text-white rounded-br-none'
              : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
          }`}
        >
          {message.contentType === 'text' ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <FilePreview 
              contentType={message.contentType} 
              fileUrl={message.fileUrl} 
              fileName={message.fileName} 
              fileSize={message.fileSize} 
            />
          )}
        </div>
        
        <div className={`flex items-center text-xs mt-1 ${isOwnMessage ? 'justify-end' : ''}`}>
          <span className="text-gray-500">{time}</span>
          
          {isOwnMessage && (
            <span className="ml-1 text-gray-500">
              {isRead ? (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-blue-500"
                >
                  <path d="M18 6L7 17l-5-5" />
                  <path d="M22 10L11 21l-5-5" />
                </svg>
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;