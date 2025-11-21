'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';
import {
  Search,
  Filter,
  MapPin,
  Sparkles,
  BadgeCheck,
  Leaf,
  Star,
  Music4,
  Camera,
  ChefHat,
} from 'lucide-react';

type ServiceCategory = 'catering' | 'decoration' | 'music' | 'photography' | 'venue' | 'other';
type ServiceTag = 'local' | 'eco' | 'premium' | 'express';
type RecommendedEvent = 'birthday' | 'friends' | 'corporate' | 'wedding' | 'other';

interface LocalizedCopy {
  es: string;
  en: string;
}

interface ServiceTemplate {
  id: string;
  name: LocalizedCopy;
  provider: string;
  category: ServiceCategory;
  description: LocalizedCopy;
  priceRange: [number, number];
  coverageArea: string;
  tags: ServiceTag[];
  highlights: LocalizedCopy[];
  recommendedEvents: RecommendedEvent[];
  bookingNotice: LocalizedCopy;
  featured?: boolean;
  contactHandle: string;
}

const serviceCatalog: ServiceTemplate[] = [
  {
    id: 'andina-catering',
    name: { es: 'Andina Catering Consciente', en: 'Andina Conscious Catering' },
    provider: 'María José Díaz',
    category: 'catering',
    description: {
      es: 'Buffet chileno de temporada con opciones plant-based y montaje de estaciones vivas.',
      en: 'Seasonal Chilean buffet with plant-based options and living food stations.',
    },
    priceRange: [180000, 360000],
    coverageArea: 'RM, Valparaíso',
    tags: ['local', 'eco'],
    highlights: [
      { es: 'Menú cero desperdicio con proveedores campesinos.', en: 'Zero-waste menu partnering with small farmers.' },
      { es: 'Estaciones inmersivas con relato gastronómico.', en: 'Immersive stations narrated by culinary guides.' },
      { es: 'Incluye vajilla reutilizable y compostaje.', en: 'Reusable tableware and composting service included.' },
    ],
    recommendedEvents: ['wedding', 'corporate', 'friends'],
    bookingNotice: {
      es: 'Reserva con 3 semanas de anticipación para menú personalizado.',
      en: 'Book 3 weeks ahead for a custom menu.',
    },
    featured: true,
    contactHandle: '@andinacatering',
  },
  {
    id: 'neo-decor',
    name: { es: 'Neo Decor Modular', en: 'Neo Modular Decor' },
    provider: 'Estudio Neón',
    category: 'decoration',
    description: {
      es: 'Escenografías reconfigurables con luces LED, telas aéreas y fibras naturales.',
      en: 'Reconfigurable sets mixing LED lighting, aerial fabrics, and natural fibers.',
    },
    priceRange: [150000, 420000],
    coverageArea: 'RM, V Región interior',
    tags: ['premium', 'eco'],
    highlights: [
      { es: 'Moodboards colaborativos en Figma para aprobar montaje.', en: 'Collaborative moodboards in Figma for approvals.' },
      { es: 'Incluye kit de emergencia para retoques.', en: 'Includes on-site touch-up emergency kit.' },
      { es: 'Materiales reutilizables y textiles reciclados.', en: 'Reusable structures and recycled textiles.' },
    ],
    recommendedEvents: ['wedding', 'corporate'],
    bookingNotice: {
      es: 'Necesitan visita técnica del lugar 10 días antes.',
      en: 'Site visit required 10 days before the event.',
    },
    featured: true,
    contactHandle: '@neo.decor',
  },
  {
    id: 'via-lattea-photo',
    name: { es: 'Via Lattea Foto & Video', en: 'Via Lattea Photo & Video' },
    provider: 'Constanza Lagos',
    category: 'photography',
    description: {
      es: 'Cobertura híbrida (análogo + digital) con storytelling documental.',
      en: 'Hybrid analog + digital coverage with documentary storytelling.',
    },
    priceRange: [220000, 480000],
    coverageArea: 'Todo Chile (gastos aparte)',
    tags: ['premium'],
    highlights: [
      { es: 'Entrega express de highlights en 48h.', en: '48h highlight delivery included.' },
      { es: 'Libro impreso artesanal con papel cotton.', en: 'Handmade cotton-paper album.' },
      { es: 'Cobertura dron + backstage lifestyle.', en: 'Drone coverage plus lifestyle BTS clips.' },
    ],
    recommendedEvents: ['wedding', 'corporate', 'birthday'],
    bookingNotice: {
      es: 'Agenda se llena 2 meses antes en temporada alta.',
      en: 'Peak season closes 2 months in advance.',
    },
    contactHandle: '@vialattea.studio',
  },
  {
    id: 'mood-dj',
    name: { es: 'Mood DJ Collective', en: 'Mood DJ Collective' },
    provider: 'Tomás & equipo',
    category: 'music',
    description: {
      es: 'Selección musical a medida con mezcla de vinilos y controladores digitales.',
      en: 'Tailored music selection mixing vinyl and digital controllers.',
    },
    priceRange: [130000, 260000],
    coverageArea: 'RM, V Región costa',
    tags: ['local', 'premium'],
    highlights: [
      { es: 'Curaduría previa según energía del evento.', en: 'Pre-event curation matching energy goals.' },
      { es: 'Equipos propios hasta 250 pax.', en: 'In-house gear up to 250 guests.' },
      { es: 'Playlist post evento compartida.', en: 'Post-event playlist recap.' },
    ],
    recommendedEvents: ['friends', 'corporate', 'wedding'],
    bookingNotice: {
      es: 'Requiere adelanto del 30% y rider técnico simple.',
      en: '30% deposit plus simple tech rider required.',
    },
    contactHandle: '@mood.dj.co',
  },
  {
    id: 'ludico-kids',
    name: { es: 'Lúdico Animaciones Kids', en: 'Ludico Kids Entertainment' },
    provider: 'Carolina Pérez',
    category: 'other',
    description: {
      es: 'Animadores certificados con talleres STEM, juegos gigantes y rincón sensorial.',
      en: 'Certified hosts running STEM workshops, giant games, and sensory corners.',
    },
    priceRange: [90000, 180000],
    coverageArea: 'RM (zonas urbanas)',
    tags: ['local', 'express'],
    highlights: [
      { es: 'Incluye kit de lluvia para actividades indoor.', en: 'Includes rain kit for indoor switch.' },
      { es: 'Comunicación previa con padres para alergias.', en: 'Parent coordination to collect allergy info.' },
      { es: 'Entrega reporte post evento con recomendaciones.', en: 'Post-event report with tips.' },
    ],
    recommendedEvents: ['birthday', 'friends'],
    bookingNotice: {
      es: 'Confirma 7 días antes con lista final de niños.',
      en: 'Confirm kid list 7 days prior.',
    },
    contactHandle: '@ludico.kids',
  },
  {
    id: 'micro-venues',
    name: { es: 'Micro Venues Atelier', en: 'Micro Venues Atelier' },
    provider: 'Francisca Campos',
    category: 'venue',
    description: {
      es: 'Red de casas patrimoniales y lofts listos para micro eventos (hasta 60 pax).',
      en: 'Network of heritage houses and lofts ready for micro events (up to 60 guests).',
    },
    priceRange: [200000, 520000],
    coverageArea: 'Santiago Centro, Ñuñoa, Valparaíso cerros',
    tags: ['premium', 'local'],
    highlights: [
      { es: 'Incluye inventario de mobiliario y plantas.', en: 'Includes curated furniture & greenery inventory.' },
      { es: 'Checklist técnico y seguros básicos.', en: 'Technical checklist plus base insurance.' },
      { es: 'Coordinación con vecinos para logística.', en: 'Neighbor coordination for logistics.' },
    ],
    recommendedEvents: ['wedding', 'corporate', 'friends'],
    bookingNotice: {
      es: 'Bloqueos mínimo 5h, descuentos para semana.',
      en: '5h minimum slot, weekday discounts.',
    },
    featured: true,
    contactHandle: '@microvenues.cl',
  },
  {
    id: 'bar-territorio',
    name: { es: 'Bar Territorio Nómada', en: 'Territorio Nomad Bar' },
    provider: 'Rodrigo & crew',
    category: 'other',
    description: {
      es: 'Barra itinerante con cócteles de autor y mocktails botánicos sin alcohol.',
      en: 'Roaming bar with signature cocktails and botanical mocktails.',
    },
    priceRange: [160000, 300000],
    coverageArea: 'RM, V Región costa',
    tags: ['local', 'eco'],
    highlights: [
      { es: 'Menú co-creado según temática.', en: 'Menu co-created around the event theme.' },
      { es: 'Vajilla compostable premium.', en: 'Premium compostable glassware.' },
      { es: 'Capacitación breve al staff anfitrión.', en: 'Quick host-staff training session.' },
    ],
    recommendedEvents: ['friends', 'corporate', 'wedding'],
    bookingNotice: {
      es: 'Se confirma 15 días antes con carta final.',
      en: 'Menu freeze 15 days prior.',
    },
    contactHandle: '@territorio.bar',
  },
  {
    id: 'studio-hibrido',
    name: { es: 'Studio Híbrido Live', en: 'Hybrid Live Studio' },
    provider: 'Híbrido Producciones',
    category: 'music',
    description: {
      es: 'Micro escenarios para streaming, charlas o lanzamientos con producción audiovisual.',
      en: 'Micro stages for streaming, talks, or launches with AV production.',
    },
    priceRange: [250000, 600000],
    coverageArea: 'RM (set fijo) + streaming worldwide',
    tags: ['premium'],
    highlights: [
      { es: 'Conectividad redundante y monitoreo QA.', en: 'Redundant connectivity plus QA monitoring.' },
      { es: 'Equipo de dirección y guion básico.', en: 'Direction crew plus light scripting.' },
      { es: 'Pack métricas y clip resumen.', en: 'Performance metrics and recap clip.' },
    ],
    recommendedEvents: ['corporate', 'other'],
    bookingNotice: {
      es: 'Bloque mínimo 4h, seña 40%.',
      en: '4h minimum block, 40% booking fee.',
    },
    contactHandle: '@studiohibrido',
  },
  {
    id: 'verde-flor',
    name: { es: 'Verde Flor Botánica', en: 'Verde Flor Botanics' },
    provider: 'Camila Rivas',
    category: 'decoration',
    description: {
      es: 'Diseño floral regenerativo con especies locales y arrendos de maceteros.',
      en: 'Regenerative floral design using local species and planter rentals.',
    },
    priceRange: [110000, 280000],
    coverageArea: 'RM, VI Región',
    tags: ['eco', 'local'],
    highlights: [
      { es: 'Reusa flores en donación post evento.', en: 'Post-event flower donation program.' },
      { es: 'Moodboards cromáticos y muestras físicas.', en: 'Color moodboards plus physical samples.' },
      { es: 'Incluye cuidados y riego durante montaje.', en: 'Includes watering & care during setup.' },
    ],
    recommendedEvents: ['wedding', 'friends'],
    bookingNotice: {
      es: 'Solicita 2 reuniones de co-diseño.',
      en: 'Requires two co-design sessions.',
    },
    contactHandle: '@verdeflor.botanica',
  },
  {
    id: 'suite-ods',
    name: { es: 'Suite ODS Experiencias', en: 'ODS Experience Suite' },
    provider: 'Impact Lab',
    category: 'other',
    description: {
      es: 'Facilitadores crean dinámicas breves para vincular eventos con ODS 8 y 12.',
      en: 'Facilitators run short dynamics linking events to SDGs 8 & 12.',
    },
    priceRange: [70000, 160000],
    coverageArea: 'Todo Chile (virtual / presencial)',
    tags: ['eco', 'express'],
    highlights: [
      { es: 'Toolkit descargable para follow-up.', en: 'Downloadable toolkit for follow-up.' },
      { es: 'Dinámicas gamificadas de 25 min.', en: '25-min gamified dynamics.' },
      { es: 'Reporte de impacto simplificado.', en: 'Simplified impact snapshot.' },
    ],
    recommendedEvents: ['corporate', 'friends', 'other'],
    bookingNotice: {
      es: 'Disponible con 5 días de aviso.',
      en: 'Available with 5-day notice.',
    },
    contactHandle: '@impactlab.cl',
  },
];

