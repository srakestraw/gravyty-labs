'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { dataClient } from '@/lib/data';
import type { ProgramMatchRFI, ProgramMatchPublishSnapshot, ProgramMatchProgram } from '@/lib/data/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface CandidatesSectionProps {
  publishedSnapshots: ProgramMatchPublishSnapshot[];
  programs: ProgramMatchProgram[];
}

type StatusFilter = 'all' | 'started' | 'completed' | 'abandoned';

export function CandidatesSection({ publishedSnapshots, programs }: CandidatesSectionProps) {
  const router = useRouter();
  const [candidates, setCandidates] = useState<ProgramMatchRFI[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<7 | 30 | 90>(30);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<ProgramMatchRFI | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [abandonsMarked, setAbandonsMarked] = useState<number | null>(null);

  const latestSnapshot = useMemo(() => {
    if (publishedSnapshots.length === 0) return null;
    return publishedSnapshots.sort((a, b) => b.version - a.version)[0];
  }, [publishedSnapshots]);

  useEffect(() => {
    setSelectedSnapshotId(latestSnapshot?.id || null);
  }, [latestSnapshot]);

  useEffect(() => {
    // Mark abandons on load
    const markAbandons = async () => {
      try {
        const ctx = {
          workspace: 'admissions',
          app: 'student-lifecycle',
        };
        const result = await dataClient.markProgramMatchAbandons(ctx, { olderThanMinutes: 60 });
        if (result.marked > 0) {
          setAbandonsMarked(result.marked);
          setTimeout(() => setAbandonsMarked(null), 5000);
        }
      } catch (error) {
        console.error('Failed to mark abandons:', error);
      }
    };

    markAbandons();
  }, []);

  useEffect(() => {
    const loadCandidates = async () => {
      if (!selectedSnapshotId) {
        setCandidates([]);
        setTotal(0);
        return;
      }

      setIsLoading(true);
      try {
        const ctx = {
          workspace: 'admissions',
          app: 'student-lifecycle',
        };

        const rangeStart = new Date();
        rangeStart.setDate(rangeStart.getDate() - dateRange);

        const response = await dataClient.listProgramMatchCandidates(ctx, {
          publishedSnapshotId: selectedSnapshotId,
          status: statusFilter === 'all' ? undefined : statusFilter,
          q: searchQuery.trim() || undefined,
          startedAfter: rangeStart.toISOString(),
          limit: 100,
        });

        setCandidates(response.rows);
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to load candidates:', error);
        setCandidates([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidates();
  }, [selectedSnapshotId, statusFilter, searchQuery, dateRange]);

  const handleExportCSV = async () => {
    if (!selectedSnapshotId) return;

    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };
      const result = await dataClient.exportProgramMatchCandidatesCSV(ctx, {
        publishedSnapshotId: selectedSnapshotId,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });

      // Create blob and download
      const blob = new Blob([result.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export CSV. Please try again.');
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
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'abandoned':
        return 'bg-red-100 text-red-800';
      case 'started':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressText = (rfi: ProgramMatchRFI) => {
    if (rfi.status === 'completed') return 'Completed';
    if (rfi.status === 'abandoned') return 'Abandoned';
    if (rfi.progress.lastQuestionIndex !== undefined) {
      // Estimate total questions from snapshot (simplified)
      return `Q${rfi.progress.lastQuestionIndex + 1}`;
    }
    return 'Not started';
  };

  const getTopMatchName = (rfi: ProgramMatchRFI) => {
    if (!rfi.results || rfi.results.topProgramIds.length === 0) return '-';
    const program = programs.find(p => p.id === rfi.results!.topProgramIds[0]);
    return program?.name || '-';
  };

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email;
    return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
  };

  if (!latestSnapshot) {
    return (
      <div className="text-center py-8 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">No published version yet. Publish your draft to see candidates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Candidates</h3>
          {abandonsMarked !== null && (
            <p className="text-xs text-green-600 mt-1">Abandons updated ({abandonsMarked} marked)</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {publishedSnapshots.length > 1 && (
            <select
              value={selectedSnapshotId || ''}
              onChange={(e) => setSelectedSnapshotId(e.target.value || null)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {publishedSnapshots.sort((a, b) => b.version - a.version).map(s => (
                <option key={s.id} value={s.id}>Version {s.version}</option>
              ))}
            </select>
          )}
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <FontAwesomeIcon icon="fa-solid fa-download" className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex gap-1">
          {(['all', 'started', 'completed', 'abandoned'] as StatusFilter[]).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <Input
          type="text"
          placeholder="Search by email or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 max-w-xs"
        />
        <select
          value={dateRange}
          onChange={(e) => setDateRange(Number(e.target.value) as 7 | 30 | 90)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-600">Loading candidates...</p>
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-8 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">No candidates found</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Candidate</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Started</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Last Activity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Progress</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Top Match</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {candidates.map((rfi) => (
                <tr key={rfi.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {rfi.contact.firstName && rfi.contact.lastName
                          ? `${rfi.contact.firstName} ${rfi.contact.lastName}`
                          : 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">{maskEmail(rfi.contact.email)}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(rfi.status)}`}>
                      {rfi.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(rfi.progress.startedAt)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(rfi.progress.lastActivityAt)}</td>
                  <td className="px-4 py-3 text-gray-600">{getProgressText(rfi)}</td>
                  <td className="px-4 py-3 text-gray-600">{getTopMatchName(rfi)}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCandidate(rfi);
                        setShowDetailDrawer(true);
                      }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Drawer */}
      {showDetailDrawer && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black bg-opacity-50">
          <div className="bg-white rounded-t-lg border-t border-gray-200 shadow-lg w-full max-w-lg h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Candidate Details</h3>
              <button
                onClick={() => {
                  setShowDetailDrawer(false);
                  setSelectedCandidate(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Contact Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Contact Information</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                  <p><span className="font-medium">Email:</span> {selectedCandidate.contact.email}</p>
                  {selectedCandidate.contact.firstName && (
                    <p><span className="font-medium">First Name:</span> {selectedCandidate.contact.firstName}</p>
                  )}
                  {selectedCandidate.contact.lastName && (
                    <p><span className="font-medium">Last Name:</span> {selectedCandidate.contact.lastName}</p>
                  )}
                  {selectedCandidate.contact.phone && (
                    <p><span className="font-medium">Phone:</span> {selectedCandidate.contact.phone}</p>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Timeline</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                  <p><span className="font-medium">Started:</span> {formatDate(selectedCandidate.progress.startedAt)}</p>
                  <p><span className="font-medium">Last Activity:</span> {formatDate(selectedCandidate.progress.lastActivityAt)}</p>
                  {selectedCandidate.progress.completedAt && (
                    <p><span className="font-medium">Completed:</span> {formatDate(selectedCandidate.progress.completedAt)}</p>
                  )}
                  {selectedCandidate.abandonment?.abandonedAt && (
                    <p><span className="font-medium">Abandoned:</span> {formatDate(selectedCandidate.abandonment.abandonedAt)}</p>
                  )}
                  {selectedCandidate.progress.lastQuestionIndex !== undefined && (
                    <p><span className="font-medium">Progress:</span> Question {selectedCandidate.progress.lastQuestionIndex + 1}</p>
                  )}
                </div>
              </div>

              {/* Results */}
              {selectedCandidate.status === 'completed' && selectedCandidate.results && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Results</h4>
                  <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                    <p className="text-sm font-medium text-gray-900">
                      Top Match: {getTopMatchName(selectedCandidate)}
                    </p>
                    <p className="text-xs text-gray-600">
                      Confidence: {selectedCandidate.results.confidenceLabel.charAt(0).toUpperCase() + selectedCandidate.results.confidenceLabel.slice(1)}
                    </p>
                    <ul className="space-y-1 mt-2">
                      {selectedCandidate.results.reasons.map((reason, idx) => (
                        <li key={idx} className="text-xs text-gray-700 flex items-start gap-1">
                          <FontAwesomeIcon icon="fa-solid fa-check" className="h-3 w-3 text-blue-600 mt-0.5 shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Abandoned Follow-up */}
              {selectedCandidate.status === 'abandoned' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900 mb-2">Follow-up Recommended</p>
                  <p className="text-xs text-gray-600 mb-3">
                    This candidate started the quiz but didn't complete it. Consider reaching out to re-engage.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedCandidate.contact.email);
                      alert('Email copied to clipboard');
                    }}
                  >
                    <FontAwesomeIcon icon="fa-solid fa-copy" className="h-3 w-3 mr-1" />
                    Copy Email
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




