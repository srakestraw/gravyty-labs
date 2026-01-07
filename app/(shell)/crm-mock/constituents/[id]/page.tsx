'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { crmMockProvider } from '@/lib/crm-mock';
import type {
  ConstituentDetail,
  Gift,
  Interaction,
  Task,
  Event,
  EventParticipation,
  Household,
  Relationship,
  ProspectProfile,
  Rating,
  Opportunity,
  MovePlan,
  GiftAllocation,
  Receipt,
} from '@/lib/crm-mock';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ConstituentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const router = useRouter();
  const [constituent, setConstituent] = useState<ConstituentDetail | null>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventParticipations, setEventParticipations] = useState<EventParticipation[]>([]);
  const [household, setHousehold] = useState<Household | null>(null);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [prospectProfile, setProspectProfile] = useState<ProspectProfile | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [movePlans, setMovePlans] = useState<MovePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Load constituent detail
      const detail = await crmMockProvider.getConstituent({}, id);
      setConstituent(detail);

      // Load related data
      if (detail) {
        const [
          giftsData,
          interactionsData,
          tasksData,
          allEventsData,
          allParticipationsData,
          householdData,
          relationshipsData,
          prospectProfileData,
          ratingsData,
          opportunitiesData,
          movePlansData,
        ] = await Promise.all([
          crmMockProvider.listGifts({}, id),
          crmMockProvider.listInteractions({}, id),
          crmMockProvider.listTasks({}, id),
          crmMockProvider.listEvents({}),
          crmMockProvider.listEventParticipations({}),
          detail.householdId ? crmMockProvider.getHousehold({}, detail.householdId) : Promise.resolve(null),
          crmMockProvider.listRelationships({}, id),
          crmMockProvider.getProspectProfile({}, id),
          crmMockProvider.listRatings({}, id),
          crmMockProvider.listOpportunities({}, { filters: { constituentId: id } }),
          crmMockProvider.listMovePlans({}, id),
        ]);

        setGifts(giftsData);
        setInteractions(interactionsData);
        setTasks(tasksData);
        setHousehold(householdData);
        setRelationships(relationshipsData);
        setProspectProfile(prospectProfileData);
        setRatings(ratingsData);
        setOpportunities(opportunitiesData);
        setMovePlans(movePlansData);

        const constituentParticipations = allParticipationsData.filter((p) => p.constituentId === id);
        const constituentEventIds = new Set(constituentParticipations.map((p) => p.eventId));
        const constituentEvents = allEventsData.filter((e) => constituentEventIds.has(e.id));
        setEvents(constituentEvents);
        setEventParticipations(constituentParticipations);
      }

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getSentimentBgColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-700';
      case 'negative':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getSentimentTextColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSentimentTrendColor = (trend?: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!constituent) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Constituent Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Constituent 360
        </h1>
        <p className="text-gray-600">
          {constituent.name}
        </p>
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="giving">Giving</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="prospecting">Prospecting</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="outreach">Outreach</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          {/* Rollups */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Last Gift</h3>
              {constituent.lastGift ? (
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(constituent.lastGift.amount)}</p>
                  <p className="text-sm text-gray-500 mt-1">{formatDate(constituent.lastGift.date)}</p>
                </div>
              ) : (
                <p className="text-lg text-gray-400">No gifts</p>
              )}
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current FY Total</h3>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(constituent.currentFyTotal)}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Prior FY Total</h3>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(constituent.priorFyTotal)}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Propensity</h3>
              <p className="text-2xl font-bold text-gray-900">{constituent.propensity}</p>
            </div>
          </div>

          {/* Last Interaction */}
          {constituent.lastInteraction && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Last Touch</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{constituent.lastInteraction.type}</p>
                  <p className="text-sm text-gray-600">{constituent.lastInteraction.subject}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(constituent.lastInteraction.date)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sentiment Trend */}
          {constituent.sentimentTrend && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Sentiment Trend</h3>
              <p className={`text-lg font-semibold capitalize ${getSentimentTrendColor(constituent.sentimentTrend)}`}>
                {constituent.sentimentTrend}
              </p>
            </div>
          )}

          {/* Household */}
          {household && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Household</h3>
              <p className="text-lg font-semibold text-gray-900">{household.name}</p>
              <button
                onClick={() => router.push(`/crm-mock/households/${household.id}`)}
                className="text-sm text-blue-600 hover:underline mt-2"
              >
                View Household Details
              </button>
            </div>
          )}

          {/* Relationships */}
          {relationships.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Relationships</h3>
              <ul className="space-y-2">
                {relationships.slice(0, 5).map((rel) => (
                  <li key={rel.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 capitalize">{rel.type}</span>
                    <button
                      onClick={() => router.push(`/crm-mock/constituents/${rel.constituentId1 === id ? rel.constituentId2 : rel.constituentId1}`)}
                      className="text-blue-600 hover:underline"
                    >
                      View Related Constituent
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Top Drivers */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Top Drivers</h3>
            <ul className="space-y-2">
              <li className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Gifts</span>
                <span className="font-medium text-gray-900">{gifts.length}</span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Interactions</span>
                <span className="font-medium text-gray-900">{interactions.length}</span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Events Attended</span>
                <span className="font-medium text-gray-900">
                  {eventParticipations.filter((p) => p.status === 'attended').length}
                </span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Open Tasks</span>
                <span className="font-medium text-gray-900">{tasks.filter((t) => t.status === 'open').length}</span>
              </li>
            </ul>
          </div>
        </TabsContent>

        {/* Giving Tab */}
        <TabsContent value="giving" className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Gift History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiscal Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fund</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {gifts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No gifts found.
                      </td>
                    </tr>
                  ) : (
                    gifts.map((gift) => (
                      <tr key={gift.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(gift.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(gift.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {gift.fiscalYear}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {gift.fundName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {gift.receiptId ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Receipted</span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => router.push(`/crm-mock/gifts/${gift.id}`)}
                            className="text-blue-600 hover:underline"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          {/* Events Attended */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Events Attended</h3>
            {events.length === 0 ? (
              <p className="text-sm text-gray-500">No events attended.</p>
            ) : (
              <ul className="space-y-3">
                {events.map((event) => {
                  const participation = eventParticipations.find((p) => p.eventId === event.id);
                  return (
                    <li key={event.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{event.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(event.date)} • {event.location || 'Location TBD'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                        participation?.status === 'attended' ? 'bg-green-100 text-green-700' :
                        participation?.status === 'registered' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {participation?.status || 'Unknown'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Recent Interactions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Interactions</h3>
            {interactions.length === 0 ? (
              <p className="text-sm text-gray-500">No interactions found.</p>
            ) : (
              <ul className="space-y-3">
                {interactions.slice(0, 10).map((interaction) => (
                  <li key={interaction.id} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 capitalize">{interaction.type}</span>
                        {interaction.sentiment && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${getSentimentBgColor(interaction.sentiment)}`}>
                            {interaction.sentiment}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{interaction.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(interaction.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        {/* Prospecting Tab */}
        <TabsContent value="prospecting" className="space-y-4">
          {/* Prospect Profile */}
          {prospectProfile && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prospect Profile</h3>
              <div className="grid grid-cols-2 gap-4">
                {prospectProfile.capacity && (
                  <div>
                    <div className="text-sm text-gray-600">Capacity</div>
                    <div className="text-lg font-semibold">{formatCurrency(prospectProfile.capacity)}</div>
                  </div>
                )}
                {prospectProfile.inclination !== null && (
                  <div>
                    <div className="text-sm text-gray-600">Inclination</div>
                    <div className="text-lg font-semibold">{prospectProfile.inclination}/100</div>
                  </div>
                )}
                {prospectProfile.interests && Array.isArray(prospectProfile.interests) && (
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600 mb-2">Interests</div>
                    <div className="flex flex-wrap gap-2">
                      {prospectProfile.interests.map((interest, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {prospectProfile.researchNotes && (
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600 mb-2">Research Notes</div>
                    <div className="text-sm text-gray-900">{prospectProfile.researchNotes}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ratings */}
          {ratings.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ratings</h3>
              <div className="space-y-3">
                {ratings.map((rating) => (
                  <div key={rating.id} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900 capitalize">{rating.type}</span>
                      {rating.notes && <p className="text-xs text-gray-500 mt-1">{rating.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (rating.score ?? 0) >= 70 ? 'bg-green-600' : (rating.score ?? 0) >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${rating.score ?? 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{rating.score ?? rating.value ?? '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          {/* Opportunities */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Opportunities</h3>
            {opportunities.length === 0 ? (
              <p className="text-sm text-gray-500">No opportunities found.</p>
            ) : (
              <div className="space-y-3">
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/crm-mock/opportunities/${opp.id}`)}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{opp.name || 'Untitled'}</span>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 capitalize">
                          {opp.stage}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            opp.status === 'won'
                              ? 'bg-green-100 text-green-700'
                              : opp.status === 'lost'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {opp.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(opp.expectedAmount || opp.amount || 0)} • {opp.probability || 0}% probability
                      </div>
                    </div>
                    <FontAwesomeIcon icon="fa-solid fa-chevron-right" className="text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Move Plans */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Move Plans</h3>
            {movePlans.length === 0 ? (
              <p className="text-sm text-gray-500">No move plans found.</p>
            ) : (
              <div className="space-y-3">
                {movePlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/crm-mock/move-plans/${plan.id}`)}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{plan.name}</span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            plan.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : plan.status === 'active'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {plan.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Started {plan.startDate ? formatDate(plan.startDate) : 'N/A'}
                        {plan.targetDate && ` • Target: ${formatDate(plan.targetDate)}`}
                      </div>
                    </div>
                    <FontAwesomeIcon icon="fa-solid fa-chevron-right" className="text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Outreach Tab */}
        <TabsContent value="outreach" className="space-y-4">
          {/* Tasks */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks</h3>
            {tasks.length === 0 ? (
              <p className="text-sm text-gray-500">No tasks found.</p>
            ) : (
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          task.status === 'open' ? 'bg-blue-100 text-blue-700' :
                          task.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {task.status}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-gray-500">
                            Due: {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900">{task.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">Created: {formatDate(task.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Interaction Log */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Interaction Log</h3>
            {interactions.length === 0 ? (
              <p className="text-sm text-gray-500">No interactions found.</p>
            ) : (
              <ul className="space-y-3">
                {interactions.map((interaction) => (
                  <li key={interaction.id} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 capitalize">{interaction.type}</span>
                        {interaction.sentiment && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${getSentimentBgColor(interaction.sentiment)}`}>
                            {interaction.sentiment}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{interaction.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(interaction.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
