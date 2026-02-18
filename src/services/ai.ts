import { Product } from "../types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_ID = "llama3-70b-8192"; // High quality, free/fast model on Groq

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
        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: MODEL_ID,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 150
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Failed to generate description");
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        return text ? text.trim() : "Description generation failed.";
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw error;
    }
};

// Groq also supports listing models via OpenAI compatible endpoint, 
// but for simplicity we'll just return a static list of supported models or fetch from Groq if needed.
// This function was previously fetching from Gemini. 
// We'll update it to check Groq models or return our preferred defaults.
export const listModels = async (apiKey: string): Promise<string[]> => {
    if (!apiKey) throw new Error("API Key is required");

    try {
        const response = await fetch("https://api.groq.com/openai/v1/models", {
            headers: {
                "Authorization": `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            // Fallback if list fails (e.g. key issue or rate limit on list endpoint)
            console.warn("Failed to list remote models, returning defaults");
            return [MODEL_ID, "llama3-8b-8192", "mixtral-8x7b-32768", "gemma-7b-it"];
        }

        const data = await response.json();
        return data.data?.map((m: any) => m.id) || [];
    } catch (error) {
        console.error("List Models Error:", error);
        // Fallback on error
        return [MODEL_ID, "llama3-8b-8192", "mixtral-8x7b-32768", "gemma-7b-it"];
    }
};
