'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sparkles, Users, PiggyBank, MapPin } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';

interface LocalizedCopy {
  es: string;
  en: string;
}

interface EventTemplate {
  id: string;
  name: LocalizedCopy;
  description: LocalizedCopy;
  eventType: string;
  ageRange: string;
  genderDistribution: string;
  idealGuests: number;
  spendingStyle: 'value' | 'balanced' | 'premium';
  budgetRange: [number, number];
  budgetSuggestion: number;
  location: string;
  eventDateSuggestion?: string;
  preferences?: LocalizedCopy;
  highlights: LocalizedCopy[];
  weatherNote: LocalizedCopy;
}

const templateCatalog: EventTemplate[] = [
  {
    id: 'cozy-birthday',
    name: {
      es: 'Cumpleaños íntimo en casa',
      en: 'Cozy Home Birthday',
    },
    description: {
      es: 'Picoteo chileno, música unplugged y decoración cálida para 10-15 personas.',
      en: 'Chilean tapas, unplugged music, and warm decor for 10-15 guests.',
    },
    eventType: 'birthday',
    ageRange: 'adults',
    genderDistribution: 'mixed',
    idealGuests: 12,
    spendingStyle: 'balanced',
    budgetRange: [80000, 150000],
    budgetSuggestion: 120000,
    location: 'Santiago, Chile',
    eventDateSuggestion: new Date().toISOString().split('T')[0],
    preferences: {
      es: 'Música acústica en vivo y énfasis en vinos chilenos.',
      en: 'Acoustic live music with focus on Chilean wines.',
    },
    highlights: [
      {
        es: 'Tabla gourmet con productos locales y estación de hummus casero.',
        en: 'Gourmet grazing table with local produce plus homemade hummus station.',
      },
      {
        es: 'Guirnaldas LED y velas cálidas reutilizables.',
        en: 'Reusable LED garlands and candle clusters.',
      },
      {
        es: 'Recordatorios personalizados hechos a mano.',
        en: 'Hand-crafted keepsakes for guests.',
      },
    ],
    weatherNote: {
      es: 'Perfecto para tardes templadas de primavera en terraza o living.',
      en: 'Great for mild spring evenings on a terrace or living room.',
    },
  },
  {
    id: 'corporate-networking',
    name: {
      es: 'After office corporativo',
      en: 'Corporate After Office',
    },
    description: {
      es: 'Formato networking con finger food elegante y bar de mocktails.',
      en: 'Networking-friendly format with refined finger food and mocktail bar.',
    },
    eventType: 'corporate',
    ageRange: 'adults',
    genderDistribution: 'balanced',
    idealGuests: 30,
    spendingStyle: 'premium',
    budgetRange: [350000, 600000],
    budgetSuggestion: 450000,
    location: 'Santiago, Chile',
    preferences: {
      es: 'Stand corporativo, música lounge y regalos de marca.',
      en: 'Corporate branding stand, lounge music, and branded gifts.',
    },
    highlights: [
      {
        es: 'Bocados fríos y calientes que rotan cada 30 minutos.',
        en: 'Rotating cold and hot bites every 30 minutes.',
      },
      {
        es: 'Bar de mocktails con frutas de estación y garnish premium.',
        en: 'Mocktail bar with seasonal fruits and premium garnish.',
      },
      {
        es: 'Zona de pitching rápido con pantalla y micro inalámbrico.',
        en: 'Quick-pitch corner with display and wireless mic.',
      },
    ],
    weatherNote: {
      es: 'Ideal para indoor (cowork/terraza techada) durante otoño.',
      en: 'Best set indoors (cowork / covered terrace) during fall.',
    },
  },
  {
    id: 'micro-wedding',
    name: {
      es: 'Micro wedding boutique',
      en: 'Boutique Micro Wedding',
    },
    description: {
      es: 'Ceremonia corta, banquete reducido y detalles florales selectos.',
      en: 'Short ceremony, reduced banquet, and curated floral details.',
    },
    eventType: 'wedding',
    ageRange: 'adults',
    genderDistribution: 'mixed',
    idealGuests: 40,
    spendingStyle: 'premium',
    budgetRange: [1500000, 2500000],
    budgetSuggestion: 2000000,
    location: 'Valparaíso, Chile',
    preferences: {
      es: 'Estilo coastal chic, colores neutros y flores locales.',
      en: 'Coastal chic palette with local flowers.',
    },
    highlights: [
      {
        es: 'Ceremonia al atardecer + cocktail sunset.',
        en: 'Sunset ceremony plus cocktail reception.',
      },
      {
        es: 'Banquete degustación de 4 tiempos con maridaje.',
        en: 'Four-course tasting menu with pairing.',
      },
      {
        es: 'Mesa de postres artesanales y late-night snack.',
        en: 'Artisanal dessert table and late-night snack.',
      },
    ],
    weatherNote: {
      es: 'Considerar abrigo y calefactores portátiles para la brisa costera.',
      en: 'Plan for wraps and portable heaters for coastal breeze.',
    },
  },
  {
    id: 'creative-brunch',
    name: {
      es: 'Brunch creativo con amigos',
      en: 'Creative Friends Brunch',
    },
    description: {
      es: 'Taller corto + brunch colaborativo con presupuesto controlado.',
      en: 'Short workshop plus collaborative brunch with lean budget.',
    },
    eventType: 'friends',
    ageRange: 'mixed',
    genderDistribution: 'mixed',
    idealGuests: 16,
    spendingStyle: 'value',
    budgetRange: [60000, 110000],
    budgetSuggestion: 80000,
    location: 'Providencia, Chile',
    preferences: {
      es: 'DIY flores secas y playlist indie.',
      en: 'DIY dried flowers and indie playlist.',
    },
    highlights: [
      {
        es: 'Estaciones colaborativas (waffles, toppings, cold brew).',
        en: 'Collaborative stations (waffles, toppings, cold brew).',
      },
      {
        es: 'Mini taller creativo de 40 minutos para romper el hielo.',
        en: '40-minute creative workshop to break the ice.',
      },
      {
        es: 'Pack fotográfico con props para redes.',
        en: 'Photo booth starter pack with social props.',
      },
    ],
    weatherNote: {
      es: 'Funciona indoor/outdoor; prever plan B si llueve.',
      en: 'Works indoor/outdoor—set a rain-friendly backup.',
    },
  },
  {
    id: 'community-picnic',
    name: {
      es: 'Picnic comunitario en parque',
      en: 'Community Park Picnic',
    },
    description: {
      es: 'Mesas largas, mantas y estación de jugos naturales para familias.',
      en: 'Long tables, picnic blankets, and fresh juice bar for families.',
    },
    eventType: 'other',
    ageRange: 'mixed',
    genderDistribution: 'balanced',
    idealGuests: 60,
    spendingStyle: 'value',
    budgetRange: [90000, 180000],
    budgetSuggestion: 140000,
    location: 'Parque Quinta Normal, Santiago',
    preferences: {
      es: 'Priorizar proveedores de barrio y opciones veg-friendly.',
      en: 'Prioritize neighborhood vendors and veg-friendly bites.',
    },
    highlights: [
      {
        es: 'Manteles reutilizables y set de juegos gigantes.',
        en: 'Reusable tablecloths plus oversized garden games.',
      },
      {
        es: 'Zona kids con cuenta cuentos y burbujas.',
        en: 'Kids corner with storyteller and bubble show.',
      },
      {
        es: 'Colecta solidaria de alimentos no perecibles.',
        en: 'Food drive drop-off station for donations.',
      },
    ],
    weatherNote: {
      es: 'Verificar sombra y carpas livianas para verano.',
      en: 'Plan shade sails or light tents for summer heat.',
    },
  },
  {
    id: 'teen-esport-night',
    name: {
      es: 'Noche e-sports para teens',
      en: 'Teen E-sports Night',
    },
    description: {
      es: 'LAN party supervisada con snacks energéticos y mini torneos.',
      en: 'Supervised LAN party with energy snacks and micro tournaments.',
    },
    eventType: 'friends',
    ageRange: 'teens',
    genderDistribution: 'mixed',
    idealGuests: 20,
    spendingStyle: 'balanced',
    budgetRange: [120000, 220000],
    budgetSuggestion: 180000,
    location: 'Ñuñoa, Santiago',
    eventDateSuggestion: new Date(Date.now() + 12096e5).toISOString().split('T')[0],
    preferences: {
      es: 'Consolas variadas, premios digitales y estación de descanso.',
      en: 'Mixed consoles, digital prizes, and chill-out lounge.',
    },
    highlights: [
      {
        es: 'Router dedicado + repetidores para evitar lag.',
        en: 'Dedicated router plus repeaters to avoid lag.',
      },
      {
        es: 'Snacks altos en proteína y barra de smoothies.',
        en: 'Protein-forward snacks and smoothie bar.',
      },
      {
        es: 'Horario escalonado para padres y traslado seguro.',
        en: 'Staggered parent check-ins and safe transport.',
      },
    ],
    weatherNote: {
      es: 'Evento indoor; mantener ventilación constante.',
      en: 'Indoor event—keep airflow steady to manage equipment heat.',
    },
  },
  {
    id: 'charity-brunch',
    name: {
      es: 'Brunch solidario con subasta',
      en: 'Charity Brunch & Auction',
    },
    description: {
      es: 'Mesa buffet, set acústico y subasta silenciosa para recaudar fondos.',
      en: 'Buffet spread, acoustic set, and silent auction to raise funds.',
    },
    eventType: 'corporate',
    ageRange: 'adults',
    genderDistribution: 'balanced',
    idealGuests: 80,
    spendingStyle: 'balanced',
    budgetRange: [400000, 700000],
    budgetSuggestion: 550000,
    location: 'Hotel boutique, Lastarria',
    preferences: {
      es: 'Branding discreto y foco en impacto social.',
      en: 'Subtle branding with emphasis on social impact.',
    },
    highlights: [
      {
        es: 'Buffet brunch mediterráneo con estación vegana.',
        en: 'Mediterranean brunch buffet plus vegan corner.',
      },
      {
        es: 'Subasta silenciosa en tablets con QR.',
        en: 'Silent auction hosted on tablets with QR access.',
      },
      {
        es: 'Panel corto de testimonios inspiradores.',
        en: 'Short testimonial panel between sets.',
      },
    ],
    weatherNote: {
      es: 'Ideal en salones con terraza primavera-otoño.',
      en: 'Best in salons with terrace between spring and fall.',
    },
  },
  {
    id: 'artisan-market',
    name: {
      es: 'Feria de emprendedores locales',
      en: 'Local Artisan Market',
    },
    description: {
      es: 'Stands modulares, shows callejeros y activaciones de marca ciudad.',
      en: 'Modular booths, street performances, and city-brand activations.',
    },
    eventType: 'other',
    ageRange: 'mixed',
    genderDistribution: 'mixed',
    idealGuests: 300,
    spendingStyle: 'value',
    budgetRange: [250000, 450000],
    budgetSuggestion: 320000,
    location: 'Boulevard barrio Italia',
    preferences: {
      es: 'Priorizar materiales reutilizables y gestores culturales.',
      en: 'Use reusable staging and hire cultural curators.',
    },
    highlights: [
      {
        es: 'Layout en circuitos para flujo constante.',
        en: 'Circuit-style layout keeping flow constant.',
      },
      {
        es: 'Escenario micro para showcase de artistas.',
        en: 'Micro stage for rotating artist showcases.',
      },
      {
        es: 'Zona de talleres express de 20 minutos.',
        en: 'Express workshops lasting 20 minutes.',
      },
    ],
    weatherNote: {
      es: 'Considerar carpas tipo vela y señalética resistente al viento.',
      en: 'Add sail tents and wind-safe signage.',
    },
  },
  {
    id: 'wellness-retreat',
    name: {
      es: 'Retiro wellness 1 día',
      en: 'One-day Wellness Retreat',
    },
    description: {
      es: 'Yoga, breathwork, alimentación plant-based y cierre con fogata.',
      en: 'Yoga, breathwork, plant-based meals, closing bonfire.',
    },
    eventType: 'friends',
    ageRange: 'adults',
    genderDistribution: 'mostlyFemale',
    idealGuests: 24,
    spendingStyle: 'premium',
    budgetRange: [480000, 820000],
    budgetSuggestion: 650000,
    location: 'Parcela en Cajón del Maipo',
    preferences: {
      es: 'Facilitadores certificados y kit de bienvenida sustentable.',
      en: 'Certified facilitators and eco welcome kit.',
    },
    highlights: [
      {
        es: 'Sesión sunrise + journaling guiado.',
        en: 'Sunrise session plus guided journaling.',
      },
      {
        es: 'Almuerzo plant-based servido en mesa larga.',
        en: 'Plant-based lunch on long communal table.',
      },
      {
        es: 'Fogata vespertina con cacao ceremonial.',
        en: 'Evening bonfire with ceremonial cacao.',
      },
    ],
    weatherNote: {
      es: 'Chequear pronóstico; sumar carpa chill-out si hay heladas.',
      en: 'Watch forecasts; add chill-out tent if nights get cold.',
    },
  },
  {
    id: 'product-launch-pop',
    name: {
      es: 'Lanzamiento pop-up de producto',
      en: 'Pop-up Product Launch',
    },
    description: {
      es: 'Showroom efímero, demo en vivo y cobertura de creadores de contenido.',
      en: 'Ephemeral showroom, live demos, and creator coverage.',
    },
    eventType: 'corporate',
    ageRange: 'adults',
    genderDistribution: 'mixed',
    idealGuests: 120,
    spendingStyle: 'premium',
    budgetRange: [900000, 1400000],
    budgetSuggestion: 1100000,
    location: 'Galería de arte, Vitacura',
    preferences: {
      es: 'Storytelling inmersivo y partnership con micro influencers.',
      en: 'Immersive storytelling plus micro-influencer partnerships.',
    },
    highlights: [
      {
        es: 'Escenografía modular con mapping ligero.',
        en: 'Modular scenography with light projection mapping.',
      },
      {
        es: 'Demo cada 45 min narrada por product manager.',
        en: 'Manager-led demo loops every 45 minutes.',
      },
      {
        es: 'Zona de contenido con iluminación continua.',
        en: 'Content capture corner with constant lighting.',
      },
    ],
    weatherNote: {
      es: 'Perfecto indoor; revisar ventilación para equipos.',
      en: 'Indoor-friendly—double-check ventilation for gear.',
    },
  },
];

