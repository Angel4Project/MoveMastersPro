import { GoogleGenerativeAI } from "@google/generative-ai";
import { StorageService } from "./storage";

export const generateAIResponse = async (userPrompt: string): Promise<string> => {
  const settings = StorageService.getSettings();
  
  if (!settings.aiApiKey) {
    throw new Error("No API Key configured");
  }

  try {
    const genAI = new GoogleGenerativeAI(settings.aiApiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: "You are a helpful customer support agent for a moving company named 'HaMiktzoan'. You speak Hebrew. Keep answers short and professional.",
    });

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    const text = response.text();

    return text || "מצטער, לא הצלחתי ליצור תשובה כרגע.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "אירעה שגיאה בחיבור למוח המלאכותי.";
  }
};