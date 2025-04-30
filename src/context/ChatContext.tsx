import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

type User = {
  _id: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
};

type Message = {
  _id: string;
  chat: string;
  sender: User | string;
  content: string;
  contentType: 'text' | 'image' | 'video' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
};

type Chat = {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: Map<string, number>;
  createdAt: string;
  updatedAt: string;
};

type ChatContextType = {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  users: User[];
  loading: boolean;
  loadingMessages: boolean;
  typingUsers: Record<string, boolean>;
  setCurrentChat: (chat: Chat | null) => void;
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string, before?: string) => Promise<void>;
  sendMessage: (chatId: string, content: string, contentType?: string, fileDetails?: { url: string, name: string, size: number }) => Promise<void>;
  createChat: (userId: string) => Promise<Chat>;
  markChatAsRead: (chatId: string) => Promise<void>;
  setTyping: (chatId: string, isTyping: boolean) => void;
  fetchUsers: () => Promise<void>;
};

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const { socket, connected } = useSocket();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  // Listen for socket events
  useEffect(() => {
    if (!socket || !connected) return;

    // Handle new private message
    socket.on('private_message', (data) => {
      const { senderId, chatId, message } = data;
      
      // Add message to state if it's for the current chat
      if (currentChat && currentChat._id === chatId) {
        setMessages((prev) => [...prev, message]);
        
        // Mark message as read automatically if user is viewing this chat
        markMessageAsRead(message._id);
      }
      
      // Update chats list with new message
      fetchChats();
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { senderId, isTyping } = data;
      setTypingUsers((prev) => ({
        ...prev,
        [senderId]: isTyping
      }));
    });

    // Handle message read status update
    socket.on('message_read', (data) => {
      const { messageIds, readBy } = data;
      
      // Update read status for these messages
      setMessages((prev) => 
        prev.map((message) => 
          messageIds.includes(message._id) && !message.readBy.includes(readBy)
            ? { ...message, readBy: [...message.readBy, readBy] }
            : message
        )
      );
    });

    // Handle user status change
    socket.on('user_status', (data) => {
      const { userId, isOnline, lastSeen } = data;
      
      // Update user in users list
      setUsers((prev) => 
        prev.map((user) => 
          user._id === userId
            ? { ...user, isOnline, lastSeen }
            : user
        )
      );
      
      // Update user in chats list
      setChats((prev) => 
        prev.map((chat) => ({
          ...chat,
          participants: chat.participants.map((participant) =>
            participant._id === userId
              ? { ...participant, isOnline, lastSeen }
              : participant
          )
        }))
      );
      
      // Update user in current chat
      if (currentChat) {
        setCurrentChat((prev) => 
          prev ? {
            ...prev,
            participants: prev.participants.map((participant) =>
              participant._id === userId
                ? { ...participant, isOnline, lastSeen }
                : participant
            )
          } : null
        );
      }
    });

    return () => {
      socket.off('private_message');
      socket.off('typing');
      socket.off('message_read');
      socket.off('user_status');
    };
  }, [socket, connected, currentChat]);

  // Fetch chats on initial load and when token changes
  useEffect(() => {
    if (token) {
      fetchChats();
      fetchUsers();
    }
  }, [token]);

  // Mark chat as read when current chat changes
  useEffect(() => {
    if (currentChat) {
      markChatAsRead(currentChat._id);
      fetchMessages(currentChat._id);
    }
  }, [currentChat]);

  const fetchChats = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/chats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string, before?: string) => {
    if (!token) return;
    
    try {
      setLoadingMessages(true);
      
      const url = `${import.meta.env.VITE_API_URL}/api/messages/chat/${chatId}`;
      const params = before ? { before } : {};
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params
      });
      
      if (before) {
        // Prepend older messages
        setMessages((prev) => [...response.data, ...prev]);
      } else {
        // New messages fetch
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (
    chatId: string,
    content: string,
    contentType: string = 'text',
    fileDetails?: { url: string, name: string, size: number }
  ) => {
    if (!token || !content.trim()) return;
    
    try {
      const messageData: any = {
        chatId,
        content,
        contentType
      };
      
      // Add file details if provided
      if (fileDetails && contentType !== 'text') {
        messageData.fileUrl = fileDetails.url;
        messageData.fileName = fileDetails.name;
        messageData.fileSize = fileDetails.size;
      }
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/messages`,
        messageData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Add message to state
      setMessages((prev) => [...prev, response.data]);
      
      // Emit socket event for real-time update
      if (socket && connected) {
        // Get recipient ID (other user in the chat)
        const recipientId = currentChat?.participants.find(
          (p) => p._id !== user?.id
        )?._id;
        
        if (recipientId) {
          socket.emit('private_message', {
            recipientId,
            chatId,
            message: response.data
          });
        }
      }
      
      // Update chats with new last message
      fetchChats();
      
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const createChat = async (userId: string) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chats`,
        { participantId: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Add new chat to state if it doesn't exist
      setChats((prev) => {
        if (!prev.some((chat) => chat._id === response.data._id)) {
          return [...prev, response.data];
        }
        return prev;
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
      throw error;
    }
  };

  const markChatAsRead = async (chatId: string) => {
    if (!token) return;
    
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/chats/${chatId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update unread count in chats
      setChats((prev) =>
        prev.map((chat) => {
          // if (chat._id === chatId) {
          //   const updatedChat = { ...chat };
          //   if (!updatedChat.unreadCount) {
          //     updatedChat.unreadCount = new Map();
          //   }
          //   updatedChat?.unreadCount?.set(user?.id || '', 0);
          //   return updatedChat;
          // }
          return chat;
        })
      );
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    if (!token) return;
    
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/messages/${messageId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const setTyping = (chatId: string, isTyping: boolean) => {
    if (!socket || !connected) return;
    
    // Get recipient ID (other user in the chat)
    const recipientId = currentChat?.participants.find(
      (p) => p._id !== user?.id
    )?._id;
    
    if (recipientId) {
      socket.emit('typing', {
        recipientId,
        isTyping
      });
    }
  };

  const fetchUsers = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        messages,
        users,
        loading,
        loadingMessages,
        typingUsers,
        setCurrentChat,
        fetchChats,
        fetchMessages,
        sendMessage,
        createChat,
        markChatAsRead,
        setTyping,
        fetchUsers
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};