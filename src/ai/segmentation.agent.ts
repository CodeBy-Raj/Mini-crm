import { GoogleGenAI, Type } from "@google/genai";
import { withGenAIRetry } from "./retry";

export interface SegmentationFilters {
  lastOrderBeforeDays?: number;
  lastOrderAfterDays?: number;
  minSpend?: number;
  maxSpend?: number;
  hasPhone?: boolean;
  nameContains?: string;
  emailDomain?: string;
}

export interface SegmentationAgentResponse {
  filters: SegmentationFilters;
  explanation: string;
}

const aiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export const SegmentationAgent = {
  async generateFilters(prompt: string): Promise<SegmentationAgentResponse> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return {
        filters: {},
        explanation: "Gemini API Key (GEMINI_API_KEY) is missing. Set it in the Secrets panel to enable AI segmentation.",
      };
    }

    const systemInstruction = `You are a CRM audience database segmenter.
Your sole job is to translate natural language user target specifications (e.g. "Customers inactive for 90 days with over $100 spend") into standard, structured filters.

Available filters:
- "lastOrderBeforeDays": number. Filters for customers whose last order date is older than X days, or who have never placed an order if specified in context.
- "lastOrderAfterDays": number. Filters for customers whose last order date is within the last X days.
- "minSpend": number. Filters for customers whose combined total spend is greater than or equal to this value.
- "maxSpend": number. Filters for customers whose combined total spend is less than or equal to this value.
- "hasPhone": boolean. Filters for customers with or without a verified phone contact listing.
- "nameContains": string. Filters for customers whose name includes this pattern (case-insensitive).
- "emailDomain": string. Filters for customers whose email address ends with this domain name, e.g. "gmail.com", "outlook.com".

You must only output fields that are explicitly or implicitly described. Do not guess default filter ranges unless implied.
Provide a friendly, highly concise description explaining how you translated their request.

Return ONLY a valid JSON object matching the requested schema.`;

    try {
      const response = await withGenAIRetry(() =>
        aiClient.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                filters: {
                  type: Type.OBJECT,
                  description: "The parsed filters to select matching customers.",
                  properties: {
                    lastOrderBeforeDays: {
                      type: Type.INTEGER,
                      description: "Filters for customers whose last order was more than X days ago.",
                    },
                    lastOrderAfterDays: {
                      type: Type.INTEGER,
                      description: "Filters for customers whose last order was within the last X days.",
                    },
                    minSpend: {
                      type: Type.NUMBER,
                      description: "Minimum cumulative spend amount.",
                    },
                    maxSpend: {
                      type: Type.NUMBER,
                      description: "Maximum cumulative spend amount.",
                    },
                    hasPhone: {
                      type: Type.BOOLEAN,
                      description: "True to find accounts with a phone entry, False for accounts without one.",
                    },
                    nameContains: {
                      type: Type.STRING,
                      description: "Sub-string matching pattern for a customer name.",
                    },
                    emailDomain: {
                      type: Type.STRING,
                      description: "Domain matching for email endings, e.g. 'gmail.com'.",
                    },
                  },
                },
                explanation: {
                  type: Type.STRING,
                  description: "A friendly explanation of what filtering logic was set up.",
                },
              },
              required: ["filters", "explanation"],
            },
          },
        })
      );

      const responseText = response.text || "{}";
      const result: SegmentationAgentResponse = JSON.parse(responseText);
      return result;
    } catch (err: any) {
      console.error("Gemini segmentation agent call failed:", err);
      return {
        filters: {},
        explanation: `Integration failure processing AI generation: ${err.message || err}`,
      };
    }
  },
};
