'use client';

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/data';
import type {
  ProgramMatchHubSummary,
  ProgramMatchChecklistItem,
  ProgramMatchLibrariesSummary,
  ProgramMatchProgramsSummary,
  ProgramMatchCandidatesSummary,
  ProgramMatchAnalyticsSummary,
} from '@/lib/data/provider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

export default function ProgramMatchPage() {
  const [hubSummary, setHubSummary] = useState<ProgramMatchHubSummary | null>(null);
  const [checklist, setChecklist] = useState<ProgramMatchChecklistItem[]>([]);
  const [librariesSummary, setLibrariesSummary] = useState<ProgramMatchLibrariesSummary | null>(null);
  const [programsSummary, setProgramsSummary] = useState<ProgramMatchProgramsSummary | null>(null);
  const [candidatesSummary, setCandidatesSummary] = useState<ProgramMatchCandidatesSummary | null>(null);
  const [analyticsSummary, setAnalyticsSummary] = useState<ProgramMatchAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLibraryTab, setActiveLibraryTab] = useState<'traits' | 'skills' | 'outcomes'>('traits');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const ctx = {
          workspace: 'admissions',
          app: 'student-lifecycle',
        };

        const [
          summary,
          checklistData,
          libraries,
          programs,
          candidates,
          analytics,
        ] = await Promise.all([
          dataClient.getProgramMatchHubSummary(ctx),
          dataClient.getProgramMatchChecklist(ctx),
          dataClient.getProgramMatchLibrariesSummary(ctx),
          dataClient.getProgramMatchProgramsSummary(ctx),
          dataClient.getProgramMatchCandidatesSummary(ctx),
          dataClient.getProgramMatchAnalyticsSummary(ctx),
        ]);

        setHubSummary(summary);
        setChecklist(checklistData);
        setLibrariesSummary(libraries);
        setProgramsSummary(programs);
        setCandidatesSummary(candidates);
        setAnalyticsSummary(analytics);
      } catch (error) {
        console.error('Failed to load Program Match data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading Program Match Hub...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Program Match</h1>
            {hubSummary && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(hubSummary.status)}`}>
                  {hubSummary.status.charAt(0).toUpperCase() + hubSummary.status.slice(1)}
                </span>
                <span>Last updated: {formatDate(hubSummary.lastUpdated)}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              Preview
            </Button>
            <Button variant="outline" disabled>
              Share preview link
            </Button>
            <Button variant="outline" disabled>
              Publish
            </Button>
            <Button variant="outline" disabled>
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

        {/* Setup Progress + Checklist */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Setup Progress</h2>
              {hubSummary && (
                <span className="text-sm text-gray-600">{hubSummary.progressPercent}%</span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              {hubSummary && (
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${hubSummary.progressPercent}%` }}
                />
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Checklist</h3>
            <div className="space-y-2">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <FontAwesomeIcon icon={getStateIcon(item.state)} className="h-5 w-5" />
                  <span className="flex-1 text-sm text-gray-700">{item.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => scrollToSection(item.sectionId)}
                    className="text-xs"
                  >
                    Go to
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* Voice & Tone Section */}
          <section id="voice-tone" className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Voice & Tone</h2>
            <p className="text-sm text-gray-600">Configure the voice and tone for your Program Match experience.</p>
          </section>

          {/* Lead Capture Section */}
          <section id="lead-capture" className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Capture (Gate)</h2>
            <p className="text-sm text-gray-600">Set up the gate that collects lead information before the quiz.</p>
          </section>

          {/* Libraries Section */}
          <section id="libraries" className="bg-white border border-gray-200 rounded-lg p-6">
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
                <div className="text-center py-8 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-4">No traits defined yet</p>
                  <Button variant="outline" disabled>
                    Add Trait
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="skills" className="mt-4">
                <div className="text-center py-8 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-4">No skills defined yet</p>
                  <Button variant="outline" disabled>
                    Add Skill
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="outcomes" className="mt-4">
                <div className="text-center py-8 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-4">
                    {librariesSummary?.outcomesEnabled
                      ? 'Outcomes are enabled'
                      : 'Outcomes are not enabled'}
                  </p>
                  <Button variant="outline" disabled>
                    {librariesSummary?.outcomesEnabled ? 'Manage Outcomes' : 'Enable Outcomes'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </section>

          {/* Program ICP Section */}
          <section id="program-icp" className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Program ICP</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Programs</h3>
                {programsSummary && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 mb-2">
                      Active: {programsSummary.activeProgramsCount} | Draft: {programsSummary.draftProgramsCount}
                    </div>
                    {programsSummary.programs.length === 0 ? (
                      <div className="text-center py-8 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-4">No programs defined yet</p>
                        <Button variant="outline" disabled>
                          Add Program
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {programsSummary.programs.map((program) => (
                          <div key={program.id} className="p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{program.name}</span>
                              <span className={`text-xs px-2 py-1 rounded ${program.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {program.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">ICP Buckets</h3>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {['High Match', 'Medium Match', 'Low Match', 'No Match'].map((bucket) => (
                      <div key={bucket} className="p-3 bg-gray-50 rounded text-center">
                        <p className="text-xs text-gray-600">{bucket}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-4 text-center">ICP bucket configuration placeholder</p>
                </div>
              </div>
            </div>
          </section>

          {/* Quiz Section */}
          <section id="quiz" className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz</h2>
            <p className="text-sm text-gray-600">Configure quiz questions and flow.</p>
          </section>

          {/* Preview & Deploy Section */}
          <section id="preview-deploy" className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview & Deploy</h2>
            <p className="text-sm text-gray-600">Preview your Program Match experience and deploy it.</p>
          </section>

          {/* Candidates Section */}
          <section id="candidates" className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Candidates</h2>
            {candidatesSummary && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {candidatesSummary.columns.map((column) => (
                        <th key={column.id} className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {candidatesSummary.rows.length === 0 ? (
                      <tr>
                        <td colSpan={candidatesSummary.columns.length} className="text-center py-8 text-sm text-gray-600">
                          No candidates yet
                        </td>
                      </tr>
                    ) : (
                      candidatesSummary.rows.map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          {candidatesSummary.columns.map((column) => (
                            <td key={column.id} className="py-3 px-4 text-sm text-gray-900">
                              {String(row[column.id] || '')}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Analytics Section */}
          <section id="analytics" className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h2>
            {analyticsSummary && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {analyticsSummary.tiles.map((tile) => (
                    <div key={tile.id} className="border border-gray-200 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">{tile.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{tile.value}</p>
                      {tile.subtext && (
                        <p className="text-xs text-gray-500 mt-1">{tile.subtext}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-sm text-gray-600">Chart placeholder</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
