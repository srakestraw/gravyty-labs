'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dataClient } from '@/lib/data';
import type { ProgramMatchPublishSnapshot, ProgramMatchPreviewLink, ProgramMatchQuiz } from '@/lib/data/provider';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface PreviewDeployPanelProps {
  latestSnapshot: ProgramMatchPublishSnapshot | null;
  quizzes: ProgramMatchQuiz[];
  previewLinks: ProgramMatchPreviewLink[];
  onCreatePreviewLink: (mode: 'draft' | 'published', expiresInDays: number) => Promise<void>;
  onRevokePreviewLink: (linkId: string) => Promise<void>;
}

export function PreviewDeployPanel({
  latestSnapshot,
  quizzes,
  previewLinks,
  onCreatePreviewLink,
  onRevokePreviewLink,
}: PreviewDeployPanelProps) {
  const router = useRouter();
  const [embedType, setEmbedType] = useState<'js' | 'iframe'>('js');
  const [deployConfig, setDeployConfig] = useState<any>(null);
  const [isLoadingDeploy, setIsLoadingDeploy] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const loadDeployConfig = async () => {
      if (!latestSnapshot) return;
      
      // Find a quiz with an active published version
      const quizWithVersion = quizzes.find(q => q.activePublishedVersionId);
      if (!quizWithVersion?.activePublishedVersionId) {
        setDeployConfig(null);
        return;
      }
      
      setIsLoadingDeploy(true);
      try {
        const ctx = {
          workspace: 'admissions',
          app: 'student-lifecycle',
        };
        const config = await dataClient.getProgramMatchDeployConfig(
          ctx,
          latestSnapshot.id,
          embedType,
          quizWithVersion.activePublishedVersionId
        );
        setDeployConfig(config);
      } catch (error) {
        console.error('Failed to load deploy config:', error);
        setDeployConfig(null);
      } finally {
        setIsLoadingDeploy(false);
      }
    };

    loadDeployConfig();
  }, [latestSnapshot, embedType, quizzes]);

  const handleCopySnippet = () => {
    if (deployConfig?.snippet) {
      navigator.clipboard.writeText(deployConfig.snippet);
      alert('Embed snippet copied to clipboard!');
    }
  };

  const handleMarkVerified = async () => {
    if (!latestSnapshot) return;
    
    setIsVerifying(true);
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
      };
      await dataClient.markProgramMatchDeployVerified(ctx, latestSnapshot.id);
      router.refresh();
    } catch (error) {
      console.error('Failed to mark verified:', error);
      alert('Failed to mark deployment as verified. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!latestSnapshot) {
    return (
      <div className="text-center py-8 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600 mb-4">No published version yet. Publish your draft to enable deployment.</p>
      </div>
    );
  }

  // Check if there's a published quiz version available
  const quizWithVersion = quizzes.find(q => q.activePublishedVersionId);
  if (!quizWithVersion?.activePublishedVersionId) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Published Version {latestSnapshot.version}</h3>
              <p className="text-xs text-gray-600">Published {formatDate(latestSnapshot.publishedAt)}</p>
            </div>
          </div>
        </div>
        <div className="text-center py-8 border border-gray-200 rounded-lg bg-yellow-50">
          <p className="text-sm text-gray-700 mb-2 font-medium">No published quiz version available</p>
          <p className="text-xs text-gray-600">Please publish a quiz first to enable deployment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Published Version Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Published Version {latestSnapshot.version}</h3>
            <p className="text-xs text-gray-600">Published {formatDate(latestSnapshot.publishedAt)}</p>
          </div>
        </div>
      </div>

      {/* Embed Snippet */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">Embed Snippet</h3>
          <div className="flex gap-2">
            <Button
              variant={embedType === 'js' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEmbedType('js')}
            >
              JS
            </Button>
            <Button
              variant={embedType === 'iframe' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEmbedType('iframe')}
            >
              iFrame
            </Button>
          </div>
        </div>
        {isLoadingDeploy ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        ) : deployConfig ? (
          <div className="space-y-2">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <pre className="text-xs text-gray-800 whitespace-pre-wrap break-all">{deployConfig.snippet}</pre>
            </div>
            <Button onClick={handleCopySnippet} variant="outline" size="sm" className="w-full">
              <FontAwesomeIcon icon="fa-solid fa-copy" className="h-4 w-4 mr-1" />
              Copy Snippet
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">Failed to load embed snippet</p>
          </div>
        )}
      </div>

      {/* Verification */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">Deployment Verification</h3>
          {deployConfig?.verifiedAt ? (
            <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
              Verified {formatDate(deployConfig.verifiedAt)}
            </span>
          ) : (
            <Button
              onClick={handleMarkVerified}
              disabled={isVerifying}
              size="sm"
            >
              {isVerifying ? 'Verifying...' : 'Mark deployment verified'}
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-600">
          Mark as verified once you've successfully deployed the embed snippet to your website.
        </p>
      </div>
    </div>
  );
}


