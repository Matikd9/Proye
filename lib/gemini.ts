import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY not found. AI features will be limited.');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const rawModelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const MODEL_NAME = rawModelName.replace(/^models\//, '');

export interface EventPlanningParams {
  eventType: string;
  numberOfGuests: number;
  ageRange: string;
  genderDistribution: string;
  location: string;
  name?: string;
  eventDate?: string;
  budget?: number;
  preferences?: string;
  currency?: string;
  spendingStyle?: 'value' | 'balanced' | 'premium';
}

export interface EventPlan {
  suggestions: string[];
  estimatedCost: number;
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
}

function describeSeason(date: Date, language: string) {
  const month = date.getMonth();
  let season: 'summer' | 'autumn' | 'winter' | 'spring' = 'summer';
  if (month >= 2 && month <= 4) {
    season = 'autumn';
  } else if (month >= 5 && month <= 7) {
    season = 'winter';
  } else if (month >= 8 && month <= 10) {
    season = 'spring';
  } else {
    season = 'summer';
  }

  const labels = {
    es: {
      summer: 'Verano austral (temperaturas altas, radiación UV elevada, posibilidad de brisa costera).',
      autumn: 'Otoño austral (tardes templadas, noches frías, inicio de lluvias suaves).',
      winter: 'Invierno austral (temperaturas bajas, alta probabilidad de lluvia y viento).',
      spring: 'Primavera austral (clima templado, posibles cambios bruscos y presencia de polen).',
    },
    en: {
      summer: 'Southern summer (hot days, high UV index, potential coastal breeze).',
      autumn: 'Southern autumn (mild afternoons, cooler nights, light rain starting).',
      winter: 'Southern winter (cool to cold temperatures, higher chance of rain and wind).',
      spring: 'Southern spring (mild weather, sudden changes possible, pollen in the air).',
    },
  } as const;

  return labels[language === 'es' ? 'es' : 'en'][season];
}

type RawPlan = {
  suggestions?: unknown;
  estimatedCost?: unknown;
  breakdown?: unknown;
  recommendations?: unknown;
};

type RawPlanCategory = {
  category?: unknown;
  items?: unknown;
  estimatedCost?: unknown;
};

type RawPlanItem = {
  name?: unknown;
  price?: unknown;
  source?: unknown;
  notes?: unknown;
};

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizePlan(rawPlan: unknown): EventPlan {
  const plan = (rawPlan ?? {}) as RawPlan;

  const normalizeRecommendations = (recommendations: unknown): string[] => {
    if (!Array.isArray(recommendations)) {
      return [];
    }

    return recommendations.map((entry, idx) => {
      if (typeof entry === 'string') {
        return stripMarkdown(entry);
      }

      if (entry && typeof entry === 'object') {
        const item = entry as {
          title?: unknown;
          argument?: unknown;
          description?: unknown;
          detail?: unknown;
          details?: unknown;
          text?: unknown;
          content?: unknown;
          reason?: unknown;
          note?: unknown;
          items?: unknown;
        };
        const title = typeof item.title === 'string' && item.title.trim().length > 0
          ? stripMarkdown(item.title)
          : `Recomendación ${idx + 1}`;
        const candidates = [
          item.argument,
          item.description,
          item.detail,
          item.details,
          item.text,
          item.content,
          item.reason,
          item.note,
        ];

        let argument = candidates.find((value) => typeof value === 'string' && value.trim().length > 0);

        if (!argument && Array.isArray(item.items)) {
          argument = item.items
            .map((subEntry) => {
              if (typeof subEntry === 'string') {
                return subEntry.trim();
              }
              if (subEntry && typeof subEntry === 'object') {
                const subItem = subEntry as { title?: unknown; detail?: unknown; description?: unknown };
                const subTitle = typeof subItem.title === 'string' ? subItem.title.trim() : '';
                const subDetail =
                  typeof subItem.detail === 'string'
                    ? subItem.detail.trim()
                    : typeof subItem.description === 'string'
                      ? subItem.description.trim()
                      : '';
                return subDetail ? `${subTitle ? `${subTitle}: ` : ''}${subDetail}` : subTitle;
              }
              return '';
            })
            .filter((text) => text && text.length > 0)
            .join(' | ');
        }

        const normalizedArgument = typeof argument === 'string' ? stripMarkdown(argument) : '';
        return normalizedArgument ? `${title}: ${normalizedArgument}` : title;
      }

      return `Recomendación ${idx + 1}`;
    });
  };

  const parseBreakdown = (breakdown: unknown) => {
    if (!Array.isArray(breakdown)) {
      return [] as EventPlan['breakdown'];
    }

    return breakdown.map((categoryEntry) => {
      const category = (categoryEntry ?? {}) as RawPlanCategory;
      const itemsArray = Array.isArray(category.items) ? category.items : [];
      const estimatedCategoryCost = typeof category.estimatedCost === 'number' ? category.estimatedCost : 0;

      const normalizedItems = itemsArray.map((itemEntry, idx) => {
        if (typeof itemEntry === 'string') {
          const unitCost = Math.round((estimatedCategoryCost / Math.max(itemsArray.length, 1)) / 1000) * 1000;
          return {
            name: itemEntry,
            price: Number.isFinite(unitCost) ? unitCost : 0,
            source: 'Referencia local',
          };
        }

        const item = (itemEntry ?? {}) as RawPlanItem;
        return {
          name: typeof item.name === 'string' && item.name.trim().length > 0 ? item.name : `Item ${idx + 1}`,
          price: typeof item.price === 'number' ? item.price : 0,
          source: typeof item.source === 'string' && item.source.trim().length > 0 ? item.source : 'Referencia local',
          notes: typeof item.notes === 'string' && item.notes.trim().length > 0 ? item.notes : undefined,
        };
      });

      return {
        category: typeof category.category === 'string' && category.category.trim().length > 0
          ? category.category
          : 'General',
        items: normalizedItems,
        estimatedCost: estimatedCategoryCost,
      };
    });
  };

  return {
    suggestions: Array.isArray(plan.suggestions)
      ? plan.suggestions.filter((item): item is string => typeof item === 'string')
      : [],
    estimatedCost: typeof plan.estimatedCost === 'number' ? plan.estimatedCost : 0,
    breakdown: parseBreakdown(plan.breakdown),
    recommendations: normalizeRecommendations(plan.recommendations),
  };
}

