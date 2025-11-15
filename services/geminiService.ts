
import { GoogleGenAI } from "@google/genai";
import { Letter } from '../types';

const getAiClient = () => {
    if (!process.env.API_KEY) {
        // In a real app, you might want to handle this more gracefully.
        // For this project, we'll throw an error if the key is missing.
        throw new Error("API_KEY environment variable not set.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getReplySuggestion = async (letter: Letter): Promise<string> => {
    try {
        const ai = getAiClient();
        const prompt = `
            You are an empathetic and supportive moderator for a platform called "kholachitthi.com" (খোলা চিঠি).
            A user has written the following letter seeking help and support.
            Your task is to provide a kind, hopeful, and constructive reply in Bengali.
            Do not give medical advice, but offer emotional support, validation, and encouragement.
            Keep the tone warm and reassuring. The goal is to make the user feel heard and less alone.

            Here is the letter:
            Subject: ${letter.subject}
            Body: ${letter.body}

            Please draft a supportive reply in Bengali.
        `;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are an empathetic moderator writing in Bengali.",
            },
        });
        
        return response.text;
    } catch (error) {
        console.error("Error generating reply suggestion:", error);
        return "দুঃখিত, এই মুহূর্তে একটি পরামর্শ তৈরি করা সম্ভব হচ্ছে না। অনুগ্রহ করে আবার চেষ্টা করুন।";
    }
};