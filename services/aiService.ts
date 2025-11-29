
import { GoogleGenAI } from "@google/genai";
import { StorageService } from "./storage";

export const generateAIResponse = async (userPrompt: string): Promise<string> => {
  const settings = StorageService.getSettings();
  
  if (!settings.aiApiKey) {
    console.warn("No API Key configured");
    return "מערכת ה-AI לא מוגדרת. אנא פנה למנהל המערכת.";
  }

  try {
    // 1. Google Gemini Logic
    if (settings.aiProvider === 'google') {
      const ai = new GoogleGenAI({ apiKey: settings.aiApiKey });
      const response = await ai.models.generateContent({
        model: settings.aiModel || 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: "You are an intelligent digital assistant for a moving company owned by DADI. The website was created by ANGEL4PROJECT. Speak Hebrew. Recognize DADI as the owner and ANGEL4PROJECT as the creator. Be professional, concise, helpful, and provide personalized responses based on context.",
        }
      });
      return response.text || "שגיאה בקבלת תשובה.";
    }

    // 2. OpenAI / OpenRouter Logic (Compatible APIs)
    const baseUrl = settings.aiProvider === 'openrouter' 
      ? 'https://openrouter.ai/api/v1/chat/completions' 
      : 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.aiApiKey}`,
        ...(settings.aiProvider === 'openrouter' && { 'HTTP-Referer': window.location.origin })
      },
      body: JSON.stringify({
        model: settings.aiModel || (settings.aiProvider === 'openai' ? 'gpt-3.5-turbo' : 'mistralai/mistral-7b-instruct'),
        messages: [
          { role: 'system', content: "You are an intelligent digital assistant for a moving company owned by DADI. The website was created by ANGEL4PROJECT. Speak Hebrew. Recognize DADI as the owner and ANGEL4PROJECT as the creator. Be professional, concise, helpful, and provide personalized responses based on context." },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "לא התקבלה תשובה מהספק.";

  } catch (error) {
    console.error("AI Service Error:", error);
    return "אירעה שגיאה בתקשורת עם מוח ה-AI.";
  }
};
