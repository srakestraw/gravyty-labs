'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateQuizDraft } from '@/lib/program-match/ai/quiz-generator';
import { MOCK_PROGRAMS } from '@/lib/program-match/mock-data';

export default function ProgramMatchQuizBuilderPage() {
  const [quizId, setQuizId] = useState('quiz_grad_match_v1');
  const [versionId, setVersionId] = useState('v1');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);

  const handleGenerateQuiz = async () => {
    setGenerating(true);
    try {
      const draft = await generateQuizDraft({
        programCatalog: MOCK_PROGRAMS,
        maxQuestions: 12,
        targetMinutes: 4,
      });
      setQuestions(draft.questions);
      alert('Quiz draft generated! Review and edit questions below.');
    } catch (error) {
      alert('Failed to generate quiz draft');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (questions.length === 0) {
      alert('Please add questions before publishing');
      return;
    }
    if (confirm('Publish this quiz version? This will make it live for candidates.')) {
      setStatus('published');
      // TODO: Save via API
      alert('Quiz published!');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quiz Builder
            </h1>
            <p className="text-gray-600">
              Create and manage matching quizzes with trait and skill mappings
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleGenerateQuiz}
              disabled={generating}
            >
              <FontAwesomeIcon icon="fa-solid fa-wand-magic-sparkles" className="h-4 w-4 mr-2" />
              {generating ? 'Generating...' : 'AI Generate Draft'}
            </Button>
            <Button
              onClick={handlePublish}
              disabled={status === 'published' || questions.length === 0}
            >
              <FontAwesomeIcon icon="fa-solid fa-rocket" className="h-4 w-4 mr-2" />
              {status === 'published' ? 'Published' : 'Publish Quiz'}
            </Button>
          </div>
        </div>

        {/* Quiz Info */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Quiz ID</Label>
              <Input value={quizId} onChange={(e) => setQuizId(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Version ID</Label>
              <Input value={versionId} onChange={(e) => setVersionId(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Status</Label>
              <div className="mt-1 flex items-center gap-2">
                <span className={`px-3 py-2 rounded text-sm font-medium ${
                  status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="traits">Traits & Skills</TabsTrigger>
            <TabsTrigger value="mappings">Answer Mappings</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-4">
            {questions.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <FontAwesomeIcon icon="fa-solid fa-question-circle" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  No questions yet. Generate a draft or add questions manually.
                </p>
                <Button onClick={handleGenerateQuiz} disabled={generating}>
                  <FontAwesomeIcon icon="fa-solid fa-wand-magic-sparkles" className="h-4 w-4 mr-2" />
                  {generating ? 'Generating...' : 'Generate Quiz Draft'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.question_id || index} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                          {question.type}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <FontAwesomeIcon icon="fa-solid fa-trash" className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-base font-medium text-gray-900 mb-2">
                      {question.text}
                    </div>
                    {question.options && question.options.length > 0 && (
                      <div className="space-y-1 ml-4">
                        {question.options.map((opt: any, optIndex: number) => (
                          <div key={optIndex} className="text-sm text-gray-600">
                            • {opt.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="traits" className="space-y-4">
            <div className="border rounded-lg p-6 bg-white">
              <h3 className="font-semibold text-gray-900 mb-4">Trait Library</h3>
              <p className="text-gray-600 text-sm">
                Traits are used to match candidates to programs based on learning style, work preferences, and personality.
                Configure trait weights in Program Library.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="mappings" className="space-y-4">
            <div className="border rounded-lg p-6 bg-white">
              <h3 className="font-semibold text-gray-900 mb-4">Answer Mappings</h3>
              <p className="text-gray-600 text-sm">
                Map answer options to trait and skill deltas. These determine how candidate responses influence program matching.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
