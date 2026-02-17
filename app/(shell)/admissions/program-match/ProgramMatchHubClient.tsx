'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { dataClient } from '@/lib/data';
import type {
  ProgramMatchHubSummary,
  ProgramMatchChecklistItem,
  ProgramMatchLibrariesSummary,
  ProgramMatchProgramsSummary,
  ProgramMatchCandidatesSummary,
  ProgramMatchAnalyticsSummary,
  ProgramMatchDraftConfig,
  VoiceToneProfile,
  ProgramMatchTrait,
  ProgramMatchSkill,
  ProgramMatchProgram,
  ProgramMatchProgramICP,
  ProgramMatchOutcome,
  ProgramMatchQuizDraft,
  ProgramMatchQuiz,
  ProgramMatchPublishSnapshot,
  ProgramMatchPreviewLink,
} from '@/lib/data/provider';
import { TraitsTab } from './TraitsTab';
import { SkillsTab } from './SkillsTab';
import { OutcomesTab } from './OutcomesTab';
import { ProgramsPanel } from './ProgramsPanel';
import { ICPBuilder } from './ICPBuilder';
import { QuizBuilder } from './QuizBuilder';
import { PreviewDeployPanel } from './PreviewDeployPanel';
import { GateConfigPanel } from './GateConfigPanel';
import { CandidatesSection } from './CandidatesSection';
import { AnalyticsSection } from './AnalyticsSection';
import { TemplateGallery } from './TemplateGallery';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { ProgramMatchPreviewPanel } from './ProgramMatchPreviewPanel';
import { publishProgramMatchAction } from './actions';

interface ProgramMatchHubClientProps {
  hubSummary: ProgramMatchHubSummary | null;
  checklist: ProgramMatchChecklistItem[];
  librariesSummary: ProgramMatchLibrariesSummary | null;
  programsSummary: ProgramMatchProgramsSummary | null;
  candidatesSummary: ProgramMatchCandidatesSummary | null;
  analyticsSummary: ProgramMatchAnalyticsSummary | null;
  draftConfig: ProgramMatchDraftConfig | null;
  voiceToneProfiles: VoiceToneProfile[];
  traits: ProgramMatchTrait[];
  skills: ProgramMatchSkill[];
  programs: ProgramMatchProgram[];
  outcomes: ProgramMatchOutcome[];
  quizDraft: ProgramMatchQuizDraft | null;
  quizzes: ProgramMatchQuiz[];
  publishedSnapshots: ProgramMatchPublishSnapshot[];
  previewLinks: ProgramMatchPreviewLink[];
}