export default function EventTemplatesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { locale } = useLanguage();

  const formatCurrency = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });

  const handleUseTemplate = (template: EventTemplate) => {
    const params = new URLSearchParams({
      name: template.name[locale],
      eventType: template.eventType,
      numberOfGuests: String(template.idealGuests),
      ageRange: template.ageRange,
      genderDistribution: template.genderDistribution,
      location: template.location,
      budget: String(template.budgetSuggestion),
      spendingStyle: template.spendingStyle,
    });

    if (template.preferences?.[locale]) {
      params.set('preferences', template.preferences[locale]);
    }

    if (template.eventDateSuggestion) {
      params.set('eventDate', template.eventDateSuggestion);
    }

    router.push(`/events/create?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
            {t('events.templates.publicLabel', locale)}
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black text-gray-900">
            {t('events.title', locale)}
          </h1>
          <p className="mt-3 text-base text-gray-600 max-w-3xl mx-auto">
            {t('events.templates.subtitle', locale)}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {templateCatalog.map((template) => (
            <div key={template.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-100 p-6 flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{template.name[locale]}</h2>
                  <p className="text-gray-600 mt-1">{template.description[locale]}</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700">
                  {t('events.spendingStyle.short', locale)}: {t(`events.spendingStyle.${template.spendingStyle}`, locale)}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="h-4 w-4 text-primary-500" />
                  <div>
                    <p className="font-semibold">{t('events.templates.idealGuests', locale)}</p>
                    <p className="text-gray-500">{template.idealGuests}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <PiggyBank className="h-4 w-4 text-primary-500" />
                  <div>
                    <p className="font-semibold">{t('events.templates.budgetRange', locale)}</p>
                    <p className="text-gray-500">
                      {formatCurrency.format(template.budgetRange[0])} - {formatCurrency.format(template.budgetRange[1])}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Sparkles className="h-4 w-4 text-primary-500" />
                  <div>
                    <p className="font-semibold">{t('events.spendingStyle.label', locale)}</p>
                    <p className="text-gray-500">{t(`events.spendingStyle.${template.spendingStyle}`, locale)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="h-4 w-4 text-primary-500" />
                  <div>
                    <p className="font-semibold">{t('events.location', locale)}</p>
                    <p className="text-gray-500">{template.location}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-900">
                  {t('events.templates.highlights', locale)}
                </p>
                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                  {template.highlights.map((highlight, index) => (
                    <li key={`${template.id}-highlight-${index}`} className="flex items-start gap-2">
                      <span className="mt-1 block h-2 w-2 rounded-full bg-primary-400" />
                      <span>{highlight[locale]}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 text-xs text-gray-500">
                {template.weatherNote[locale]}
              </div>

              <div className="mt-6 flex items-center justify-between">
                {session ? (
                  <p className="text-sm text-gray-500">
                    {t('events.templates.loggedHint', locale)}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    {t('events.templates.guestHint', locale)}
                  </p>
                )}
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold shadow hover:bg-primary-700 transition"
                >
                  <Sparkles className="h-4 w-4" />
                  {t('events.templates.useTemplate', locale)}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
