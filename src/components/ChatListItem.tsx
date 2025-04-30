import React from 'react';
import { formatDistanceToNow } from '../utils/dateUtils';

type ChatListItemProps = {
  chat: any;
  isActive: boolean;
  currentUserId: string;
  onClick: () => void;
};

const ChatListItem: React.FC<ChatListItemProps> = ({ 
  chat, 
  isActive, 
  currentUserId,
  onClick 
}) => {
  // Find the other user in the chat (not the current user)
  const otherUser = chat.participants.find(
    (p: any) => p._id !== currentUserId
  );
  
  if (!otherUser) return null;
  
  // Calculate unread count for current user
  const unreadCount = chat.unreadCount ? (chat.unreadCount[currentUserId] || 0) : 0;
  
  // Get last message for preview
  const lastMessage = chat.lastMessage;
  const lastMessageText = lastMessage
    ? lastMessage.contentType === 'text'
      ? lastMessage.content
      : lastMessage.contentType === 'image'
      ? '🖼️ Image'
      : lastMessage.contentType === 'video'
      ? '🎬 Video'
      : '📎 File'
    : 'No messages yet';
  
  // Format timestamp
  const timestamp = lastMessage
    ? formatDistanceToNow(new Date(lastMessage.createdAt))
    : '';
  
  return (
    <div
      className={`px-4 py-3 flex items-center border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
        isActive ? 'bg-indigo-50' : ''
      }`}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
          {otherUser.username.charAt(0).toUpperCase()}
        </div>
        {otherUser.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </div>
      
      {/* Content */}
      <div className="ml-3 flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold text-gray-800 truncate">{otherUser.username}</h3>
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 truncate">{lastMessageText}</p>
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;