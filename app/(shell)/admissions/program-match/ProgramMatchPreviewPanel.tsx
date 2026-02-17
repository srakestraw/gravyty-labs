'use client';

import { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import type { ProgramMatchPublishSnapshot } from '@/lib/data/provider';

interface ProgramMatchPreviewPanelProps {
  latestSnapshot: ProgramMatchPublishSnapshot | null;
  quizVersionId: string | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function ProgramMatchPreviewPanel({
  latestSnapshot,
  quizVersionId,
  isCollapsed,
  onToggleCollapse,
}: ProgramMatchPreviewPanelProps) {
  const [previewMode, setPreviewMode] = useState<'draft' | 'published'>('published');
  const [deviceWidth, setDeviceWidth] = useState<'mobile' | 'desktop'>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  const canPreview = latestSnapshot && quizVersionId;
  const previewUrl = canPreview
    ? `/widgets/program-match/${latestSnapshot.id}?quizVersionId=${quizVersionId}&_t=${iframeKey}`
    : null;

  const handleRestart = useCallback(() => {
    setIframeKey((k) => k + 1);
  }, []);

  const previewWidth = deviceWidth === 'mobile' ? 375 : 480;

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg border border-dashed border-gray-300 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <FontAwesomeIcon icon="fa-solid fa-eye" className="h-4 w-4" />
        <span className="text-sm font-medium">Show Candidate Preview</span>
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg flex flex-col h-full min-h-[400px]">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Candidate Preview</h3>
        <button
          onClick={onToggleCollapse}
          className="p-2 text-gray-500 hover:text-gray-700"
          aria-label="Collapse preview"
        >
          <FontAwesomeIcon icon="fa-solid fa-chevron-right" className="h-5 w-5" />
        </button>
      </div>

      {!canPreview ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <FontAwesomeIcon icon="fa-solid fa-eye-slash" className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-sm text-gray-600 font-medium">Publish to enable in-app preview</p>
          <p className="text-xs text-gray-500 mt-1">
            Complete the setup and publish to see the candidate experience here.
          </p>
        </div>
      ) : (
        <>
          <div className="p-3 border-b border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {previewMode === 'published'
                  ? `Previewing published v${latestSnapshot.version}`
                  : 'Previewing draft'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={previewMode}
                onChange={(e) => setPreviewMode(e.target.value as 'draft' | 'published')}
                className="text-xs rounded border border-gray-300 px-2 py-1"
              >
                <option value="published">Published</option>
                <option value="draft">Draft (coming soon)</option>
              </select>
              <div className="flex rounded overflow-hidden border border-gray-300">
                <button
                  type="button"
                  onClick={() => setDeviceWidth('mobile')}
                  className={`px-2 py-1 text-xs ${deviceWidth === 'mobile' ? 'bg-gray-200 font-medium' : 'bg-white hover:bg-gray-50'}`}
                >
                  Mobile
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceWidth('desktop')}
                  className={`px-2 py-1 text-xs ${deviceWidth === 'desktop' ? 'bg-gray-200 font-medium' : 'bg-white hover:bg-gray-50'}`}
                >
                  Desktop
                </button>
              </div>
              <button
                type="button"
                onClick={handleRestart}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Restart preview
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-gray-50 flex justify-center">
            <div
              className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
              style={{ width: previewWidth, minHeight: 500 }}
            >
              <iframe
                key={iframeKey}
                src={previewUrl || undefined}
                title="Program Match Preview"
                className="w-full h-[500px] border-0"
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
