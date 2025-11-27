import { GoogleGenAI, Type } from "@google/genai";
import { GraphData } from '../types';

export const generateBioGraph = async (topic: string, apiKey: string): Promise<GraphData> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in the settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Generate a biological network graph for the topic: "${topic}".
  Focus on interactions between key concepts, molecules, or processes.
  Return strictly valid JSON matching the schema.
  Limit to 15-25 nodes for clarity.
  For 'group', assign a meaningful category label (e.g., "Reactant", "Product", "Enzyme", "Structure", "Process") or simply use "${topic}".
  Assign reasonable radius values based on importance (Core Concept: 25-40, Secondary: 15-20, Detail: 10-15).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique name of the biological entity" },
                  group: { 
                    type: Type.STRING, 
                    description: "Category label for the node"
                  },
                  radius: { type: Type.NUMBER },
                  description: { type: Type.STRING, description: "Short scientific description (1 sentence)" }
                },
                required: ["id", "group", "radius"]
              }
            },
            links: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING, description: "ID of source node" },
                  target: { type: Type.STRING, description: "ID of target node" },
                  label: { type: Type.STRING, description: "Short relationship text (e.g., 'inhibits', 'produces')" }
                },
                required: ["source", "target"]
              }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from Gemini");
    
    const data = JSON.parse(jsonText) as GraphData;
    
    return data;

  } catch (error) {
    console.error("Gemini Graph Generation Error:", error);
    throw error;
  }
};

export const explainNode = async (nodeId: string, context: string, apiKey: string): Promise<string> => {
    if (!apiKey) return "API Key is missing. Please configure it in settings.";

    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Briefly explain the biological function of "${nodeId}" in the context of "${context}". Keep it under 50 words.`
        });
        return response.text || "No explanation available.";
    } catch (e) {
        console.error(e);
        return "Failed to fetch explanation.";
    }
}