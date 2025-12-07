'use client';

import { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { suggestedPrompts } from '@/data/ai-assistant';

interface AssistantChatBarProps {
  onSubmit: (prompt: string) => void;
  placeholder?: string;
  showSuggestedPrompts?: boolean;
}

export function AssistantChatBar({
  onSubmit,
  placeholder = 'Ask Admission Assistant…',
  showSuggestedPrompts = true,
}: AssistantChatBarProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
    onSubmit(prompt);
    setInputValue('');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10 shadow-lg">
      <div className="max-w-4xl mx-auto px-4">
        {showSuggestedPrompts && (
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(prompt)}
                className="px-3 py-1.5 text-sm rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button onClick={handleSubmit} size="icon">
            <FontAwesomeIcon icon="fa-solid fa-paper-plane" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

