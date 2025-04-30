import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';
import EmptyState from '../components/EmptyState';

const Chat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { user, isAuthenticated } = useAuth();
  const { 
    chats, 
    currentChat, 
    setCurrentChat, 
    fetchChats, 
    markChatAsRead 
  } = useChat();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [readChats, setReadChats] = useState<Set<string>>(new Set()); // ✅ Added state to track

  // Initial chat loading
  useEffect(() => {
    if (isAuthenticated) {
      fetchChats();
    }
  }, [isAuthenticated]);

  // Set current chat based on URL param
  useEffect(() => {
    if (chats.length > 0) {
      if (id) {
        const chat = chats.find(chat => chat._id === id);
        if (chat) {
          setCurrentChat(chat);

          // ✅ Prevent repeated mark as read
          if (!readChats.has(chat._id)) {
            markChatAsRead(chat._id);
            setReadChats(prev => new Set(prev).add(chat._id));
          }

        } else {
          navigate('/chat', { replace: true });
          toast.error('Chat not found');
        }
      } else if (!currentChat && chats.length > 0) {
        setCurrentChat(null);
      }
    }
  }, [id, chats]);

  // Handle chat selection
  const handleChatSelect = (chat: any) => {
    setCurrentChat(chat);
    navigate(`/chat/${chat._id}`);

    // ✅ Prevent repeated mark as read
    if (!readChats.has(chat._id)) {
      markChatAsRead(chat._id);
      setReadChats(prev => new Set(prev).add(chat._id));
    }

    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } md:block md:w-80 lg:w-96 bg-white border-r border-gray-200 h-full z-10 ${
          isMobileMenuOpen ? 'absolute md:relative w-full md:w-80 lg:w-96' : ''
        }`}
      >
        <ChatSidebar 
          chats={chats} 
          currentChat={currentChat} 
          onChatSelect={handleChatSelect} 
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>
      
      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col h-full">
        {currentChat ? (
          <ChatWindow 
            chat={currentChat} 
            toggleSidebar={toggleMobileMenu} 
            isMobileSidebarOpen={isMobileMenuOpen}
          />
        ) : (
          <EmptyState onOpenSidebar={toggleMobileMenu} />
        )}
      </div>
    </div>
  );
};

export default Chat;
