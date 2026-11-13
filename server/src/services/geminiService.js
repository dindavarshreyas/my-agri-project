import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('[!] WARNING: GEMINI_API_KEY is not set in environment.');
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'placeholder' });

const SYSTEM_INSTRUCTION = 
  "You are an expert Agronomist and Agricultural AI Assistant. Your goal is to provide highly scientific, practical, and safe farming advice. " +
  "You must analyze the provided soil parameters, climate zone, and user observations to generate actionable steps. " +
  "You MUST strictly output valid JSON matching the requested schema without any markdown formatting outside the JSON block.";

const ADVISORY_RESPONSE_SCHEMA = {
  type: Type ? Type.OBJECT : 'OBJECT',
  properties: {
    summary: {
      type: Type ? Type.STRING : 'STRING',
      description: '1-2 sentence overview of the diagnosis or recommendation'
    },
    risk_level: {
      type: Type ? Type.STRING : 'STRING',
      enum: ['Low', 'Medium', 'High', 'Critical']
    },
    recommended_actions: {
      type: Type ? Type.ARRAY : 'ARRAY',
      items: {
        type: Type ? Type.OBJECT : 'OBJECT',
        properties: {
          action_title: { type: Type ? Type.STRING : 'STRING' },
          timeline: { 
            type: Type ? Type.STRING : 'STRING', 
            description: 'e.g., Immediate, Within 7 days, Pre-planting' 
          },
          details: { type: Type ? Type.STRING : 'STRING' }
        },
        required: ['action_title', 'timeline', 'details']
      }
    },
    preventative_measures: {
      type: Type ? Type.ARRAY : 'ARRAY',
      items: { type: Type ? Type.STRING : 'STRING' }
    }
  },
  required: ['summary', 'risk_level', 'recommended_actions', 'preventative_measures']
};

/**
 * Calls Gemini 2.5 Flash via @google/genai SDK to generate structured agricultural advice.
 */
export async function generateCropAdvisory({ farm, advisory_type, current_season, user_observations }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Server error: GEMINI_API_KEY is not configured on the backend.');
  }

  const userPrompt = `Analyze the following farm data and generate an advisory report for: ${advisory_type}.
Farm Data:
- Climate: ${farm.climate_zone}
- Soil: ${farm.soil_type}, pH ${farm.soil_ph}
- NPK Levels: N:${farm.nitrogen_level}, P:${farm.phosphorus_level}, K:${farm.potassium_level}
- Season: ${current_season}
- Farmer Observations: ${user_observations || 'No specific observations provided by farmer.'}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: ADVISORY_RESPONSE_SCHEMA,
        temperature: 0.2, // Scientific, deterministic advisory
        maxOutputTokens: 2048
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response received from Gemini API.');
    }

    // Parse structured JSON
    const parsedData = JSON.parse(responseText);

    // Validate essential keys
    if (!parsedData.summary || !parsedData.recommended_actions || !parsedData.risk_level) {
      throw new Error('Gemini response missing required advisory schema fields.');
    }

    return parsedData;
  } catch (err) {
    console.error('[-] Error invoking Gemini API:', err);
    throw err;
  }
}
