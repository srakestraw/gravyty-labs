import { dataClient } from '@/lib/data';
import { ProgramMatchWidgetClient } from './ProgramMatchWidgetClient';

interface PageProps {
  params: { publishedSnapshotId: string };
}

export default async function ProgramMatchWidgetPage({ params }: PageProps) {
  const ctx = {
    workspace: 'admissions',
    app: 'student-lifecycle',
  };

  const widgetConfig = await dataClient.getProgramMatchWidgetConfig(ctx, {
    publishedSnapshotId: params.publishedSnapshotId,
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


