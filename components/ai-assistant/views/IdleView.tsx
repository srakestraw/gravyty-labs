'use client';

import { useState } from 'react';
import { FadeInSection, StaggerList } from '@/components/ui/animations';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { suggestedPrompts } from '@/data/ai-assistant';
import { useAuth } from '@/lib/firebase/auth-context';

interface IdleViewProps {
  onPromptSelect: (prompt: string) => void;
}

export function IdleView({ onPromptSelect }: IdleViewProps) {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Jake';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onPromptSelect(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceClick = () => {
    // Placeholder for voice input functionality
    console.log('Voice input clicked');
  };

  return (
    <FadeInSection className="max-w-4xl mx-auto px-4">
      <div className="text-center space-y-8 py-16">
        <div className="space-y-3">
          <div className="text-4xl md:text-5xl font-bold leading-tight">
            <span className="text-primary">{getGreeting()}</span>
            <span className="text-purple-600">, {userName}</span>
            <span className="ml-2">👋</span>
          </div>
          <h1 className="text-lg md:text-xl font-normal text-foreground">
            What admissions tasks can I help you tackle today?
          </h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Admission Assistant…"
              className="w-full py-6 text-lg pr-24 border-purple-200 focus:border-purple-400 focus:ring-purple-200"
            />
            <div className="absolute right-2 flex items-center gap-2">
              <Button
                onClick={handleVoiceClick}
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                aria-label="Voice input"
              >
                <FontAwesomeIcon icon="fa-solid fa-microphone" className="h-5 w-5" />
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!inputValue.trim()}
                size="icon"
                className="h-10 w-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                aria-label="Send message"
              >
                <FontAwesomeIcon icon="fa-solid fa-arrow-up" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <StaggerList className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => onPromptSelect(prompt)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-foreground transition-all duration-200 text-sm font-medium text-left shadow-sm hover:shadow-md"
              >
                <FontAwesomeIcon 
                  icon="fa-regular fa-message" 
                  className="h-4 w-4 text-gray-400 flex-shrink-0" 
                />
                <span className="flex-1">{prompt}</span>
              </button>
            ))}
          </StaggerList>
        </div>
      </div>
    </FadeInSection>
  );
}




