'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { crmMockProvider } from '@/lib/crm-mock';
import type { Gift, GiftAllocation, Receipt, Payment, SoftCredit, MatchingGift, Tribute } from '@/lib/crm-mock';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function GiftDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [gift, setGift] = useState<Gift | null>(null);
  const [allocations, setAllocations] = useState<GiftAllocation[]>([]);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [softCredits, setSoftCredits] = useState<SoftCredit[]>([]);
  const [matchingGifts, setMatchingGifts] = useState<MatchingGift[]>([]);
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [
        giftData,
        allocationsData,
        receiptsData,
        paymentsData,
        softCreditsData,
        matchingGiftsData,
        tributesData,
      ] = await Promise.all([
        crmMockProvider.getGift({}, id),
        crmMockProvider.listGiftAllocations({}, id),
        crmMockProvider.listReceipts({}, undefined, id),
        crmMockProvider.listPayments({}, id),
        crmMockProvider.listSoftCredits({}, id),
        crmMockProvider.listMatchingGifts({}, id),
        crmMockProvider.listTributes({}, id),
      ]);
      setGift(giftData);
      setAllocations(allocationsData);
      setReceipt(receiptsData.length > 0 ? receiptsData[0] : null);
      setPayments(paymentsData);
      setSoftCredits(softCreditsData);
      setMatchingGifts(matchingGiftsData);
      setTributes(tributesData);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading gift...</div>
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Gift not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <FontAwesomeIcon icon="fa-solid fa-arrow-left" className="mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">Edit</Button>
          <Button>Generate Receipt</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{formatCurrency(gift.amount)}</h1>
            <p className="text-gray-600 mt-1">
              Constituent:{' '}
              <button
                onClick={() => router.push(`/crm-mock/constituents/${gift.constituentId}`)}
                className="text-blue-600 hover:underline"
              >
                {gift.constituentId || 'Unknown'}
              </button>
            </p>
            <p className="text-gray-600">Date: {formatDate(gift.date)}</p>
          </div>
          <div className="flex gap-2">
            {gift.isAnonymous && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Anonymous</span>
            )}
            {gift.isTribute && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">Tribute</span>
            )}
            {gift.isMatchingGift && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                Matching Gift
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <div className="text-sm text-gray-600">Fund</div>
            <div className="text-lg font-semibold">{gift.fundName || '-'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Campaign</div>
            <div className="text-lg font-semibold">{gift.campaignName || '-'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Appeal</div>
            <div className="text-lg font-semibold">{gift.appealName || '-'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Fiscal Year</div>
            <div className="text-lg font-semibold">{gift.fiscalYear}</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="allocations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="allocations">Allocations</TabsTrigger>
          <TabsTrigger value="receipt">Receipt</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="soft-credits">Soft Credits</TabsTrigger>
          <TabsTrigger value="matching">Matching Gifts</TabsTrigger>
          <TabsTrigger value="tributes">Tributes</TabsTrigger>
        </TabsList>

        <TabsContent value="allocations" className="bg-white rounded-lg border p-6">
          <div className="space-y-4">
            {allocations.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No allocations</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fund</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allocations.map((allocation) => (
                    <tr key={allocation.id}>
                      <td className="px-4 py-2">{allocation.fundName || '-'}</td>
                      <td className="px-4 py-2">{allocation.designationName || '-'}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatCurrency(allocation.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={2} className="px-4 py-2 font-medium text-right">
                      Total:
                    </td>
                    <td className="px-4 py-2 text-right font-bold">
                      {formatCurrency(allocations.reduce((sum, a) => sum + a.amount, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="receipt" className="bg-white rounded-lg border p-6">
          {receipt ? (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700">Receipt Number</div>
                <div className="text-lg font-semibold">{receipt.receiptNumber}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Receipt Date</div>
                <div className="text-lg">{formatDate(receipt.receiptDate)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Amount</div>
                <div className="text-lg font-semibold">{formatCurrency(receipt.amount)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Method</div>
                <div className="text-lg capitalize">{receipt.method}</div>
              </div>
              {receipt.sentAt && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Sent At</div>
                  <div className="text-lg">{formatDate(receipt.sentAt)}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">No receipt generated</div>
          )}
        </TabsContent>

        <TabsContent value="payments" className="bg-white rounded-lg border p-6">
          <div className="space-y-4">
            {payments.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No payments</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-2">{formatDate(payment.paymentDate)}</td>
                      <td className="px-4 py-2 capitalize">{payment.paymentMethod}</td>
                      <td className="px-4 py-2">{payment.paymentReference || '-'}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatCurrency(payment.amount)}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 capitalize">
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="soft-credits" className="bg-white rounded-lg border p-6">
          <div className="space-y-4">
            {softCredits.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No soft credits</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Constituent</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {softCredits.map((sc) => (
                    <tr key={sc.id}>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => router.push(`/crm-mock/constituents/${sc.constituentId}`)}
                          className="text-blue-600 hover:underline"
                        >
                          View Constituent
                        </button>
                      </td>
                      <td className="px-4 py-2 capitalize">{sc.reason}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatCurrency(sc.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="matching" className="bg-white rounded-lg border p-6">
          <div className="space-y-4">
            {matchingGifts.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No matching gifts</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Match Ratio</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Match Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {matchingGifts.map((mg) => (
                    <tr key={mg.id}>
                      <td className="px-4 py-2">{mg.matchingCompanyName}</td>
                      <td className="px-4 py-2">{mg.matchRatio}x</td>
                      <td className="px-4 py-2 text-right font-medium">{formatCurrency(mg.matchAmount)}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 capitalize">
                          {mg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tributes" className="bg-white rounded-lg border p-6">
          <div className="space-y-4">
            {tributes.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No tributes</div>
            ) : (
              <div className="space-y-4">
                {tributes.map((tribute) => (
                  <div key={tribute.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 capitalize">
                        {tribute.type}
                      </span>
                    </div>
                    <div className="text-lg font-semibold">{tribute.honoreeName}</div>
                    {tribute.notificationSent && (
                      <div className="text-sm text-gray-600 mt-1">
                        Notification sent {tribute.notificationSentAt ? formatDate(tribute.notificationSentAt) : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}



