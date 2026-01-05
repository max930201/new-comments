
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  analyzeMessage: async (content: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the sentiment of the following message and provide a brief analysis. 
        Message: "${content}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentiment: {
                type: Type.STRING,
                description: "One of: Positive, Neutral, Negative",
              },
              analysis: {
                type: Type.STRING,
                description: "Short sentence summarizing the message tone",
              }
            },
            required: ["sentiment", "analysis"]
          }
        },
      });

      const result = JSON.parse(response.text || '{}');
      return {
        sentiment: result.sentiment || 'Unknown',
        analysis: result.analysis || ''
      };
    } catch (error) {
      console.error("Gemini analysis error:", error);
      return { sentiment: 'Unknown', analysis: 'Could not process AI analysis' };
    }
  },

  generateAdminReply: async (messageContent: string, author: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a professional and friendly community manager. 
        Write a short, polite reply to this guestbook message from ${author}: "${messageContent}"`,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini reply error:", error);
      return "Thank you for your message!";
    }
  }
};
