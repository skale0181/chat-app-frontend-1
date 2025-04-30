import React, { useState, useRef, useEffect } from "react";
import { Menu, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useSupabaseStorage } from "../hooks/useSupabaseStorage";

type ChatWindowProps = {
  chat: any;
  toggleSidebar: () => void;
  isMobileSidebarOpen: boolean;
};

const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  toggleSidebar,
  isMobileSidebarOpen,
}) => {
  const { user } = useAuth();
  const { messages, loadingMessages, sendMessage, fetchMessages } = useChat();
  const { uploadFile } = useSupabaseStorage();

  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  // Find the other user in the chat
  const otherUser = chat.participants.find((p: any) => p._id !== user?.id);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (
    content: string,
    contentType: string = "text"
  ) => {
    if (!content.trim() && contentType === "text") return;

    await sendMessage(chat._id, content, contentType);
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploadingFile(true);

      // Determine content type
      let contentType = "file";
      if (file.type.startsWith("image/")) {
        contentType = "image";
      } else if (file.type.startsWith("video/")) {
        contentType = "video";
      }

      // Upload file to Supabase
      const { url, error } = await uploadFile(file, contentType);

      if (error) {
        throw new Error(error.message);
      }

      // Send message with file
      await sendMessage(chat._id, file.name, contentType, {
        url,
        name: file.name,
        size: file.size,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleScroll = () => {
    // Load more messages when scrolled to top
    const messageList = messageListRef.current;
    if (messageList && messageList.scrollTop === 0 && messages.length > 0) {
      const oldestMessage = messages[0];
      fetchMessages(chat._id, oldestMessage.createdAt);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center bg-white">
        <button
          className="mr-2 text-gray-600 md:hidden"
          onClick={toggleSidebar}
        >
          {isMobileSidebarOpen ? <ArrowLeft size={22} /> : <Menu size={22} />}
        </button>

        <div className="flex justify-between items-center w-full">
          {/* Left Side: User Avatar + Info */}
          <div className="flex items-center">
            {/* User Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                {otherUser?.username.charAt(0).toUpperCase()}
              </div>
              {otherUser?.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
              )}
            </div>

            {/* User Info */}
            <div className="ml-3">
              <h3 className="font-medium text-gray-800">
                {otherUser?.username}
              </h3>
              <p className="text-xs text-gray-500">
                {otherUser?.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          {/* Right Side: Call Button */}
          <div className="flex items-center">
            <button className="text-blue-500 p-2 rounded-full hover:bg-blue-100 transition">
              🎥
            </button>
            <button className="text-blue-500 p-2 rounded-full hover:bg-blue-100 transition">
              📞
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messageListRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50"
        onScroll={handleScroll}
      >
        {loadingMessages && messages.length === 0 ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <MessageList messages={messages} currentUserId={user?.id} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white">
        <MessageInput
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          disabled={isUploadingFile}
          isUploading={isUploadingFile}
          chatId={chat._id}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
