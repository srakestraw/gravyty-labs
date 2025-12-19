import { dataClient } from '@/lib/data';
import { ProgramMatchWidgetClient } from './ProgramMatchWidgetClient';

// Required for static export with dynamic routes
// Return empty array - widget will handle dynamic behavior client-side
export async function generateStaticParams() {
  return [];
}

interface PageProps {
  params: { publishedSnapshotId: string };
  searchParams: { quizVersionId?: string };
}

export default async function ProgramMatchWidgetPage({ params, searchParams }: PageProps) {
  const ctx = {
    workspace: 'admissions',
    app: 'student-lifecycle',
  };

  // quizVersionId is required - if not provided, return error
  if (!searchParams.quizVersionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Invalid Configuration</h1>
          <p className="text-sm text-gray-600">Quiz version ID is required.</p>
        </div>
      </div>
    );
  }

  const widgetConfig = await dataClient.getProgramMatchWidgetConfig(ctx, {
    publishedSnapshotId: params.publishedSnapshotId,
    quizVersionId: searchParams.quizVersionId,
  });

  if (!widgetConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Program Match Not Found</h1>
          <p className="text-sm text-gray-600">The requested program match configuration could not be found.</p>
        </div>
      </div>
    );
  }

  return <ProgramMatchWidgetClient widgetConfig={widgetConfig} />;
}


