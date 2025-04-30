import React, { useState, useEffect } from 'react';
import data from '@emoji-mart/data';

type EmojiPickerProps = {
  onEmojiSelect: (emoji: any) => void;
};

// We'll create a simpler emoji picker instead of using emoji-mart directly
// This is more lightweight for this example
const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  // Common emojis
  const commonEmojis = [
    { id: 'smile', native: '😊' },
    { id: 'laughing', native: '😂' },
    { id: 'heart_eyes', native: '😍' },
    { id: 'thinking', native: '🤔' },
    { id: 'thumbsup', native: '👍' },
    { id: 'clap', native: '👏' },
    { id: 'fire', native: '🔥' },
    { id: 'heart', native: '❤️' },
    { id: 'party', native: '🎉' },
    { id: 'ok_hand', native: '👌' },
    { id: 'pray', native: '🙏' },
    { id: 'eyes', native: '👀' },
    { id: 'sob', native: '😭' },
    { id: 'pray', native: '🙏' },
    { id: 'raised_hands', native: '🙌' },
    { id: 'rocket', native: '🚀' },
    { id: 'hundred', native: '💯' },
    { id: 'tada', native: '🎉' },
    { id: 'sunglasses', native: '😎' },
    { id: 'wave', native: '👋' },
    { id: 'joy', native: '😂' },
    { id: 'exploding_head', native: '🤯' },
    { id: 'thinking', native: '🤔' },
    { id: 'smirk', native: '😏' },
    { id: 'confused', native: '😕' },
    { id: 'neutral_face', native: '😐' },
    { id: 'grinning', native: '😀' },
    { id: 'wink', native: '😉' },
  ];
  
  // This is a simplified version of the emoji picker
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-72 max-h-72 overflow-y-auto">
      <div className="grid grid-cols-8 gap-1">
        {commonEmojis.map((emoji) => (
          <button
            key={emoji.id}
            className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded-md"
            onClick={() => onEmojiSelect(emoji)}
          >
            {emoji.native}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;