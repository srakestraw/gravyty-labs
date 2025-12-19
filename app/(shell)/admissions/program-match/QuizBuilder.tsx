'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { dataClient } from '@/lib/data';
import type {
  ProgramMatchQuizDraft,
  ProgramMatchQuizQuestion,
  ProgramMatchQuizOption,
  ProgramMatchDraftConfig,
  ProgramMatchTrait,
  ProgramMatchSkill,
  ProgramMatchOutcome,
  ProgramMatchProgram,
  ProgramMatchQuizAIDraftRequest,
} from '@/lib/data/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface QuizBuilderProps {
  quizDraft: ProgramMatchQuizDraft | null;
  draftConfig: ProgramMatchDraftConfig | null;
  traits: ProgramMatchTrait[];
  skills: ProgramMatchSkill[];
  outcomes: ProgramMatchOutcome[];
  programs: ProgramMatchProgram[];
}

export function QuizBuilder({
  quizDraft: initialQuizDraft,
  draftConfig,
  traits,
  skills,
  outcomes,
  programs,
}: QuizBuilderProps) {
  const router = useRouter();
  const [quizDraft, setQuizDraft] = useState(initialQuizDraft);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ProgramMatchQuizQuestion | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Question editor state
  const [questionSection, setQuestionSection] = useState<'fit' | 'readiness' | 'outcomes'>('fit');
  const [questionType, setQuestionType] = useState<'single_select' | 'multi_select' | 'scale'>('single_select');
  const [questionPrompt, setQuestionPrompt] = useState('');
  const [questionHelperText, setQuestionHelperText] = useState('');
  const [questionIsOptional, setQuestionIsOptional] = useState(false);
  const [questionOptions, setQuestionOptions] = useState<Omit<ProgramMatchQuizOption, 'id'>[]>([]);

  // Mapping drawer state
  const [showMappingDrawer, setShowMappingDrawer] = useState<number | null>(null);
  const [selectedTraitIds, setSelectedTraitIds] = useState<Set<string>>(new Set());
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(new Set());
  const [selectedOutcomeIds, setSelectedOutcomeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setQuizDraft(initialQuizDraft);
  }, [initialQuizDraft]);

  const activeTraits = useMemo(() => traits.filter(t => t.isActive), [traits]);
  const activeSkills = useMemo(() => skills.filter(s => s.isActive), [skills]);
  const activeOutcomes = useMemo(() => outcomes.filter(o => o.isActive), [outcomes]);
  const activePrograms = useMemo(() => programs.filter(p => p.status === 'active'), [programs]);

  const canBuildWithAI = draftConfig?.voiceToneProfileId && activeTraits.length >= 10;

  const handleOpenQuestionEditor = (question?: ProgramMatchQuizQuestion) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionSection(question.section);
      setQuestionType(question.type);
      setQuestionPrompt(question.prompt);
      setQuestionHelperText(question.helperText || '');
      setQuestionIsOptional(question.isOptional);
      setQuestionOptions(question.options.map(opt => ({
        label: opt.label,
        traitIds: opt.traitIds,
        skillIds: opt.skillIds,
        outcomeIds: opt.outcomeIds,
      })));
    } else {
      setEditingQuestion(null);
      setQuestionSection('fit');
      setQuestionType('single_select');
      setQuestionPrompt('');
      setQuestionHelperText('');
      setQuestionIsOptional(false);
      setQuestionOptions([{ label: '', traitIds: [], skillIds: [], outcomeIds: [] }]);
    }
    setShowQuestionEditor(true);
  };

  const handleCloseQuestionEditor = () => {
    setShowQuestionEditor(false);
    setEditingQuestion(null);
    setShowMappingDrawer(null);
  };

  const handleAddOption = () => {
    if (questionOptions.length >= 4) return;
    setQuestionOptions([...questionOptions, { label: '', traitIds: [], skillIds: [], outcomeIds: [] }]);
  };

  const handleRemoveOption = (index: number) => {
    setQuestionOptions(questionOptions.filter((_, i) => i !== index));
  };

  const handleUpdateOptionLabel = (index: number, label: string) => {
    const updated = [...questionOptions];
    updated[index] = { ...updated[index], label };
    setQuestionOptions(updated);
  };

  const handleOpenMappingDrawer = (optionIndex: number) => {
    setShowMappingDrawer(optionIndex);
    const option = questionOptions[optionIndex];
    setSelectedTraitIds(new Set(option.traitIds || []));
    setSelectedSkillIds(new Set(option.skillIds || []));
    setSelectedOutcomeIds(new Set(option.outcomeIds || []));
  };

  const handleCloseMappingDrawer = () => {
    setShowMappingDrawer(null);
    setSelectedTraitIds(new Set());
    setSelectedSkillIds(new Set());
    setSelectedOutcomeIds(new Set());
  };

  const handleSaveMapping = () => {
    if (showMappingDrawer === null) return;
    const updated = [...questionOptions];
    updated[showMappingDrawer] = {
      ...updated[showMappingDrawer],
      traitIds: Array.from(selectedTraitIds),
      skillIds: Array.from(selectedSkillIds),
      outcomeIds: questionSection === 'outcomes' ? Array.from(selectedOutcomeIds) : undefined,
    };
    setQuestionOptions(updated);
    handleCloseMappingDrawer();
  };

  const handleSaveQuestion = async () => {
    if (!questionPrompt.trim() || questionOptions.length === 0 || questionOptions.some(opt => !opt.label.trim())) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };

      const newQuestion: ProgramMatchQuizQuestion = {
        id: editingQuestion?.id || `q_${Date.now()}`,
        type: questionType,
        section: questionSection,
        prompt: questionPrompt.trim(),
        helperText: questionHelperText.trim() || null,
        options: questionOptions.map((opt, idx) => ({
          id: editingQuestion?.options[idx]?.id || `opt_${Date.now()}_${idx}`,
          label: opt.label.trim(),
          traitIds: opt.traitIds || [],
          skillIds: opt.skillIds || [],
          outcomeIds: opt.outcomeIds,
        })),
        isOptional: questionIsOptional,
      };

      const currentQuestions = quizDraft?.questions || [];
      let updatedQuestions: ProgramMatchQuizQuestion[];
      
      if (editingQuestion) {
        updatedQuestions = currentQuestions.map(q => q.id === editingQuestion.id ? newQuestion : q);
      } else {
        updatedQuestions = [...currentQuestions, newQuestion];
      }

      if (!quizDraft?.quizId) {
        throw new Error('Quiz ID is required');
      }
      await dataClient.updateProgramMatchQuizDraftByQuizId(ctx, quizDraft.quizId, {
        questions: updatedQuestions,
      });

      router.refresh();
      handleCloseQuestionEditor();
    } catch (error) {
      console.error('Failed to save question:', error);
      alert('Failed to save question. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Delete this question?')) return;

    setIsSaving(true);
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };

      if (!quizDraft?.quizId) {
        throw new Error('Quiz ID is required');
      }
      const updatedQuestions = (quizDraft?.questions || []).filter(q => q.id !== questionId);
      await dataClient.updateProgramMatchQuizDraftByQuizId(ctx, quizDraft.quizId, {
        questions: updatedQuestions,
      });

      router.refresh();
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Failed to delete question. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBuildWithAI = async () => {
    if (!canBuildWithAI) return;

    setIsGenerating(true);
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };

      if (!quizDraft?.quizId) {
        throw new Error('Quiz ID is required');
      }
      const req: ProgramMatchQuizAIDraftRequest = {
        quizId: quizDraft.quizId,
        targetLength: quizDraft?.targetLength || 8,
        includeSkillsQuestions: true,
        includeOutcomesQuestions: draftConfig?.outcomesEnabled || false,
        toneProfileId: draftConfig?.voiceToneProfileId || '',
        activeTraitIds: activeTraits.map(t => t.id),
        activeSkillIds: activeSkills.map(s => s.id),
        activeOutcomeIds: draftConfig?.outcomesEnabled ? activeOutcomes.map(o => o.id) : undefined,
        programSummaries: activePrograms.map(p => ({ id: p.id, name: p.name })),
      };

      const generated = await dataClient.generateProgramMatchQuizDraftWithAI(ctx, req);
      router.refresh();
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateTargetLength = async (length: 8 | 9 | 10) => {
    setIsSaving(true);
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };

      if (!quizDraft?.quizId) {
        throw new Error('Quiz ID is required');
      }
      await dataClient.updateProgramMatchQuizDraftByQuizId(ctx, quizDraft.quizId, {
        targetLength: length,
      });

      router.refresh();
    } catch (error) {
      console.error('Failed to update target length:', error);
      alert('Failed to update target length. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const questions = quizDraft?.questions || [];
  const fitQuestions = questions.filter(q => q.section === 'fit');
  const readinessQuestions = questions.filter(q => q.section === 'readiness');
  const outcomesQuestions = questions.filter(q => q.section === 'outcomes');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Quiz Status: Draft</h3>
          <p className="text-xs text-gray-500 mt-1">Keep it short: 8-10 questions. No test language.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Target length:</span>
            <select
              value={quizDraft?.targetLength || 8}
              onChange={(e) => handleUpdateTargetLength(Number(e.target.value) as 8 | 9 | 10)}
              disabled={isSaving}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={8}>8</option>
              <option value={9}>9</option>
              <option value={10}>10</option>
            </select>
          </div>
          <Button
            onClick={handleBuildWithAI}
            disabled={!canBuildWithAI || isGenerating}
            variant="outline"
            size="sm"
          >
            {isGenerating ? (
              <>
                <FontAwesomeIcon icon="fa-solid fa-spinner" className="h-4 w-4 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon="fa-solid fa-wand-magic-sparkles" className="h-4 w-4 mr-1" />
                Build with AI
              </>
            )}
          </Button>
          <Button
            onClick={() => handleOpenQuestionEditor()}
            disabled={questions.length >= 10}
            size="sm"
          >
            <FontAwesomeIcon icon="fa-solid fa-plus" className="h-4 w-4 mr-1" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-4">No questions yet</p>
          <Button
            onClick={handleBuildWithAI}
            disabled={!canBuildWithAI || isGenerating}
            variant="outline"
          >
            {isGenerating ? 'Generating...' : 'Build with AI'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Fit Questions */}
          {fitQuestions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Fit Questions ({fitQuestions.length})</h4>
              <div className="space-y-2">
                {fitQuestions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    onEdit={() => handleOpenQuestionEditor(q)}
                    onDelete={() => handleDeleteQuestion(q.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Readiness Questions */}
          {readinessQuestions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Readiness Questions ({readinessQuestions.length})</h4>
              <div className="space-y-2">
                {readinessQuestions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    onEdit={() => handleOpenQuestionEditor(q)}
                    onDelete={() => handleDeleteQuestion(q.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Outcomes Questions */}
          {outcomesQuestions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Outcomes Questions ({outcomesQuestions.length})</h4>
              <div className="space-y-2">
                {outcomesQuestions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    onEdit={() => handleOpenQuestionEditor(q)}
                    onDelete={() => handleDeleteQuestion(q.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Question Editor Modal */}
      {showQuestionEditor && (
        <QuestionEditorModal
          section={questionSection}
          type={questionType}
          prompt={questionPrompt}
          helperText={questionHelperText}
          isOptional={questionIsOptional}
          options={questionOptions}
          showMappingDrawer={showMappingDrawer}
          selectedTraitIds={selectedTraitIds}
          selectedSkillIds={selectedSkillIds}
          selectedOutcomeIds={selectedOutcomeIds}
          activeTraits={activeTraits}
          activeSkills={activeSkills}
          activeOutcomes={activeOutcomes}
          outcomesEnabled={draftConfig?.outcomesEnabled || false}
          onSectionChange={setQuestionSection}
          onTypeChange={setQuestionType}
          onPromptChange={setQuestionPrompt}
          onHelperTextChange={setQuestionHelperText}
          onIsOptionalChange={setQuestionIsOptional}
          onOptionsChange={setQuestionOptions}
          onAddOption={handleAddOption}
          onRemoveOption={handleRemoveOption}
          onUpdateOptionLabel={handleUpdateOptionLabel}
          onOpenMappingDrawer={handleOpenMappingDrawer}
          onCloseMappingDrawer={handleCloseMappingDrawer}
          onSaveMapping={handleSaveMapping}
          onTraitToggle={(id: string) => {
            const newSet = new Set(selectedTraitIds);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            setSelectedTraitIds(newSet);
          }}
          onSkillToggle={(id: string) => {
            const newSet = new Set(selectedSkillIds);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            setSelectedSkillIds(newSet);
          }}
          onOutcomeToggle={(id: string) => {
            const newSet = new Set(selectedOutcomeIds);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            setSelectedOutcomeIds(newSet);
          }}
          onSave={handleSaveQuestion}
          onCancel={handleCloseQuestionEditor}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

function QuestionCard({ question, onEdit, onDelete }: { question: ProgramMatchQuizQuestion; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">{question.prompt}</span>
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
              {question.section}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-800">
              {question.type}
            </span>
            {question.isOptional && (
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                Optional
              </span>
            )}
          </div>
          {question.helperText && (
            <p className="text-xs text-gray-600 mb-1">{question.helperText}</p>
          )}
          <p className="text-xs text-gray-500">{question.options.length} options</p>
        </div>
        <div className="flex gap-1 ml-4">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuestionEditorModal({
  section,
  type,
  prompt,
  helperText,
  isOptional,
  options,
  showMappingDrawer,
  selectedTraitIds,
  selectedSkillIds,
  selectedOutcomeIds,
  activeTraits,
  activeSkills,
  activeOutcomes,
  outcomesEnabled,
  onSectionChange,
  onTypeChange,
  onPromptChange,
  onHelperTextChange,
  onIsOptionalChange,
  onOptionsChange,
  onAddOption,
  onRemoveOption,
  onUpdateOptionLabel,
  onOpenMappingDrawer,
  onCloseMappingDrawer,
  onSaveMapping,
  onTraitToggle,
  onSkillToggle,
  onOutcomeToggle,
  onSave,
  onCancel,
  isSaving,
}: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {showMappingDrawer !== null ? 'Edit Mappings' : 'Edit Question'}
        </h3>

        {showMappingDrawer === null ? (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section <span className="text-red-500">*</span>
                </label>
                <select
                  value={section}
                  onChange={(e) => onSectionChange(e.target.value as 'fit' | 'readiness' | 'outcomes')}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="fit">Fit</option>
                  <option value="readiness">Readiness</option>
                  {outcomesEnabled && <option value="outcomes">Outcomes</option>}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => onTypeChange(e.target.value as 'single_select' | 'multi_select' | 'scale')}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="single_select">Single Select</option>
                  <option value="multi_select">Multi Select</option>
                  <option value="scale">Scale</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prompt <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={prompt}
                  onChange={(e) => onPromptChange(e.target.value)}
                  placeholder="e.g., What type of learning environment do you prefer?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Helper Text (optional)
                </label>
                <Input
                  type="text"
                  value={helperText}
                  onChange={(e) => onHelperTextChange(e.target.value)}
                  placeholder="e.g., Think about how you learn best"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isOptional"
                  checked={isOptional}
                  onChange={(e) => onIsOptionalChange(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isOptional" className="text-sm text-gray-700">
                  Optional question
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Options <span className="text-red-500">*</span> (max 4)
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onAddOption}
                    disabled={options.length >= 4}
                  >
                    <FontAwesomeIcon icon="fa-solid fa-plus" className="h-3 w-3 mr-1" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2">
                  {options.map((opt: any, idx: number) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <Input
                        type="text"
                        value={opt.label}
                        onChange={(e) => onUpdateOptionLabel(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenMappingDrawer(idx)}
                      >
                        Map
                      </Button>
                      {options.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveOption(idx)}
                        >
                          <FontAwesomeIcon icon="fa-solid fa-trash" className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={onSave} disabled={isSaving}>
                Save Question
              </Button>
            </div>
          </>
        ) : (
          <MappingDrawer
            optionIndex={showMappingDrawer}
            optionLabel={options[showMappingDrawer]?.label || ''}
            selectedTraitIds={selectedTraitIds}
            selectedSkillIds={selectedSkillIds}
            selectedOutcomeIds={selectedOutcomeIds}
            activeTraits={activeTraits}
            activeSkills={activeSkills}
            activeOutcomes={activeOutcomes}
            showOutcomes={section === 'outcomes'}
            onTraitToggle={onTraitToggle}
            onSkillToggle={onSkillToggle}
            onOutcomeToggle={onOutcomeToggle}
            onSave={onSaveMapping}
            onCancel={onCloseMappingDrawer}
          />
        )}
      </div>
    </div>
  );
}

function MappingDrawer({
  optionIndex,
  optionLabel,
  selectedTraitIds,
  selectedSkillIds,
  selectedOutcomeIds,
  activeTraits,
  activeSkills,
  activeOutcomes,
  showOutcomes,
  onTraitToggle,
  onSkillToggle,
  onOutcomeToggle,
  onSave,
  onCancel,
}: any) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">Map option: "{optionLabel}"</p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Traits (primary)</label>
        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
          {activeTraits.length === 0 ? (
            <p className="text-xs text-gray-500">No active traits available</p>
          ) : (
            activeTraits.map((trait: ProgramMatchTrait) => (
              <label key={trait.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTraitIds.has(trait.id)}
                  onChange={() => onTraitToggle(trait.id)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-900">{trait.name}</span>
                <span className="text-xs text-gray-500">({trait.category})</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Skills (secondary)</label>
        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
          {activeSkills.length === 0 ? (
            <p className="text-xs text-gray-500">No active skills available</p>
          ) : (
            activeSkills.map((skill: ProgramMatchSkill) => (
              <label key={skill.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSkillIds.has(skill.id)}
                  onChange={() => onSkillToggle(skill.id)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-900">{skill.name}</span>
                <span className="text-xs text-gray-500">({skill.category})</span>
              </label>
            ))
          )}
        </div>
      </div>

      {showOutcomes && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Outcomes</label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
            {activeOutcomes.length === 0 ? (
              <p className="text-xs text-gray-500">No active outcomes available</p>
            ) : (
              activeOutcomes.map((outcome: ProgramMatchOutcome) => (
                <label key={outcome.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedOutcomeIds.has(outcome.id)}
                    onChange={() => onOutcomeToggle(outcome.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-900">{outcome.name}</span>
                  {outcome.category && (
                    <span className="text-xs text-gray-500">({outcome.category})</span>
                  )}
                </label>
              ))
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave}>
          Save Mappings
        </Button>
      </div>
    </div>
  );
}

