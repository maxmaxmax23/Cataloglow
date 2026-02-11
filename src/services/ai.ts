import { Product } from "../types";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-001:generateContent";

export const generateDescription = async (
    product: Product,
    apiKey: string
): Promise<string> => {
    if (!apiKey) throw new Error("API Key is required");

    // Construct a prompt based on available product data
    const prompt = `
    Write a short, luxurious, and captivating product description (max 2 sentences) for a high-end cosmetic product.
    
    Product Name: ${product.name}
    Category: ${product.category}
    Subtitle: ${product.subtitle}
    Benefits: ${product.benefits?.join(", ") || "Premium quality"}
    
    The tone should be sophisticated, elegant, and persuasive. 
    Focus on the benefits and the feeling of using the product.
    Do NOT use hashtags.
    Do NOT include the product name in the description if possible, just describe it.
  `;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Failed to generate description");
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        return text ? text.trim() : "Description generation failed.";
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw error;
    }
};

export const listModels = async (apiKey: string): Promise<string[]> => {
    if (!apiKey) throw new Error("API Key is required");

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Failed to list models");
        }
        const data = await response.json();
        return data.models?.map((m: any) => m.name) || [];
    } catch (error) {
        console.error("List Models Error:", error);
        throw error;
    }
};
