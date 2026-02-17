'use client';

import { useState } from 'react';
import { FadeInSection, StaggerList } from '@/components/ui/animations';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { useAuth } from '@/lib/firebase/auth-context';

const ADVANCEMENT_QUICK_ACTIONS = [
  'People likely to give in 30 days',
  'Build my priority list for today',
  'Who stalled this week?',
  'Who needs a nudge to keep going?',
  'Who is at risk of lapsing?',
];

interface AdvancementPipelineLandingViewProps {
  onPromptSelect: (prompt: string) => void;
}

export function AdvancementPipelineLandingView({
  onPromptSelect,
}: AdvancementPipelineLandingViewProps) {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

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

  return (
    <FadeInSection className="max-w-4xl mx-auto px-4">
      <div className="text-center space-y-8 py-16">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-foreground">
            Good afternoon, {firstName}
          </h1>
          <p className="text-lg md:text-xl font-normal text-muted-foreground">
            What advancement tasks can I help you tackle today?
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Advancement Assistant…"
              className="w-full py-6 text-lg pr-24 border-border focus:border-primary focus:ring-primary/20"
            />
            <div className="absolute right-2 flex items-center gap-2">
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
            {ADVANCEMENT_QUICK_ACTIONS.map((prompt, index) => (
              <button
                key={index}
                onClick={() => onPromptSelect(prompt)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:bg-accent text-foreground transition-all duration-200 text-sm font-medium text-left shadow-sm hover:shadow-md"
              >
                <FontAwesomeIcon
                  icon="fa-regular fa-message"
                  className="h-4 w-4 text-muted-foreground flex-shrink-0"
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
