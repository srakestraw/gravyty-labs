'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { crmMockProvider } from '@/lib/crm-mock';
import type { Opportunity, StageHistory } from '@/lib/crm-mock';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Required for static export - return empty array to skip static generation
// Routes will still work via client-side routing
export async function generateStaticParams() {
  return [];
}

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [stageHistory, setStageHistory] = useState<StageHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [opp, history] = await Promise.all([
        crmMockProvider.getOpportunity({}, id),
        crmMockProvider.listStageHistory({}, id),
      ]);
      setOpportunity(opp);
      setStageHistory(history);
      setLoading(false);
    }
    loadData();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-100 text-green-700';
      case 'lost':
        return 'bg-red-100 text-red-700';
      case 'open':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading opportunity...</div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Opportunity not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={() => router.back()}>
            <FontAwesomeIcon icon="fa-solid fa-arrow-left" className="mr-2" />
            Back
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit</Button>
          <Button>Add Stage</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{opportunity.name || 'Untitled Opportunity'}</h1>
            <p className="text-gray-600 mt-1">
              Constituent:{' '}
              <button
                onClick={() => router.push(`/crm-mock/constituents/${opportunity.constituentId}`)}
                className="text-blue-600 hover:underline"
              >
                {opportunity.constituentId || 'Unknown'}
              </button>
            </p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(opportunity.status)}`}>
            {opportunity.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <div className="text-sm text-gray-600">Expected Amount</div>
            <div className="text-lg font-semibold">
              {formatCurrency(opportunity.expectedAmount || opportunity.amount || 0)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Probability</div>
            <div className="text-lg font-semibold">{opportunity.probability || 0}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Expected Close Date</div>
            <div className="text-lg font-semibold">
              {opportunity.expectedCloseDate ? formatDate(opportunity.expectedCloseDate) : '-'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Stage</div>
            <div className="text-lg font-semibold capitalize">{opportunity.stage}</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">Stage History</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="bg-white rounded-lg border p-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-700">Campaign</div>
              <div className="text-gray-900">{opportunity.campaignName || '-'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Fund</div>
              <div className="text-gray-900">{opportunity.fundName || '-'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Appeal</div>
              <div className="text-gray-900">{opportunity.appealName || '-'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Created</div>
              <div className="text-gray-900">{formatDate(opportunity.createdAt)}</div>
            </div>
            {opportunity.closeDate && (
              <div>
                <div className="text-sm font-medium text-gray-700">Close Date</div>
                <div className="text-gray-900">{formatDate(opportunity.closeDate)}</div>
              </div>
            )}
            {opportunity.closeReason && (
              <div>
                <div className="text-sm font-medium text-gray-700">Close Reason</div>
                <div className="text-gray-900">{opportunity.closeReason}</div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="bg-white rounded-lg border p-6">
          <div className="space-y-4">
            {stageHistory.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No stage history</div>
            ) : (
              <div className="space-y-3">
                {stageHistory.map((entry, index) => (
                  <div key={entry.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{entry.stage}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(entry.status)}`}>
                          {entry.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Changed by {entry.changedBy} on {formatDateTime(entry.changedAt)}
                      </div>
                      {entry.notes && <div className="text-sm text-gray-700 mt-2">{entry.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notes" className="bg-white rounded-lg border p-6">
          <div className="text-gray-500">
            {opportunity.notes || 'No notes available'}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}



