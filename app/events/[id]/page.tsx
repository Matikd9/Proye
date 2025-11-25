'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';
import { Sparkles, DollarSign, CheckCircle, Trash2, Edit2 } from 'lucide-react';

interface Event {
  _id: string;
  name: string;
  eventType: string;
  numberOfGuests: number;
  ageRange: string;
  genderDistribution: string;
  location: string;
  eventDate: string;
  budget?: number;
  preferences?: string;
  currency?: string;
  spendingStyle?: 'value' | 'balanced' | 'premium';
  estimatedCost?: number;
  aiPlan?: {
    suggestions: string[];
    breakdown: {
      category: string;
      items: {
        name: string;
        price: number;
        source: string;
        notes?: string;
      }[];
      estimatedCost: number;
    }[];
    recommendations: string[];
  };
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { locale } = useLanguage();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [planning, setPlanning] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchEvent = useCallback(async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchEvent();
    }
  }, [params.id, fetchEvent]);

  const handlePlanWithAI = async () => {
    setPlanning(true);
    try {
      const response = await fetch(`/api/events/${params.id}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: locale }),
      });

      if (response.ok) {
        await response.json();
        await fetchEvent();
      } else {
        alert(t('common.error', locale));
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      alert(t('common.error', locale));
    } finally {
      setPlanning(false);
    }
  };

  const handleEditEvent = () => {
    if (!params.id) return;
    router.push(`/events/${params.id}/edit`);
  };

  const handleDeleteEvent = async () => {
    if (!params.id) return;
    if (!window.confirm(t('events.deleteSingleConfirm', locale))) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/events/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/my-events');
      } else {
        alert(t('common.error', locale));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(t('common.error', locale));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t('common.loading', locale)}</div>;
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t('events.notFound', locale)}
      </div>
    );
  }

  const hasPlan = Boolean(event.aiPlan && Object.keys(event.aiPlan).length);
  const currencyCode = event.currency || 'CLP';
  const eventDateObj = event.eventDate ? new Date(event.eventDate) : null;
  const eventDateDisplay = eventDateObj && !isNaN(eventDateObj.getTime())
    ? eventDateObj.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : t('events.eventDatePlaceholder', locale);
  const currencyFormatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  });
  const translatedType = t(`events.eventTypes.${event.eventType}`, locale) || event.eventType;
  const eventName = event.name && event.name.trim().length > 0 ? event.name : translatedType;
  const spendingStyleLabel = event.spendingStyle ? t(`events.spendingStyle.${event.spendingStyle}`, locale) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{eventName}</h1>
              <p className="text-sm text-gray-500">{translatedType}</p>
              <p className="text-gray-600">
                {event.numberOfGuests} {t('events.numberOfGuests', locale)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handlePlanWithAI}
                disabled={planning}
                className={`flex items-center px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
                  hasPlan ? 'bg-primary-500 hover:bg-primary-600' : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                {planning
                  ? t('common.loading', locale)
                  : hasPlan
                    ? t('events.regeneratePlan', locale) || 'Regenerar plan con IA'
                    : t('events.planEvent', locale)}
              </button>
              <button
                onClick={handleEditEvent}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Edit2 className="h-5 w-5 mr-2" />
                {t('events.editEvent', locale)}
              </button>
              <button
                onClick={handleDeleteEvent}
                disabled={deleting}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                {deleting ? t('common.loading', locale) : t('events.deleteEvent', locale)}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('events.location', locale)}</h3>
              <p className="text-lg text-gray-900">{event.location}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('events.eventDate', locale)}</h3>
              <p className="text-lg text-gray-900 capitalize">{eventDateDisplay}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('events.ageRange', locale)}</h3>
              <p className="text-lg">{t(`events.ageRanges.${event.ageRange}`, locale) || event.ageRange}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('events.genderDistribution', locale)}</h3>
              <p className="text-lg">{t(`events.genderOptions.${event.genderDistribution}`, locale) || event.genderDistribution}</p>
            </div>
            {event.budget && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t('events.budget', locale)}</h3>
                <p className="text-lg">{currencyFormatter.format(event.budget)}</p>
              </div>
            )}
            {spendingStyleLabel && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t('events.spendingStyle.label', locale)}</h3>
                <p className="text-lg">{spendingStyleLabel}</p>
              </div>
            )}
            {event.estimatedCost && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t('events.estimatedCost', locale)}</h3>
                <p className="text-lg font-semibold text-primary-600">{currencyFormatter.format(event.estimatedCost)}</p>
              </div>
            )}
          </div>

          {event.preferences && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{t('events.preferences', locale)}</h3>
              <p className="text-gray-700">{event.preferences}</p>
            </div>
          )}

          {hasPlan && event.aiPlan && (
            <div className="space-y-6 border-t pt-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Sparkles className="h-6 w-6 mr-2 text-primary-600" />
                  {t('events.aiPlanTitle', locale)}
                </h2>
              </div>

              {event.aiPlan.suggestions && event.aiPlan.suggestions.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('events.suggestions', locale)}</h3>
                  <ul className="space-y-2">
                    {event.aiPlan.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {event.aiPlan.breakdown && event.aiPlan.breakdown.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('events.breakdown', locale)}</h3>
                  <div className="space-y-4">
                    {event.aiPlan.breakdown.map((category, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-gray-900">{category.category}</h4>
                          <span className="text-primary-600 font-medium">
                            {currencyFormatter.format(category.estimatedCost)}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {(category.items || []).map((item, itemIndex) => {
                            const itemPrice = typeof item.price === 'number' ? item.price : 0;
                            return (
                              <div key={itemIndex} className="border-t border-gray-200 pt-2 first:border-t-0 first:pt-0">
                                <div className="flex items-center justify-between text-sm text-gray-800">
                                  <span className="font-medium">{item.name}</span>
                                  <span>{currencyFormatter.format(itemPrice)}</span>
                                </div>
                                <p className="text-xs text-gray-500">
                                  {t('events.itemSource', locale)}: {item.source || t('events.itemSourceUnknown', locale)}
                                  {item.notes ? ` · ${item.notes}` : ''}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {event.aiPlan.recommendations && event.aiPlan.recommendations.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('events.recommendations', locale)}</h3>
                  <ul className="space-y-2">
                    {event.aiPlan.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <DollarSign className="h-5 w-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

