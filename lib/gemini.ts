import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY not found. AI features will be limited.');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export interface EventPlanningParams {
  eventType: string;
  numberOfGuests: number;
  ageRange: string;
  genderDistribution: string;
  budget?: number;
  preferences?: string;
}

export interface EventPlan {
  suggestions: string[];
  estimatedCost: number;
  breakdown: {
    category: string;
    items: string[];
    estimatedCost: number;
  }[];
  recommendations: string[];
}

export async function generateEventPlan(params: EventPlanningParams, language: string = 'es'): Promise<EventPlan> {
  if (!genAI) {
    // Fallback response if Gemini is not configured
    return {
      suggestions: ['Configure GEMINI_API_KEY to enable AI planning'],
      estimatedCost: 0,
      breakdown: [],
      recommendations: [],
    };
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = language === 'es' 
    ? `Eres un asistente experto en planificación de eventos. Genera un plan detallado para un evento con las siguientes características:
    
Tipo de evento: ${params.eventType}
Número de invitados: ${params.numberOfGuests}
Rango de edad: ${params.ageRange}
Distribución de género: ${params.genderDistribution}
Presupuesto: ${params.budget ? `$${params.budget}` : 'Sin límite específico'}
Preferencias: ${params.preferences || 'Ninguna específica'}

Por favor, proporciona:
1. Sugerencias de actividades y elementos clave
2. Costo estimado total
3. Desglose por categorías (catering, decoración, entretenimiento, etc.) con items específicos y costos
4. Recomendaciones adicionales

Responde en formato JSON con esta estructura:
{
  "suggestions": ["sugerencia1", "sugerencia2"],
  "estimatedCost": 1000,
  "breakdown": [
    {
      "category": "Catering",
      "items": ["item1", "item2"],
      "estimatedCost": 500
    }
  ],
  "recommendations": ["recomendación1", "recomendación2"]
}`
    : `You are an expert event planning assistant. Generate a detailed plan for an event with the following characteristics:

Event type: ${params.eventType}
Number of guests: ${params.numberOfGuests}
Age range: ${params.ageRange}
Gender distribution: ${params.genderDistribution}
Budget: ${params.budget ? `$${params.budget}` : 'No specific limit'}
Preferences: ${params.preferences || 'None specific'}

Please provide:
1. Suggestions for key activities and elements
2. Total estimated cost
3. Breakdown by categories (catering, decoration, entertainment, etc.) with specific items and costs
4. Additional recommendations

Respond in JSON format with this structure:
{
  "suggestions": ["suggestion1", "suggestion2"],
  "estimatedCost": 1000,
  "breakdown": [
    {
      "category": "Catering",
      "items": ["item1", "item2"],
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
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('Error generating event plan:', error);
    throw error;
  }
}

