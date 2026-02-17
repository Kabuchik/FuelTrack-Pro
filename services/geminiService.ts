
import { GoogleGenAI } from "@google/genai";
import { FuelTransaction, Client } from "../types";

// Initializing the Gemini API client using the environment variable directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFuelInsights = async (transactions: FuelTransaction[], clients: Client[]) => {
  if (transactions.length === 0) return "No data available for analysis.";

  const summaryData = transactions.map(t => ({
    client: clients.find(c => c.id === t.clientId)?.name || 'Unknown',
    liters: t.liters,
    station: t.stationName,
    date: t.date,
    fuel: t.fuelType
  })).slice(0, 50); // Limit to 50 for token budget

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these fuel transactions and provide a short, professional summary (3-4 sentences) of consumption trends, potential savings, and irregularities. Data: ${JSON.stringify(summaryData)}`,
      config: {
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI analysis unavailable.";
  }
};
