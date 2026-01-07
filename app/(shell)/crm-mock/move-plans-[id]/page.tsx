'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { crmMockProvider } from '@/lib/crm-mock';
import type { MovePlan, MoveStep } from '@/lib/crm-mock';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';

// Required for static export - return empty array to skip static generation
// Routes will still work via client-side routing
export async function generateStaticParams() {
  return [];
}

export default function MovePlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [movePlan, setMovePlan] = useState<MovePlan | null>(null);
  const [steps, setSteps] = useState<MoveStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [plan, stepsData] = await Promise.all([
        crmMockProvider.getMovePlan({}, id),
        crmMockProvider.listMoveSteps({}, id),
      ]);
      setMovePlan(plan);
      setSteps(stepsData.sort((a, b) => a.order - b.order));
      setLoading(false);
    }
    loadData();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'skipped':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading move plan...</div>
      </div>
    );
  }

  if (!movePlan) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Move plan not found</div>
      </div>
    );
  }

  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <FontAwesomeIcon icon="fa-solid fa-arrow-left" className="mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">Edit</Button>
          <Button>
            <FontAwesomeIcon icon="fa-solid fa-plus" className="mr-2" />
            Add Step
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{movePlan.name}</h1>
            {movePlan.description && <p className="text-gray-600 mt-1">{movePlan.description}</p>}
            <p className="text-gray-600 mt-2">
              Constituent:{' '}
              <button
                onClick={() => router.push(`/crm-mock/constituents/${movePlan.constituentId}`)}
                className="text-blue-600 hover:underline"
              >
                View Constituent
              </button>
            </p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(movePlan.status)}`}>
            {movePlan.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <div className="text-sm text-gray-600">Start Date</div>
            <div className="text-lg font-semibold">{movePlan.startDate ? formatDate(movePlan.startDate) : 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Target Date</div>
            <div className="text-lg font-semibold">{movePlan.targetDate ? formatDate(movePlan.targetDate) : '-'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Completed Date</div>
            <div className="text-lg font-semibold">
              {movePlan.completedDate ? formatDate(movePlan.completedDate) : '-'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Progress</div>
            <div className="text-lg font-semibold">{Math.round(progress)}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Steps Completed</span>
            <span className="text-sm font-medium">
              {completedSteps} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Move Steps</h2>
        {steps.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No steps yet</div>
        ) : (
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{step.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(step.status)}`}>
                      {step.status}
                    </span>
                  </div>
                  {step.description && <div className="text-sm text-gray-600 mb-2">{step.description}</div>}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="capitalize">{step.stepType}</span>
                    {step.dueDate && <span>Due: {formatDate(step.dueDate)}</span>}
                    {step.completedAt && <span>Completed: {formatDate(step.completedAt)}</span>}
                  </div>
                  {step.notes && <div className="text-sm text-gray-700 mt-2">{step.notes}</div>}
                </div>
                <Button variant="outline" size="sm">
                  {step.status === 'completed' ? 'Reopen' : 'Complete'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



