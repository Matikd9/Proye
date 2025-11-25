'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';
import type { LucideIcon } from 'lucide-react';
import {
  Search,
  Filter,
  MapPin,
  Sparkles,
  Phone,
  ExternalLink,
  Loader2,
  Camera,
  Palette,
  Utensils,
  Music2,
  Building2,
  Mail,
} from 'lucide-react';

type ServiceCategory = 'all' | 'catering' | 'decoration' | 'music' | 'photography' | 'venue' | 'other';

type ConcreteCategory = Exclude<ServiceCategory, 'all'>;

interface ServiceRecord {
  _id: string;
  name: string;
  provider: string;
  category: ServiceCategory;
  description?: string;
  price?: number;
  region?: string;
  city?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactUrl?: string;
}

const REGION_OPTIONS: { value: string; cities: string[] }[] = [
  { value: 'Región Metropolitana', cities: ['Santiago', 'Providencia', 'Ñuñoa', 'Las Condes', 'Maipú', 'Puente Alto'] },
  { value: 'Valparaíso', cities: ['Valparaíso', 'Viña del Mar', 'Concón', 'Quilpué'] },
  { value: 'Biobío', cities: ['Concepción', 'Talcahuano', 'Los Ángeles', 'Chillán'] },
  { value: 'Antofagasta', cities: ['Antofagasta', 'Calama'] },
  { value: 'La Araucanía', cities: ['Temuco', 'Villarrica', 'Pucón'] },
  { value: 'Los Lagos', cities: ['Puerto Montt', 'Puerto Varas', 'Osorno'] },
];

const CATEGORY_META: Record<ConcreteCategory, { icon: LucideIcon; badgeClass: string; glowClass: string; iconBgClass: string }> = {
  catering: {
    icon: Utensils,
    badgeClass: 'border-orange-200 bg-orange-50 text-orange-700',
    glowClass: 'from-orange-200/50 via-transparent to-transparent',
    iconBgClass: 'from-orange-50 to-orange-100 text-orange-600',
  },
  decoration: {
    icon: Palette,
    badgeClass: 'border-pink-200 bg-pink-50 text-pink-700',
    glowClass: 'from-pink-200/50 via-transparent to-transparent',
    iconBgClass: 'from-pink-50 to-pink-100 text-pink-600',
  },
  music: {
    icon: Music2,
    badgeClass: 'border-purple-200 bg-purple-50 text-purple-700',
    glowClass: 'from-purple-200/50 via-transparent to-transparent',
    iconBgClass: 'from-purple-50 to-purple-100 text-purple-600',
  },
  photography: {
    icon: Camera,
    badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',
    glowClass: 'from-blue-200/50 via-transparent to-transparent',
    iconBgClass: 'from-blue-50 to-blue-100 text-blue-600',
  },
  venue: {
    icon: Building2,
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    glowClass: 'from-emerald-200/50 via-transparent to-transparent',
    iconBgClass: 'from-emerald-50 to-emerald-100 text-emerald-600',
  },
  other: {
    icon: Sparkles,
    badgeClass: 'border-slate-200 bg-slate-50 text-slate-700',
    glowClass: 'from-slate-200/50 via-transparent to-transparent',
    iconBgClass: 'from-slate-50 to-slate-100 text-slate-600',
  },
};

const buildLocationLabel = (city?: string, region?: string) => {
  const parts = [city, region].filter(Boolean);
  return parts.length ? parts.join(', ') : region || '';
};

