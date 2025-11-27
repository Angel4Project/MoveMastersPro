import { GoogleGenAI } from "@google/genai";
import { StorageService } from "./storage";

export const generateAIResponse = async (userPrompt: string): Promise<string> => {
  const settings = StorageService.getSettings();
  
  if (!settings.aiApiKey) {
    throw new Error("No API Key configured");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: settings.aiApiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: "You are a helpful customer support agent for a moving company named 'HaMiktzoan'. You speak Hebrew. Keep answers short and professional.",
      }
    });

    return response.text || "מצטער, לא הצלחתי ליצור תשובה כרגע.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "אירעה שגיאה בחיבור למוח המלאכותי.";
  }
};