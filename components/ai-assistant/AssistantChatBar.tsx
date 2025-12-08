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
    onSubmit(prompt);
    setInputValue('');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-10 shadow-lg backdrop-blur-sm bg-background/95">
      <div className="max-w-4xl mx-auto px-4">
        {showSuggestedPrompts && (
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(prompt)}
                className="px-3 py-1.5 text-sm rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground text-foreground transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="pr-12"
            />
            {inputValue.trim() && (
              <Button
                onClick={() => setInputValue('')}
                variant="ghost"
                size="icon"
                className="absolute right-1 h-7 w-7"
              >
                <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button 
            onClick={handleSubmit} 
            size="icon"
            disabled={!inputValue.trim()}
            className="flex-shrink-0"
          >
            <FontAwesomeIcon icon="fa-solid fa-paper-plane" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