export default function ServicesPage() {
  const { locale } = useLanguage();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | ''>('');
  const [selectedTag, setSelectedTag] = useState<ServiceTag | ''>('');
  const [selectedArea, setSelectedArea] = useState('');
  const [budgetTier, setBudgetTier] = useState<'all' | 'lean' | 'standard' | 'premium'>('all');

  const filteredServices = useMemo(() => {
    return serviceCatalog.filter((service) => {
      const localizedName = service.name[locale as 'es' | 'en'] ?? service.name.es;
      const localizedDescription = service.description[locale as 'es' | 'en'] ?? service.description.es;

      if (searchTerm) {
        const normalized = searchTerm.toLowerCase();
        if (
          !localizedName.toLowerCase().includes(normalized) &&
          !localizedDescription.toLowerCase().includes(normalized) &&
          !service.provider.toLowerCase().includes(normalized)
        ) {
          return false;
        }
      }

      if (selectedCategory && service.category !== selectedCategory) {
        return false;
      }

      if (selectedTag && !service.tags.includes(selectedTag)) {
        return false;
      }

      if (selectedArea && !service.coverageArea.toLowerCase().includes(selectedArea.toLowerCase())) {
        return false;
      }

      if (budgetTier !== 'all') {
        const avg = (service.priceRange[0] + service.priceRange[1]) / 2;
        if (budgetTier === 'lean' && avg > 180000) return false;
        if (budgetTier === 'standard' && (avg < 180000 || avg > 350000)) return false;
        if (budgetTier === 'premium' && avg < 350000) return false;
      }

      return true;
    });
  }, [searchTerm, selectedCategory, selectedTag, selectedArea, budgetTier, locale]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);

  const handleAttachService = (service: ServiceTemplate) => {
    const avgBudget = Math.round((service.priceRange[0] + service.priceRange[1]) / 2);
    const preferencesSnippet = `${service.name[locale as 'es' | 'en']} - ${service.description[locale as 'es' | 'en']} (${service.coverageArea})`;
    const eventType = service.recommendedEvents[0] ?? 'other';
    const spendingStyle = service.tags.includes('premium')
      ? 'premium'
      : service.tags.includes('eco')
        ? 'balanced'
        : 'value';

    const params = new URLSearchParams({
      eventType,
      spendingStyle,
      budget: String(avgBudget),
      preferences: preferencesSnippet,
      name: service.name[locale as 'es' | 'en'],
    });

    router.push(`/events/create?${params.toString()}`);
  };

  const renderCategoryIcon = (category: ServiceCategory) => {
    switch (category) {
      case 'catering':
        return <ChefHat className="h-4 w-4 text-primary-500" />;
      case 'music':
        return <Music4 className="h-4 w-4 text-primary-500" />;
      case 'photography':
        return <Camera className="h-4 w-4 text-primary-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-primary-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="text-center space-y-4">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">{t('services.title', locale)}</p>
          <h1 className="text-4xl font-black text-gray-900">{t('services.catalogTitle', locale)}</h1>
          <p className="text-base text-gray-600 max-w-3xl mx-auto">{t('services.catalogSubtitle', locale)}</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span>{t('services.heroStats.curated', locale)} +</span>
            <span>•</span>
            <span>{t('services.heroStats.localVendors', locale)}</span>
            <span>•</span>
            <span>{t('services.heroStats.sdgAlignment', locale)}</span>
          </div>
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
                onChange={(e) => setSelectedCategory(e.target.value as ServiceCategory | '')}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{t('services.filters.categoryLabel', locale)}</option>
                <option value="catering">{t('services.categories.catering', locale)}</option>
                <option value="decoration">{t('services.categories.decoration', locale)}</option>
                <option value="music">{t('services.categories.music', locale)}</option>
                <option value="photography">{t('services.categories.photography', locale)}</option>
                <option value="venue">{t('services.categories.venue', locale)}</option>
                <option value="other">{t('services.categories.other', locale)}</option>
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">{t('services.filters.areaLabel', locale)}</option>
              <option value="RM">RM</option>
              <option value="Valparaíso">Valparaíso</option>
              <option value="Todo Chile">Todo Chile</option>
            </select>
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value as 'all' | 'lean' | 'standard' | 'premium')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">{t('services.filters.budgetAll', locale)}</option>
              <option value="lean">{t('services.filters.budgetLean', locale)}</option>
              <option value="standard">{t('services.filters.budgetStandard', locale)}</option>
              <option value="premium">{t('services.filters.budgetPremium', locale)}</option>
            </select>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value as ServiceTag | '')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">{t('services.filters.tagLabel', locale)}</option>
              <option value="local">{t('services.tags.local', locale)}</option>
              <option value="eco">{t('services.tags.eco', locale)}</option>
              <option value="premium">{t('services.tags.premium', locale)}</option>
              <option value="express">{t('services.tags.express', locale)}</option>
            </select>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-semibold text-gray-900">{t('services.featuredTitle', locale)}</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {filteredServices
              .filter((service) => service.featured)
              .slice(0, 3)
              .map((service) => (
                <article key={service.id} className="bg-white border border-amber-100 rounded-2xl p-5 shadow-[0_10px_35px_-25px_rgba(251,191,36,0.9)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">{service.name[locale as 'es' | 'en']}</h3>
                    <BadgeCheck className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{service.description[locale as 'es' | 'en']}</p>
                  <p className="mt-4 text-primary-700 font-semibold">
                    {formatCurrency(service.priceRange[0])} – {formatCurrency(service.priceRange[1])}
                  </p>
                  <button
                    onClick={() => handleAttachService(service)}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-700"
                  >
                    {t('services.actions.addToPlan', locale)}
                    <Sparkles className="h-4 w-4" />
                  </button>
                </article>
              ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Leaf className="h-5 w-5 text-emerald-500" />
            <h2 className="text-xl font-semibold text-gray-900">{t('services.catalogListTitle', locale)}</h2>
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-500">{t('services.emptyState', locale)}</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredServices.map((service) => (
                <article key={service.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{service.provider}</p>
                      <h3 className="text-2xl font-bold text-gray-900">{service.name[locale as 'es' | 'en']}</h3>
                      <p className="mt-1 text-sm text-gray-600">{service.description[locale as 'es' | 'en']}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
                      {renderCategoryIcon(service.category)}
                      {t(`services.categories.${service.category}`, locale)}
                    </span>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <dt className="font-semibold text-gray-900">{t('services.priceRange', locale)}</dt>
                      <dd>{formatCurrency(service.priceRange[0])} – {formatCurrency(service.priceRange[1])}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary-500" />
                      <div>
                        <dt className="font-semibold text-gray-900">{t('services.coverage', locale)}</dt>
                        <dd>{service.coverageArea}</dd>
                      </div>
                    </div>
                  </dl>

                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-400">{t('services.highlights', locale)}</p>
                    <ul className="mt-2 space-y-2 text-sm text-gray-600">
                      {service.highlights.map((highlight, index) => (
                        <li key={`${service.id}-highlight-${index}`} className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-primary-400" />
                          <span>{highlight[locale as 'es' | 'en']}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                        {t(`services.tags.${tag}`, locale)}
                      </span>
                    ))}
                  </div>

                  <p className="mt-4 text-xs text-gray-500">{service.bookingNotice[locale as 'es' | 'en']}</p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleAttachService(service)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold shadow hover:bg-primary-700"
                    >
                      <Sparkles className="h-4 w-4" />
                      {t('services.actions.addToPlan', locale)}
                    </button>
                    <div className="text-sm text-gray-500">
                      {t('services.contactHandle', locale)} {service.contactHandle}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

