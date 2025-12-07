'use client';

import { FadeInSection, StaggerList } from '@/components/ui/animations';
import { Input } from '@/components/ui/input';
import { suggestedPrompts } from '@/data/ai-assistant';
import { useAuth } from '@/lib/firebase/auth-context';

interface IdleViewProps {
  onPromptSelect: (prompt: string) => void;
}

export function IdleView({ onPromptSelect }: IdleViewProps) {
  const { user } = useAuth();
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Jake';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <FadeInSection className="max-w-4xl mx-auto">
      <div className="text-center space-y-6 py-12">
        <div className="space-y-2">
          <p className="text-lg text-gray-600">{getGreeting()}, {userName}</p>
          <h1 className="text-4xl font-bold text-gray-900">
            What admissions tasks can I help you tackle today?
          </h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <Input
            placeholder="Ask Admission Assistant…"
            className="w-full text-center py-6 text-lg"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                onPromptSelect(e.currentTarget.value.trim());
              }
            }}
          />
        </div>

        <div className="pt-4">
          <p className="text-sm text-gray-500 mb-4">Suggested prompts:</p>
          <StaggerList className="flex flex-wrap justify-center gap-3">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => onPromptSelect(prompt)}
                className="px-4 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors text-sm font-medium"
              >
                {prompt}
              </button>
            ))}
          </StaggerList>
        </div>
      </div>
    </FadeInSection>
  );
}


