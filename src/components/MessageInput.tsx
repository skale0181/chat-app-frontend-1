import React, { useState, useRef, useEffect } from 'react';
import { Smile, PaperclipIcon, Send, X } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import EmojiPicker from './EmojiPicker';

type MessageInputProps = {
  onSendMessage: (content: string, contentType?: string) => Promise<void>;
  onFileUpload: (file: File) => Promise<void>;
  disabled: boolean;
  isUploading: boolean;
  chatId: string;
};

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  onFileUpload,
  disabled,
  isUploading,
  chatId
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { setTyping } = useChat();
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Auto resize textarea based on content
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  const handleSendMessage = async () => {
    if (disabled || (!message.trim() && !selectedFile)) return;
    
    if (selectedFile) {
      await onFileUpload(selectedFile);
      setSelectedFile(null);
    } else {
      await onSendMessage(message);
    }
    
    setMessage('');
    
    // Reset typing indicator
    setTyping(chatId, false);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size exceeds 50MB limit');
        return;
      }
      
      setSelectedFile(file);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const handleEmojiSelect = (emoji: any) => {
    setMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
    
    // Focus back on textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Handle typing indicator
    setTyping(chatId, true);
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      setTyping(chatId, false);
    }, 3000);
    
    setTypingTimeout(timeout);
  };
  
  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="px-4 py-3">
      {/* Selected file preview */}
      {selectedFile && (
        <div className="mb-3 p-2 bg-gray-100 rounded-md flex items-center">
          <div className="flex-1 truncate">
            <span className="text-sm font-medium">{selectedFile.name}</span>
            <span className="text-xs text-gray-500 ml-2">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </span>
          </div>
          <button
            onClick={removeSelectedFile}
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
      )}
      
      {/* Message input */}
      <div className="flex items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextChange}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            disabled={disabled || isUploading}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 resize-none max-h-32 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            rows={1}
          />
          
          {/* Emoji picker button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-3 bottom-2.5 text-gray-500 hover:text-gray-700"
          >
            <Smile size={20} />
          </button>
          
          {/* Emoji picker dropdown */}
          {showEmojiPicker && (
            <div className="absolute bottom-12 right-0 z-10">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
        </div>
        
        {/* File upload */}
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={disabled || isUploading || !!selectedFile}
          className="ml-2 text-gray-500 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PaperclipIcon size={22} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,application/*"
        />
        
        {/* Send button */}
        <button
          type="button"
          onClick={handleSendMessage}
          disabled={disabled || isUploading || (!message.trim() && !selectedFile)}
          className="ml-2 p-2 rounded-full bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;