export async function generateEventPlan(params: EventPlanningParams, language: string = 'es'): Promise<EventPlan> {
  if (!genAI) {
    // Fallback response if Gemini is not configured
    return normalizePlan({
      suggestions: ['Configure GEMINI_API_KEY to enable AI planning'],
      estimatedCost: 0,
      breakdown: [],
      recommendations: [],
    });
  }

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const currency = params.currency || 'CLP';
  const location = params.location || 'Chile';
  const languageKey = language === 'es' ? 'es' : 'en';
  const eventDateObject = params.eventDate ? new Date(params.eventDate) : null;
  const localeTag = language === 'es' ? 'es-CL' : 'en-US';
  const eventDateText = eventDateObject && !isNaN(eventDateObject.getTime())
    ? eventDateObject.toLocaleDateString(localeTag, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : language === 'es'
      ? 'Por definir'
      : 'To be confirmed';

  const climateHint = eventDateObject && !isNaN(eventDateObject.getTime())
    ? describeSeason(eventDateObject, language)
    : language === 'es'
      ? 'Sin fecha precisa, brinda recomendaciones climáticas generales para eventos en Chile.'
      : 'Date TBD, provide general Chilean weather considerations for events.';

  const budgetText = params.budget
    ? new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(params.budget)
    : language === 'es'
      ? 'Sin límite específico'
      : 'No specific limit';

  const allowedSpendingStyles = ['value', 'balanced', 'premium'] as const;
  type SpendingStyle = (typeof allowedSpendingStyles)[number];
  const spendingStyle = allowedSpendingStyles.includes(params.spendingStyle as SpendingStyle)
    ? (params.spendingStyle as SpendingStyle)
    : 'balanced';

  const spendingMessages = {
    value: {
      es: {
        label: 'Optimiza cantidad con precios bajos, aceptando marcas económicas o genéricas.',
        rule: 'Prioriza combos, formatos familiares y proveedores mayoristas aunque sacrifiques algo de calidad.',
      },
      en: {
        label: 'Maximize quantity with low prices, accepting generic or economy brands.',
        rule: 'Favor bulk packs, wholesale vendors, and combos even if quality is basic.',
      },
    },
    balanced: {
      es: {
        label: 'Equilibra costo y calidad, mezclando ítems accesibles con otros diferenciados.',
        rule: 'Combina productos costo/beneficio con algunos destacados para invitados clave.',
      },
      en: {
        label: 'Balance cost and quality, mixing accessible items with a few standout touches.',
        rule: 'Blend value-friendly items with select upgrades for key moments.',
      },
    },
    premium: {
      es: {
        label: 'Prefiere calidad y experiencia, aceptando menor cantidad si es necesario.',
        rule: 'Selecciona proveedores premium, ingredientes gourmet y cantidades controladas con presentación impecable.',
      },
      en: {
        label: 'Prioritize quality and guest experience even if quantity decreases.',
        rule: 'Select premium vendors, gourmet ingredients, and curated portions with top presentation.',
      },
    },
  } as const;

  const spendingLabel = spendingMessages[spendingStyle][languageKey].label;
  const spendingRule = spendingMessages[spendingStyle][languageKey].rule;

  const prompt = language === 'es'
    ? `Eres un asistente experto en planificación de eventos. Genera un plan detallado considerando datos reales del mercado chileno y la siguiente información:

Tipo de evento: ${params.eventType}
Número de invitados: ${params.numberOfGuests}
Rango de edad: ${params.ageRange}
Distribución de género: ${params.genderDistribution}
Ubicación del evento: ${location}
Fecha del evento: ${eventDateText}
Contexto climático estimado: ${climateHint}
Presupuesto disponible (moneda ${currency}): ${budgetText}
Nombre del evento: ${params.name || 'Evento personalizado'}
Preferencias especiales: ${params.preferences || 'Ninguna específica'}
Estilo de compra: ${spendingLabel}

Debes entregar:
1. Sugerencias de actividades y elementos clave
2. Costo estimado total
3. Desglose por categorías (catering, decoración, entretenimiento, etc.) con items específicos y costos individuales
4. Recomendaciones adicionales con argumentos

Condiciones adicionales:
- Expresa todos los montos en ${currency}, redondeados al múltiplo de 1.000 más cercano.
- Basa los precios en proveedores reales disponibles en ${location} (ej.: "Banquetería buffet en Providencia"). Si no hay un dato exacto, entrega un rango y explica la causa.
- Cada item del desglose debe incluir nombre, precio individual y fuente (ej.: supermercado, marketplace o local comercial conocido). Prioriza tiendas chilenas como Lider, Jumbo, Tottus, Unimarc, Easy, Sodimac o locales específicos del barrio.
- Incluye una breve justificación o nota cuando corresponda (temporada, calidad, porción por persona, etc.).
- Menciona cómo cada bloque afecta el presupuesto disponible y advierte si alguna partida consume gran parte del total.
- ${spendingRule}
- Describe el clima esperado para la fecha en ${location}, menciona temperatura aproximada, probabilidad de lluvia/viento y recomendaciones concretas (toldos, indoor backup, calefacción, hidratación, bloqueador). Recuerda sugerir verificar el pronóstico oficial (Dirección Meteorológica de Chile / MeteoChile) 48 horas antes.

Responde en JSON con esta estructura exacta:
{
  "suggestions": ["sugerencia1", "sugerencia2"],
  "estimatedCost": 1000,
  "breakdown": [
    {
      "category": "Catering",
      "items": [
        {
          "name": "Item",
          "price": 500,
          "source": "Supermercado Lider",
          "notes": "Opcional"
        }
      ],
      "estimatedCost": 500
    }
  ],
  "recommendations": ["recomendación1", "recomendación2"]
}`
    : `You are an expert event planning assistant. Generate a detailed plan based on real market references and the following data:

Event type: ${params.eventType}
Number of guests: ${params.numberOfGuests}
Age range: ${params.ageRange}
Gender distribution: ${params.genderDistribution}
Event location: ${location}
Event date: ${eventDateText}
Estimated climate context: ${climateHint}
Budget (currency ${currency}): ${budgetText}
Event name: ${params.name || 'Custom event'}
Preferences: ${params.preferences || 'None specific'}
Shopping focus: ${spendingLabel}

Provide:
1. Suggestions for key activities and elements
2. Total estimated cost
3. Breakdown by categories (catering, decoration, entertainment, etc.) with concrete items and individual costs
4. Additional recommendations with rationale

Additional rules:
- Express every amount in ${currency}, rounded to the nearest 1,000.
- Base prices on real providers in ${location}. State the provider type per item (e.g., "Local catering in Providencia").
- Every item in the breakdown must include: name, individual price, and a source (supermarket, marketplace listing, or local provider). Favor Chilean sources like Lider, Jumbo, Tottus, Unimarc, Easy, Sodimac, Mercado Libre Chile, or a specific neighborhood business.
- If only a range is available, share it and justify the variance (seasonality, demand, etc.).
- Explain how each block impacts the available budget and highlight big-ticket items.
- ${spendingRule}
- Include a brief weather outlook for ${location} around that date (temperature range, rain/wind risk) and tie it to actionable advice (tents, heaters, hydration, sunscreen, indoor backup). Remind readers to confirm the forecast with MeteoChile or a reliable weather app 48 hours before the event.

Respond strictly as JSON with this structure:
{
  "suggestions": ["suggestion1", "suggestion2"],
  "estimatedCost": 1000,
  "breakdown": [
    {
      "category": "Catering",
      "items": [
        {
          "name": "Item",
          "price": 500,
          "source": "Lider.cl",
          "notes": "Optional"
        }
      ],
      "estimatedCost": 500
    }
  ],
  "recommendations": ["recommendation1", "recommendation2"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return normalizePlan(parsed);
    }
    
    throw new Error('No JSON found in response');
  } catch (error: unknown) {
    console.error('Error generating event plan:', error);
    throw error;
  }
}

