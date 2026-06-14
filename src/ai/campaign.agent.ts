import { GoogleGenAI, Type } from "@google/genai";
import { withGenAIRetry } from "./retry";

export interface CampaignGenerationResponse {
  channel: string;
  message: string;
  reason: string;
}

const aiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export const CampaignAgent = {
  async generateCampaign(goal: string): Promise<CampaignGenerationResponse> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return {
        channel: "EMAIL",
        message: `Hello! We've noticed you haven't visited us in a while. Since our Gemini API Key is not set up yet in the developer dashboard, we are showing this fallback content. (Set process.env.GEMINI_API_KEY to retrieve high-fidelity curated drafts)`,
        reason: "Offline fallback mode due to missing API credential key.",
      };
    }

    const systemInstruction = `You are a professional CRM copywriter and marketing campaign strategist.
Your task is to take a Campaign Goal and generate the optimal communication recommendations.

You MUST choose one of these standard communication channels:
- "EMAIL"
- "SMS"
- "WHATSAPP"

Provide:
1. "channel": One of the chosen channels ("EMAIL", "SMS", or "WHATSAPP").
2. "message": A compelling, ready-to-send marketing/engagement dynamic copy draft tailored to the channel.
   - For EMAIL: Include a Subject line at the very top (e.g. "Subject: [Your Subject Line]"), followed by a blank line and then the email body.
   - For all channels: Ensure the message is well-structured and uses natural paragraph line breaks. Use standard, actual newline characters in the JSON string property to separate paragraphs (do not write literal '\\n' characters as text; separate lines with actual newlines).
   - Use standard personalized tags like {{first_name}} or {{email}} for custom fields (e.g., "Hi {{first_name}},").
3. "reason": Tactical marketing reasoning explaining why this channel and copy draft were formulated for the goal.

Return ONLY a valid JSON object matching the requested schema.`;

    try {
      const response = await withGenAIRetry(() =>
        aiClient.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Campaign Goal: "${goal}"`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                channel: {
                  type: Type.STRING,
                  description: "The selected communication channel. Must be either 'EMAIL', 'SMS', or 'WHATSAPP'.",
                },
                message: {
                  type: Type.STRING,
                  description: "The complete content message draft.",
                },
                reason: {
                  type: Type.STRING,
                  description: "Executive reasoning behind the draft copy selection and channel allocation.",
                },
              },
              required: ["channel", "message", "reason"],
            },
          },
        })
      );

      const responseText = response.text || "{}";
      const result: CampaignGenerationResponse = JSON.parse(responseText);

      if (result && typeof result.message === "string") {
        // Replace all literal "\n" strings (escaped backslash followed by 'n') with actual newline characters
        result.message = result.message
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "\r")
          // In some cases, the model might include double carriage returns, sanitize them
          .replace(/\r\n/g, "\n")
          .trim();
      }

      return result;
    } catch (err: any) {
      console.error("Gemini campaign generation agent call failed:", err);
      return {
        channel: "EMAIL",
        message: `Oops! We experienced an issue constructing your campaign: ${err.message}`,
        reason: "Gemini server endpoint error or parsing malfunction.",
      };
    }
  },
};
