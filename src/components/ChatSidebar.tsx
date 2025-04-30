import React, { useState } from 'react';
import { Search, Users, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import UsersList from './UsersList';
import ChatListItem from './ChatListItem';

type ChatSidebarProps = {
  chats: any[];
  currentChat: any | null;
  onChatSelect: (chat: any) => void;
  onClose: () => void;
};

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  chats, 
  currentChat, 
  onChatSelect,
  onClose
}) => {
  const { user, logout } = useAuth();
  const { users, createChat } = useChat();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  
  const handleUserSelect = async (userId: string) => {
    try {
      const newChat = await createChat(userId);
      onChatSelect(newChat);
      setShowUsers(false);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };
  
  const handleLogout = async () => {
    await logout();
  };
  
  const filteredChats = chats.filter(chat => {
    // Find the other user in the chat (not the current user)
    const otherUser = chat.participants.find(
      (p: any) => p._id !== user?.id
    );
    
    if (!otherUser) return false;
    
    return otherUser.username.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowUsers(!showUsers)}
            className="text-gray-600 hover:text-indigo-600"
            title="New message"
          >
            <Users size={22} />
          </button>
          <button 
            onClick={handleLogout}
            className="text-gray-600 hover:text-indigo-600"
            title="Logout"
          >
            <LogOut size={22} />
          </button>
          <button 
            onClick={onClose}
            className="md:hidden text-gray-600"
          >
            <X size={22} />
          </button>
        </div>
      </div>
      
      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={18} className="text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search messages"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      
      {/* User List */}
      {showUsers ? (
        <UsersList users={users} onSelectUser={handleUserSelect} onClose={() => setShowUsers(false)} />
      ) : (
        /* Chat List */
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length > 0 ? (
            filteredChats.map(chat => (
              <ChatListItem
                key={chat._id}
                chat={chat}
                isActive={currentChat?._id === chat._id}
                currentUserId={user?.id}
                onClick={() => onChatSelect(chat)}
              />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'No chats match your search' : 'No conversations yet'}
            </div>
          )}
        </div>
      )}
      
      {/* User Info */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold mr-3">
          {user?.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-gray-800">{user?.username}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;