const formatCurrency = (value?: number) => {
  if (typeof value !== 'number') return null;
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function ServicesPage() {
  const { locale } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('all');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastLocationLabel, setLastLocationLabel] = useState<string | null>(null);

  const cityOptions = useMemo(() => {
    const region = REGION_OPTIONS.find((option) => option.value === selectedRegion);
    return region?.cities ?? [];
  }, [selectedRegion]);

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setSelectedCity('');
    setErrorMessage(null);
    if (!value) {
      setServices([]);
      setHasSearched(false);
      setLastLocationLabel(null);
    }
  };

  const handleSearch = async () => {
    if (!selectedRegion) {
      setErrorMessage(t('services.messages.regionRequired', locale));
      setHasSearched(false);
      setServices([]);
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.set('q', searchTerm.trim());
      }
      if (selectedCategory && selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      if (selectedRegion && selectedRegion !== 'all') {
        params.set('region', selectedRegion);
      }
      if (selectedCity) {
        params.set('city', selectedCity);
      }

      const endpoint = params.toString() ? `/api/services?${params.toString()}` : '/api/services';
      const response = await fetch(endpoint);

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Request failed');
      }

      const payload = (await response.json()) as ServiceRecord[];
      setServices(payload);
      const locationLabel = selectedRegion === 'all'
        ? t('services.filters.regionAll', locale)
        : buildLocationLabel(selectedCity, selectedRegion);
      setLastLocationLabel(locationLabel);
    } catch (error) {
      console.error('Error fetching services', error);
      setErrorMessage(t('services.messages.genericError', locale));
      setServices([]);
    } finally {
      setIsSearching(false);
    }
  };

  const renderEmptyState = () => {
    if (errorMessage) {
      return (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      );
    }

    const key = hasSearched ? 'services.messages.noResults' : 'services.messages.promptSearch';
    const replacements = hasSearched && lastLocationLabel ? { location: lastLocationLabel } : undefined;

    return (
      <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-gray-300">
        <p className="text-gray-500 max-w-2xl mx-auto">
          {t(key, locale, replacements)}
        </p>
      </div>
    );
  };

  const renderContactButton = (service: ServiceRecord) => {
    const contactHref = service.contactUrl
      || (service.contactEmail ? `mailto:${service.contactEmail}` : undefined)
      || (service.contactPhone ? `tel:${service.contactPhone.replace(/\s+/g, '')}` : undefined);

    if (!contactHref) {
      return (
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-400"
          disabled
        >
          <ExternalLink className="h-4 w-4" />
          {t('services.actions.openContact', locale)}
        </button>
      );
    }

    const isExternal = contactHref.startsWith('http');
    return (
      <a
        href={contactHref}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50/80 px-5 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-600 hover:text-white"
      >
        <ExternalLink className="h-4 w-4" />
        {t('services.actions.openContact', locale)}
      </a>
    );
  };

  const renderResults = () => {
    if (isSearching) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
          <p className="mt-3 text-sm">{t('services.messages.loading', locale)}</p>
        </div>
      );
    }

    if (!services.length) {
      return renderEmptyState();
    }

    return (
      <div className="grid gap-8 md:grid-cols-2">
        {services.map((service) => {
          const priceLabel = formatCurrency(service.price);
          const locationLabel = buildLocationLabel(service.city, service.region);
          const categoryKey = (service.category === 'all' ? 'other' : service.category) as ConcreteCategory;
          const categoryMeta = CATEGORY_META[categoryKey];
          const CategoryIcon = categoryMeta.icon;

          return (
            <article
              key={service._id}
              className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white/80 p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-2xl"
            >
              <div className={`pointer-events-none absolute -top-12 right-0 h-48 w-48 rounded-full opacity-0 blur-3xl transition group-hover:opacity-70 bg-gradient-to-br ${categoryMeta.glowClass}`} />

              <div className="relative flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${categoryMeta.iconBgClass}`}>
                  <CategoryIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-400">{service.provider}</p>
                  <h3 className="mt-1 text-2xl font-bold text-gray-900">{service.name}</h3>
                  {service.description && (
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{service.description}</p>
                  )}
                </div>
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${categoryMeta.badgeClass}`}>
                  <CategoryIcon className="h-3.5 w-3.5" />
                  {t(`services.categories.${service.category}`, locale)}
                </span>
              </div>

              <dl className="relative mt-6 grid gap-4 text-sm text-gray-600 sm:grid-cols-2">
                <div className="flex gap-3 rounded-2xl bg-gray-50/80 p-4">
                  <MapPin className="h-4 w-4 text-primary-500" />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('services.labels.location', locale)}</dt>
                    <dd className="text-base font-semibold text-gray-900">{locationLabel || t('services.labels.locationUnknown', locale)}</dd>
                  </div>
                </div>
                <div className="flex gap-3 rounded-2xl bg-gray-50/80 p-4">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('services.labels.startingAt', locale)}</dt>
                    <dd className="text-base font-semibold text-gray-900">{priceLabel ?? t('services.labels.askForQuote', locale)}</dd>
                  </div>
                </div>
                {service.contactPhone && (
                  <div className="flex gap-3 rounded-2xl bg-gray-50/80 p-4">
                    <Phone className="h-4 w-4 text-emerald-500" />
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('services.labels.phone', locale)}</dt>
                      <dd className="text-base font-semibold text-gray-900">{service.contactPhone}</dd>
                    </div>
                  </div>
                )}
                {service.contactEmail && (
                  <div className="flex gap-3 rounded-2xl bg-gray-50/80 p-4">
                    <Mail className="h-4 w-4 text-sky-500" />
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</dt>
                      <dd className="text-base font-semibold text-gray-900 break-all">{service.contactEmail}</dd>
                    </div>
                  </div>
                )}
              </dl>

              <div className="relative mt-6 flex flex-wrap items-center gap-4">
                {renderContactButton(service)}
                {service.contactUrl && !service.contactUrl.startsWith('mailto:') && (
                  <a
                    href={service.contactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-gray-500 underline-offset-4 hover:text-primary-600 hover:underline"
                  >
                    {service.contactUrl.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="text-center space-y-4">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">{t('services.title', locale)}</p>
          <h1 className="text-4xl font-black text-gray-900">{t('services.catalogTitle', locale)}</h1>
          <p className="text-base text-gray-600 max-w-3xl mx-auto">{t('services.catalogSubtitle', locale)}</p>
        </header>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('services.filters.searchPlaceholder', locale)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </label>
            <label className="relative block">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ServiceCategory)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">{t('services.filters.categoryLabel', locale)}</option>
                <option value="catering">{t('services.categories.catering', locale)}</option>
                <option value="decoration">{t('services.categories.decoration', locale)}</option>
                <option value="music">{t('services.categories.music', locale)}</option>
                <option value="photography">{t('services.categories.photography', locale)}</option>
                <option value="venue">{t('services.categories.venue', locale)}</option>
                <option value="other">{t('services.categories.other', locale)}</option>
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">{t('services.filters.regionLabel', locale)}</option>
              <option value="all">{t('services.filters.regionAll', locale)}</option>
              {REGION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value}
                </option>
              ))}
            </select>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!cityOptions.length}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">{t('services.filters.cityAll', locale)}</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              {selectedRegion
                ? t('services.live.searchSummary', locale, {
                    location:
                      selectedRegion === 'all'
                        ? t('services.filters.regionAll', locale)
                        : buildLocationLabel(selectedCity, selectedRegion) || selectedRegion,
                  })
                : t('services.live.searchHint', locale)}
            </p>
            <button
              onClick={handleSearch}
              disabled={isSearching || !selectedRegion}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:opacity-60"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {t('services.actions.findRealServices', locale)}
            </button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('services.live.title', locale)}</h2>
              <p className="text-sm text-gray-500">{t('services.live.subtitle', locale)}</p>
            </div>
          </div>

          {lastLocationLabel && services.length > 0 && (
            <p className="text-xs text-gray-500">
              {t('services.live.lastUpdate', locale, { location: lastLocationLabel })}
            </p>
          )}

          {renderResults()}
        </section>
      </div>
    </div>
  );
}

