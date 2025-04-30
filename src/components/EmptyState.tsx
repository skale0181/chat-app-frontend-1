import React from 'react';
import { MessageSquare, PlusCircle } from 'lucide-react';

type EmptyStateProps = {
  onOpenSidebar: () => void;
};

const EmptyState: React.FC<EmptyStateProps> = ({ onOpenSidebar }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-50">
      <MessageSquare size={64} className="text-indigo-300 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">No chat selected</h2>
      <p className="text-gray-600 text-center mb-8 max-w-md">
        Select an existing conversation from the sidebar or start a new one to begin chatting.
      </p>
      <button
        onClick={onOpenSidebar}
        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        <PlusCircle size={18} className="mr-2" />
        New Conversation
      </button>
    </div>
  );
};

export default EmptyState;