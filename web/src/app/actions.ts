'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const getModel = async (apiKey: string, useVision = false) => {
    const genAI = new GoogleGenerativeAI(apiKey);

    const modelName = useVision
        ? "gemini-flash-latest"   // multimodal (images + text)
        : "gemini-flash-latest"; // or "gemini-pro-latest" for text-only

    return genAI.getGenerativeModel({ model: modelName });
};

const generateWithFallback = async (
    apiKey: string,
    prompt: string | any[],
    isVision = false
) => {
    const genAI = new GoogleGenerativeAI(apiKey);

    const models = isVision
        ? ["gemini-flash-latest"] // vision-capable models
        : ["gemini-flash-latest", "gemini-pro-latest"];

    let lastError: any;

    for (const modelName of models) {
        try {
            console.log(`Attempting with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (e: any) {
            console.error(`Model ${modelName} failed:`, e.message);
            lastError = e;
            if (!e.message.includes("404") && !e.message.includes("not found")) {
                throw e;
            }
        }
    }

    throw lastError;
};

export async function analyzeReceipt(formData: FormData) {
    const file = formData.get('file') as File;

    if (!file) {
        return { error: 'No file provided' };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return { error: 'Gemini API Key is missing. Please configure GEMINI_API_KEY in .env.local' };
    }

    try {
        const arrayBuffer = await file.arrayBuffer();

        const prompt = `Analyze this receipt image. Extract the following information in strict JSON format:
    {
      "storeName": "Name of the store",
      "date": "Date in ISO format (YYYY-MM-DD)",
      "amount": 0.00,
      "currency": "USD" (or inferred currency symbol),
      "category": "One of: Groceries, Electronics, Clothing, Restaurant, Home, Others",
      "items": [
        { "name": "Item name", "price": 0.00, "quantity": 1 }
      ]
    }
    If the image is not a receipt, return {"error": "Not a receipt"}.
    Do not use Markdown code blocks. Just return the raw JSON string.`;

        const inputs = [
            prompt,
            {
                inlineData: {
                    data: Buffer.from(arrayBuffer).toString('base64'),
                    mimeType: file.type,
                },
            },
        ];

        const text = await generateWithFallback(apiKey, inputs, true);

        // Clean up potential markdown code blocks
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonString);

    } catch (error) {
        console.error('Error analyzing receipt:', error);
        return { error: 'Failed to analyze receipt. Please try again.' };
    }
}

export async function askCoach(question: string, context: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return { error: 'Gemini API Key is missing.' };
    }

    try {
        const prompt = `You are a helpful budget coach. 
    Context (User's Bills):
    ${context}
    
    User Question: ${question}
    
    Answer the user's question based on the context. Be concise and friendly. Format your answer with Markdown.`;

        const text = await generateWithFallback(apiKey, prompt, false);
        return { text };
    } catch (e) {
        console.error(e);
        return { error: 'Failed to get answer from coach. Please check your API key.' };
    }
}
