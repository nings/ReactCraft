import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize only if key exists to prevent immediate crashes, handle errors gracefully in UI
let ai: GoogleGenAI | null = null;
try {
    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
    }
} catch (e) {
    console.error("Failed to initialize Gemini Client", e);
}

export const askArchitect = async (message: string): Promise<string> => {
    if (!ai) {
        return "Error: API Key is missing. Please check your environment configuration.";
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction: "You are the 'ReactCraft Architect', an expert guide for a voxel-based building game. Keep answers short, encouraging, and focused on how to build structures using only: dirt, grass, glass, wood, and log. If asked about coordinates, explain that X/Z are horizontal and Y is vertical. Use emojis occasionally.",
            }
        });
        return response.text || "I couldn't think of a response.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "I lost connection to the creative server. Try again!";
    }
};