export function ProgramMatchHubClient({
  hubSummary,
  checklist,
  librariesSummary,
  programsSummary,
  candidatesSummary,
  analyticsSummary,
  draftConfig,
  voiceToneProfiles,
  traits,
  skills,
  programs,
  outcomes,
  quizDraft,
  quizzes,
  publishedSnapshots,
  previewLinks,
}: ProgramMatchHubClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  type Step = 'basics' | 'match_model' | 'launch';
  const STEP_SECTIONS: Record<Step, string[]> = {
    basics: ['voice-tone', 'lead-capture'],
    match_model: ['libraries', 'program-icp'],
    launch: ['quiz', 'preview-deploy'],
  };
  const SECTION_TO_STEP: Record<string, Step> = {
    'voice-tone': 'basics',
    'lead-capture': 'basics',
    libraries: 'match_model',
    'program-icp': 'match_model',
    quiz: 'launch',
    'preview-deploy': 'launch',
  };

  const [activeStep, setActiveStep] = useState<Step>('basics');
  const [openPanels, setOpenPanels] = useState<Set<string>>(() => new Set(STEP_SECTIONS.basics));
  const [previewPanelCollapsed, setPreviewPanelCollapsed] = useState(false);

  useEffect(() => {
    const p = searchParams.get('step');
    const step: Step = p === 'match-model' ? 'match_model' : (p === 'launch' ? 'launch' : 'basics');
    setActiveStep(step);
    setOpenPanels(new Set(STEP_SECTIONS[step]));
  }, [searchParams]);

  const updateStepParam = useCallback((step: Step) => {
    const param = step === 'match_model' ? 'match-model' : step;
    const url = new URL(window.location.href);
    url.searchParams.set('step', param);
    router.replace(url.pathname + url.search);
  }, [router]);

  const [activeLibraryTab, setActiveLibraryTab] = useState<'traits' | 'skills' | 'outcomes'>('traits');
  const [isSavingVoiceTone, setIsSavingVoiceTone] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [icp, setIcp] = useState<ProgramMatchProgramICP | null>(null);
  const [programOutcomes, setProgramOutcomes] = useState<import('@/lib/data/provider').ProgramMatchProgramOutcomes | null>(null);
  const [isLoadingIcp, setIsLoadingIcp] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showShareLinkModal, setShowShareLinkModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string[] | null>(null);
  const [currentPreviewLinks, setCurrentPreviewLinks] = useState(previewLinks);
  const [latestSnapshot, setLatestSnapshot] = useState<ProgramMatchPublishSnapshot | null>(
    publishedSnapshots.length > 0 ? publishedSnapshots.sort((a, b) => b.version - a.version)[0] : null
  );
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [optimisticVoiceToneId, setOptimisticVoiceToneId] = useState<string | null>(draftConfig?.voiceToneProfileId || null);
  const [optimisticChecklist, setOptimisticChecklist] = useState(checklist);
  const [optimisticHubSummary, setOptimisticHubSummary] = useState(hubSummary);

  // Sync optimistic state when draftConfig changes (after refresh)
  useEffect(() => {
    setOptimisticVoiceToneId(draftConfig?.voiceToneProfileId || null);
  }, [draftConfig?.voiceToneProfileId]);

  // Sync checklist when it changes from server, but only if it's actually different
  // Use a ref to track if we just made an optimistic update
  const justUpdatedOptimistically = useRef(false);
  
  useEffect(() => {
    // If we just made an optimistic update, skip syncing for a bit
    if (justUpdatedOptimistically.current) {
      justUpdatedOptimistically.current = false;
      console.log('[Voice Tone] Skipping sync - just updated optimistically');
      return;
    }
    
    // Only sync if the checklist actually changed
    const currentVoiceToneState = optimisticChecklist.find(item => item.id === 'checklist-1')?.state;
    const serverVoiceToneState = checklist.find(item => item.id === 'checklist-1')?.state;
    
    if (currentVoiceToneState !== serverVoiceToneState) {
      console.log('[Voice Tone] Syncing checklist from server:', {
        current: currentVoiceToneState,
        server: serverVoiceToneState,
      });
      setOptimisticChecklist(checklist);
    }
  }, [checklist]);

  // Sync hubSummary when it changes from server
  useEffect(() => {
    setOptimisticHubSummary(hubSummary);
  }, [hubSummary]);

  const goToSection = useCallback((sectionId: string) => {
    const step = SECTION_TO_STEP[sectionId];
    if (step) {
      setActiveStep(step);
      updateStepParam(step);
      setOpenPanels((prev) => new Set([...prev, sectionId]));
    }
    scrollToSection(sectionId);
  }, [updateStepParam]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    let scrollContainer: HTMLElement | null = null;
    const mainElement = document.querySelector('main');
    if (mainElement) {
      const overflowDiv = mainElement.querySelector('div[class*="overflow-auto"], div.overflow-auto');
      if (overflowDiv && overflowDiv instanceof HTMLElement) {
        scrollContainer = overflowDiv;
      } else if (mainElement.scrollHeight > mainElement.clientHeight) {
        scrollContainer = mainElement;
      }
    }
    if (!scrollContainer) scrollContainer = document.documentElement;

    const headerOffset = 80;
    const containerRect = scrollContainer.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const relativeTop = elementRect.top - containerRect.top + scrollContainer.scrollTop;
    const targetScroll = Math.max(0, relativeTop - headerOffset);

    scrollContainer.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'complete':
        return 'fa-solid fa-circle-check text-green-600';
      case 'in_progress':
        return 'fa-solid fa-circle-half-stroke text-yellow-600';
      case 'not_started':
      default:
        return 'fa-regular fa-circle text-gray-400';
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishError(null);
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };

      // Pass effective draft config from UI state (avoids server/client in-memory state mismatch)
      const effectiveVoiceToneId = optimisticVoiceToneId ?? draftConfig?.voiceToneProfileId;
      const effectiveDraftConfig = effectiveVoiceToneId
        ? { ...draftConfig, voiceToneProfileId: effectiveVoiceToneId }
        : draftConfig ?? undefined;

      // Publish via server action so snapshot persists for widget iframe
      const quiz = quizDraft?.quizId ? quizzes.find(q => q.id === quizDraft.quizId) : null;
      const quizToPublish = quiz && !quiz.activePublishedVersionId ? quizDraft!.quizId : null;
      const snapshot = await publishProgramMatchAction(effectiveDraftConfig, quizToPublish);
      
      setLatestSnapshot(snapshot);
      router.refresh();
    } catch (error: any) {
      if (error.prerequisites) {
        setPublishError(error.prerequisites);
      } else {
        setPublishError([error.message || 'Failed to publish. Please try again.']);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyEmbed = async () => {
    if (!latestSnapshot) return;
    
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };
      
      // Find a quiz with an active published version
      const quizWithVersion = quizzes.find(q => q.activePublishedVersionId);
      if (!quizWithVersion?.activePublishedVersionId) {
        alert('No published quiz version available. Please publish a quiz first.');
        return;
      }
      
      const deployConfig = await dataClient.getProgramMatchDeployConfig(
        ctx,
        latestSnapshot.id,
        'js',
        quizWithVersion.activePublishedVersionId
      );
      await navigator.clipboard.writeText(deployConfig.snippet);
      alert('Embed snippet copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy embed:', error);
      alert('Failed to copy embed snippet. Please try again.');
    }
  };

  const handleCreatePreviewLink = async (mode: 'draft' | 'published', expiresInDays: number) => {
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };
      const targetId = mode === 'draft' ? 'draft_1' : (latestSnapshot?.id || '');
      if (!targetId) {
        alert('No published snapshot available');
        return;
      }
      await dataClient.createProgramMatchPreviewLink(ctx, { mode, targetId, expiresInDays });
      router.refresh();
    } catch (error) {
      console.error('Failed to create preview link:', error);
      alert('Failed to create preview link. Please try again.');
    }
  };

  const handleRevokePreviewLink = async (linkId: string) => {
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };
      await dataClient.revokeProgramMatchPreviewLink(ctx, linkId);
      router.refresh();
    } catch (error) {
      console.error('Failed to revoke preview link:', error);
      alert('Failed to revoke preview link. Please try again.');
    }
  };

  const quizVersionId = quizzes.find((q) => q.activePublishedVersionId)?.activePublishedVersionId ?? null;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stepper */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {(['basics', 'match_model', 'launch'] as const).map((step, idx) => (
              <button
                key={step}
                type="button"
                onClick={() => {
                  setActiveStep(step);
                  updateStepParam(step);
                  setOpenPanels(new Set(STEP_SECTIONS[step]));
                }}
                className={`flex items-center gap-2 text-sm font-medium ${
                  activeStep === step ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-current">
                  {idx + 1}
                </span>
                <span>
                  {step === 'basics' && 'Basics'}
                  {step === 'match_model' && 'Match Model'}
                  {step === 'launch' && 'Quiz + Launch'}
                </span>
              </button>
            ))}
            <div className="flex-1 min-w-[60px]" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {activeStep === 'basics' && 'Voice & Tone, Gate'}
            {activeStep === 'match_model' && 'Libraries, Programs, ICP'}
            {activeStep === 'launch' && 'Quiz, Preview & Deploy, Publish'}
          </p>
        </div>

        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Program Match</h1>
            {hubSummary && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(latestSnapshot ? 'published' : hubSummary.status)}`}>
                  {latestSnapshot ? 'Published' : hubSummary.status.charAt(0).toUpperCase() + hubSummary.status.slice(1)}
                </span>
                {latestSnapshot && (
                  <span>Version {latestSnapshot.version} • Published {formatDate(latestSnapshot.publishedAt)}</span>
                )}
                {!latestSnapshot && <span>Last updated: {formatDate(hubSummary.lastUpdated)}</span>}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreviewModal(true)}
            >
              Preview
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowShareLinkModal(true)}
            >
              Share preview link
            </Button>
            <Button
              variant="outline"
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyEmbed}
              disabled={!latestSnapshot}
            >
              Copy embed
            </Button>
          </div>
        </div>

        {/* Explanation Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-gray-900 mb-2">What it is</h2>
          <p className="text-sm text-gray-700 mb-3">
            Program Match helps prospective students discover which programs align with their interests, skills, and goals through an interactive quiz experience.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Flow:</span>
            <span>Gate</span>
            <FontAwesomeIcon icon="fa-solid fa-arrow-right" className="h-3 w-3" />
            <span>Quiz</span>
            <FontAwesomeIcon icon="fa-solid fa-arrow-right" className="h-3 w-3" />
            <span>Results</span>
            <FontAwesomeIcon icon="fa-solid fa-arrow-right" className="h-3 w-3" />
            <span>Next step</span>
          </div>
        </div>

        {/* Start with Template Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Start with a template</h3>
              <p className="text-sm text-gray-600">
                Pick a graduate program template pack to preload traits, skills, programs, and a starter quiz.
              </p>
            </div>
            <Button onClick={() => setShowTemplateGallery(true)}>
              <FontAwesomeIcon icon="fa-solid fa-layer-group" className="h-4 w-4 mr-2" />
              Browse templates
            </Button>
          </div>
        </div>

        {/* Setup Progress + Checklist */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Setup Progress</h2>
              {(optimisticHubSummary || hubSummary) && (
                <span className="text-sm text-gray-600">{(optimisticHubSummary || hubSummary)?.progressPercent}%</span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              {(optimisticHubSummary || hubSummary) && (
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(optimisticHubSummary || hubSummary)?.progressPercent}%` }}
                />
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Checklist</h3>
            <div className="space-y-2">
              {optimisticChecklist.map((item) => (
                <div key={`${item.id}-${item.state}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <FontAwesomeIcon icon={getStateIcon(item.state)} className="h-5 w-5" />
                  <span className="flex-1 text-sm text-gray-700">{item.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      goToSection(item.sectionId);
                    }}
                    className="text-xs"
                    type="button"
                  >
                    Go to
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content + Preview layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Sections */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Voice & Tone Section */}
            <Collapsible
              open={openPanels.has('voice-tone')}
              onOpenChange={(open) =>
                setOpenPanels((p) => {
                  const next = new Set(p);
                  if (open) next.add('voice-tone');
                  else next.delete('voice-tone');
                  return next;
                })
              }
            >
              <section id="voice-tone" className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <h2 className="text-lg font-semibold text-gray-900">Voice & Tone</h2>
                    <FontAwesomeIcon
                      icon={openPanels.has('voice-tone') ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'}
                      className="h-5 w-5 text-gray-500"
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-6 pt-0">
                    <p className="text-sm text-gray-600 mb-4">Configure the voice and tone for your Program Match experience.</p>
            <div className="space-y-2">
              <label htmlFor="voice-tone-select" className="block text-sm font-medium text-gray-700">
                Select Voice & Tone Profile
              </label>
              <select
                id="voice-tone-select"
                value={optimisticVoiceToneId || ''}
                onChange={async (e) => {
                  const selectedId = e.target.value === '' ? null : e.target.value;
                  console.log('[Voice Tone] Selected ID:', selectedId, 'from value:', e.target.value);
                  
                  // Optimistically update the UI immediately
                  setOptimisticVoiceToneId(selectedId);
                  console.log('[Voice Tone] Set optimisticVoiceToneId to:', selectedId);
                  
                  // Mark that we're making an optimistic update
                  justUpdatedOptimistically.current = true;
                  
                  // Optimistically update checklist immediately
                  setOptimisticChecklist(prevChecklist => {
                    console.log('[Voice Tone] Current checklist before update:', prevChecklist.find(item => item.id === 'checklist-1'));
                    const wasComplete = prevChecklist.find(item => item.id === 'checklist-1')?.state === 'complete';
                    const updated = prevChecklist.map(item => {
                      if (item.id === 'checklist-1') {
                        const newState = selectedId ? 'complete' : 'not_started';
                        console.log('[Voice Tone] Updating checklist-1 from', item.state, 'to', newState);
                        // Create a new object to ensure React detects the change
                        return { 
                          id: item.id,
                          label: item.label,
                          sectionId: item.sectionId,
                          state: newState as 'complete' | 'not_started' | 'in_progress'
                        };
                      }
                      return item;
                    });
                    const updatedItem = updated.find(item => item.id === 'checklist-1');
                    console.log('[Voice Tone] Updated checklist item:', updatedItem);
                    
                    // Update progress percent based on the updated checklist
                    if (optimisticHubSummary) {
                      const newCompleteCount = updated.filter(item => item.state === 'complete').length;
                      const newProgress = Math.round((newCompleteCount / updated.length) * 100);
                      console.log('[Voice Tone] Updated progress:', newProgress, '%', 'complete count:', newCompleteCount, 'total:', updated.length);
                      setOptimisticHubSummary({
                        ...optimisticHubSummary,
                        progressPercent: newProgress,
                      });
                    }
                    
                    return updated;
                  });
                  
                  setIsSavingVoiceTone(true);
                  try {
                    const ctx = {
                      workspace: 'admissions',
                      app: 'student-lifecycle',
                    };
                    const updated = await dataClient.updateProgramMatchDraftConfig(ctx, {
                      voiceToneProfileId: selectedId,
                    });
                    console.log('[Voice Tone] Update successful:', updated);
                    // Refresh the page to show updated data
                    router.refresh();
                  } catch (error) {
                    console.error('[Voice Tone] Failed to update:', error);
                    // Revert optimistic update on error
                    setOptimisticVoiceToneId(draftConfig?.voiceToneProfileId || null);
                    setOptimisticChecklist(checklist); // Revert to original checklist
                    setOptimisticHubSummary(hubSummary); // Revert progress
                    alert('Failed to update voice tone profile. Please try again.');
                  } finally {
                    setIsSavingVoiceTone(false);
                  }
                }}
                disabled={isSavingVoiceTone}
                className="block w-full max-w-md rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- Select a profile --</option>
                {voiceToneProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
              {(optimisticVoiceToneId || draftConfig?.voiceToneProfileId) && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {voiceToneProfiles.find(p => p.id === (optimisticVoiceToneId || draftConfig?.voiceToneProfileId))?.name || 'Unknown'}
                </p>
              )}
            </div>
                  </div>
                </CollapsibleContent>
            </section>
            </Collapsible>

            {/* Lead Capture Section */}
            <Collapsible
              open={openPanels.has('lead-capture')}
              onOpenChange={(open) =>
                setOpenPanels((p) => {
                  const next = new Set(p);
                  if (open) next.add('lead-capture');
                  else next.delete('lead-capture');
                  return next;
                })
              }
            >
              <section id="lead-capture" className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <h2 className="text-lg font-semibold text-gray-900">Lead Capture (Gate)</h2>
                    <FontAwesomeIcon
                      icon={openPanels.has('lead-capture') ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'}
                      className="h-5 w-5 text-gray-500"
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-6 pt-0">
                    <p className="text-sm text-gray-600 mb-4">Set up the gate that collects lead information before the quiz.</p>
                    <GateConfigPanel draftConfig={draftConfig} voiceToneProfiles={voiceToneProfiles} />
                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>

            {/* Libraries Section */}
            <Collapsible
              open={openPanels.has('libraries')}
              onOpenChange={(open) =>
                setOpenPanels((p) => {
                  const next = new Set(p);
                  if (open) next.add('libraries');
                  else next.delete('libraries');
                  return next;
                })
              }
            >
              <section id="libraries" className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <h2 className="text-lg font-semibold text-gray-900">Libraries</h2>
                    <FontAwesomeIcon
                      icon={openPanels.has('libraries') ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'}
                      className="h-5 w-5 text-gray-500"
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-6 pt-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Libraries</h2>
            <Tabs value={activeLibraryTab} onValueChange={(v) => setActiveLibraryTab(v as typeof activeLibraryTab)}>
              <TabsList>
                <TabsTrigger value="traits">
                  Traits {librariesSummary && `(${librariesSummary.traitsCount})`}
                </TabsTrigger>
                <TabsTrigger value="skills">
                  Skills {librariesSummary && `(${librariesSummary.skillsCount})`}
                </TabsTrigger>
                <TabsTrigger value="outcomes">
                  Outcomes {librariesSummary?.outcomesEnabled && '(Enabled)'}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="traits" className="mt-4">
                <TraitsTab traits={traits} />
              </TabsContent>
              <TabsContent value="skills" className="mt-4">
                <SkillsTab skills={skills} />
              </TabsContent>
              <TabsContent value="outcomes" className="mt-4">
                <OutcomesTab outcomes={outcomes} draftConfig={draftConfig} />
              </TabsContent>
            </Tabs>
                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>

            {/* Program ICP Section */}
            <Collapsible
              open={openPanels.has('program-icp')}
              onOpenChange={(open) =>
                setOpenPanels((p) => {
                  const next = new Set(p);
                  if (open) next.add('program-icp');
                  else next.delete('program-icp');
                  return next;
                })
              }
            >
              <section id="program-icp" className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <h2 className="text-lg font-semibold text-gray-900">Program ICP</h2>
                    <FontAwesomeIcon
                      icon={openPanels.has('program-icp') ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'}
                      className="h-5 w-5 text-gray-500"
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-6 pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ProgramsPanel
                  programs={programs}
                  selectedProgramId={selectedProgramId}
                  onSelectProgram={setSelectedProgramId}
                />
              </div>
              <div>
                {isLoadingIcp ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-600">Loading ICP...</p>
                  </div>
                ) : (
                  <ICPBuilder
                    program={programs.find(p => p.id === selectedProgramId) || null}
                    traits={traits}
                    skills={skills}
                    outcomes={outcomes}
                    icp={icp}
                    programOutcomes={programOutcomes}
                    draftConfig={draftConfig}
                  />
                )}
              </div>
            </div>
                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>

            {/* Quiz Section */}
            <Collapsible
              open={openPanels.has('quiz')}
              onOpenChange={(open) =>
                setOpenPanels((p) => {
                  const next = new Set(p);
                  if (open) next.add('quiz');
                  else next.delete('quiz');
                  return next;
                })
              }
            >
              <section id="quiz" className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <h2 className="text-lg font-semibold text-gray-900">Quiz</h2>
                    <FontAwesomeIcon
                      icon={openPanels.has('quiz') ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'}
                      className="h-5 w-5 text-gray-500"
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-6 pt-0">
            <QuizBuilder
              quizDraft={quizDraft}
              draftConfig={draftConfig}
              traits={traits}
              skills={skills}
              outcomes={outcomes}
              programs={programs}
            />
                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>

            {/* Preview & Deploy Section */}
            <Collapsible
              open={openPanels.has('preview-deploy')}
              onOpenChange={(open) =>
                setOpenPanels((p) => {
                  const next = new Set(p);
                  if (open) next.add('preview-deploy');
                  else next.delete('preview-deploy');
                  return next;
                })
              }
            >
              <section id="preview-deploy" className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <h2 className="text-lg font-semibold text-gray-900">Preview & Deploy</h2>
                    <FontAwesomeIcon
                      icon={openPanels.has('preview-deploy') ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'}
                      className="h-5 w-5 text-gray-500"
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-6 pt-0">
            <PreviewDeployPanel
              latestSnapshot={latestSnapshot}
              quizzes={quizzes}
              previewLinks={currentPreviewLinks}
              onCreatePreviewLink={handleCreatePreviewLink}
              onRevokePreviewLink={handleRevokePreviewLink}
            />
                  </div>
                </CollapsibleContent>
              </section>
            </Collapsible>
          </div>

          {/* Right: Preview Panel */}
          <div className="lg:w-[420px] shrink-0">
            <div className="lg:sticky lg:top-6">
              <ProgramMatchPreviewPanel
                latestSnapshot={latestSnapshot}
                quizVersionId={quizVersionId}
                isCollapsed={previewPanelCollapsed}
                onToggleCollapse={() => setPreviewPanelCollapsed((c) => !c)}
              />
            </div>
          </div>
        </div>

        {/* Post-launch: Candidates + Analytics */}
        <Collapsible defaultOpen={false}>
          <section className="bg-white border border-gray-200 rounded-lg overflow-hidden mt-6">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <h2 className="text-lg font-semibold text-gray-900">Post-launch (after you deploy)</h2>
                <FontAwesomeIcon icon="fa-solid fa-chevron-down" className="h-5 w-5 text-gray-500" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-6 pt-0 space-y-6">
                <div id="candidates">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Candidates</h3>
                  <CandidatesSection publishedSnapshots={publishedSnapshots} programs={programs} />
                </div>
                <div id="analytics">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Analytics</h3>
                  <AnalyticsSection publishedSnapshots={publishedSnapshots} />
                </div>
              </div>
            </CollapsibleContent>
          </section>
        </Collapsible>

          {/* Publish Error Modal */}
          {publishError && publishError.length > 0 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Publish Prerequisites Not Met</h3>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Please complete the following before publishing:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {publishError.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setPublishError(null)}>Close</Button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Modal */}
          {showPreviewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Preview Mode</h3>
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Configuration Summary</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                      <p><span className="font-medium">Voice & Tone:</span> {draftConfig?.voiceToneProfileId ? 'Selected' : 'Not selected'}</p>
                      <p><span className="font-medium">Traits:</span> {traits.filter(t => t.isActive).length} active</p>
                      <p><span className="font-medium">Skills:</span> {skills.filter(s => s.isActive).length} active</p>
                      <p><span className="font-medium">Programs:</span> {programs.filter(p => p.status === 'active').length} active</p>
                      <p><span className="font-medium">Quiz Questions:</span> {quizDraft?.questions.length || 0}</p>
                      {draftConfig?.outcomesEnabled && (
                        <p><span className="font-medium">Outcomes:</span> {outcomes.filter(o => o.isActive).length} active</p>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>This is a preview of your Program Match configuration. The actual quiz experience will be available after deployment.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Share Preview Link Modal */}
          {showShareLinkModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Share Preview Link</h3>
                  <button
                    onClick={() => setShowShareLinkModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                    <select
                      id="previewMode"
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      {latestSnapshot && <option value="published">Published (v{latestSnapshot.version})</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expires in (days)</label>
                    <select
                      id="expiresInDays"
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={7}>7 days</option>
                      <option value={14}>14 days</option>
                      <option value={30}>30 days</option>
                    </select>
                  </div>
                  <Button
                    onClick={() => {
                      const mode = (document.getElementById('previewMode') as HTMLSelectElement).value as 'draft' | 'published';
                      const days = Number((document.getElementById('expiresInDays') as HTMLSelectElement).value);
                      handleCreatePreviewLink(mode, days);
                      setShowShareLinkModal(false);
                    }}
                    className="w-full"
                  >
                    Create Link
                  </Button>
                  {currentPreviewLinks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Active Links</h4>
                      <div className="space-y-2">
                        {currentPreviewLinks.map((link) => (
                          <div key={link.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                            <div>
                              <p className="font-medium">{link.mode} • Expires {formatDate(link.expiresAt)}</p>
                              <p className="text-gray-500">{link.urlPath}{link.id}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}${link.urlPath}${link.id}`);
                                  alert('Link copied!');
                                }}
                              >
                                Copy
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevokePreviewLink(link.id)}
                              >
                                Revoke
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        {/* Template Gallery Modal */}
        {showTemplateGallery && (
          <TemplateGallery onClose={() => setShowTemplateGallery(false)} />
        )}
      </div>
    </div>
  );
}

