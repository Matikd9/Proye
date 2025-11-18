'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';
import { Sparkles, DollarSign, CheckCircle } from 'lucide-react';

interface Event {
  _id: string;
  eventType: string;
  numberOfGuests: number;
  ageRange: string;
  genderDistribution: string;
  budget?: number;
  preferences?: string;
  estimatedCost?: number;
  aiPlan?: {
    suggestions: string[];
    breakdown: {
      category: string;
      items: string[];
      estimatedCost: number;
    }[];
    recommendations: string[];
  };
}

export default function EventDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { locale } = useLanguage();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [planning, setPlanning] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  const fetchEvent = async () => {
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
  };

  const handlePlanWithAI = async () => {
    setPlanning(true);
    try {
      const response = await fetch(`/api/events/${params.id}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: locale }),
      });

      if (response.ok) {
        const plan = await response.json();
        await fetchEvent(); // Refresh event data
      } else {
        alert(t('common.error', locale));
      }
    } catch (error) {
      alert(t('common.error', locale));
    } finally {
      setPlanning(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t('common.loading', locale)}</div>;
  }

  if (!event) {
    return <div className="min-h-screen flex items-center justify-center">Evento no encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t(`events.eventTypes.${event.eventType}`, locale) || event.eventType}
              </h1>
              <p className="text-gray-600">
                {event.numberOfGuests} {t('events.numberOfGuests', locale)}
              </p>
            </div>
            {!event.aiPlan && (
              <button
                onClick={handlePlanWithAI}
                disabled={planning}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                {planning ? t('common.loading', locale) : t('events.planEvent', locale)}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                <p className="text-lg">${event.budget.toLocaleString()}</p>
              </div>
            )}
            {event.estimatedCost && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t('events.estimatedCost', locale)}</h3>
                <p className="text-lg font-semibold text-primary-600">${event.estimatedCost.toLocaleString()}</p>
              </div>
            )}
          </div>

          {event.preferences && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{t('events.preferences', locale)}</h3>
              <p className="text-gray-700">{event.preferences}</p>
            </div>
          )}

          {event.aiPlan && (
            <div className="space-y-6 border-t pt-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Sparkles className="h-6 w-6 mr-2 text-primary-600" />
                  Plan Generado por IA
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
                            ${category.estimatedCost.toLocaleString()}
                          </span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {category.items.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
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

