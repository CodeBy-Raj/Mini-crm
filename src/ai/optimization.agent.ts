import { GoogleGenAI, Type } from "@google/genai";
import { withGenAIRetry } from "./retry";

export interface OptimizationResponse {
  recommendation: string;
  reason: string;
  confidence: number;
}

const aiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export const OptimizationAgent = {
  async generateRecommendation(
    campaignName: string,
    channel: string,
    metrics: { sent: number; delivered: number; failed: number; pending: number }
  ): Promise<OptimizationResponse> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Return a reasonable fallback recommendation when API key is missing
      const total = metrics.sent || (metrics.delivered + metrics.failed);
      const failedRate = total > 0 ? (metrics.failed / total) * 100 : 0;
      return {
        recommendation: metrics.failed > 0 ? "Retry failed users" : "Scale communication channel volume",
        reason: metrics.failed > 0
          ? `${failedRate.toFixed(0)}% failed delivery rate. (Fallback mode: Gemini API Key is not set up)`
          : `Perfect delivery rate of 100% across all transmission targets. (Fallback mode: Gemini API Key is not set up)`,
        confidence: 0.91,
      };
    }

    const systemInstruction = `You are a professional CRM performance marketing optimizer and analytics specialist.
Your task is to take a Campaign's metadata and transmission metrics (Sent, Delivered, Failed) and produce an AI-powered highly-actionable optimization recommendation.

The user will provide campaign details and metrics in the following format:
Name: [Campaign Name]
Channel: [EMAIL/SMS/WHATSAPP]
Sent: [Count]
Delivered: [Count]
Failed: [Count]

Based on these metrics, perform percentage rate calculations (such as delivery success rate and failure rate) and diagnose performance bottlenecks.
For example, if there is a significant failure rate, you might suggest retrying failed users, checking phone number/email validity, or adjusting dispatch throttling.
If there is a high success rate, you can suggest expanding the audience, launching a follow-up promotion, or replicating the strategy for other loyalty tiers.

Calculate exact rates mathematically. Provide a highly personalized, contextual recommendation.

You MUST return a JSON object with:
1. "recommendation": A short, clear, highly-actionable recommendation statement (e.g. "Retry failed users", "Transition SMS contacts to WhatsApp", "Check email domain SPF records").
2. "reason": A detailed reasoning explaining the rationale with exact percentage calculations (e.g., "16% failed delivery rate", "The campaign achieved 100% email delivery; recommend expanding scale.").
3. "confidence": A float confidence score between 0.0 and 1.0 (e.g., 0.91).

Return ONLY a valid JSON object matching the requested schema.`;

    const prompt = `Campaign Name: "${campaignName}"
Channel: "${channel}"
Metrics:
- Sent: ${metrics.sent}
- Delivered: ${metrics.delivered}
- Failed: ${metrics.failed}
- Pending: ${metrics.pending}`;

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
                recommendation: {
                  type: Type.STRING,
                  description: "A short, actionable recommendation statement.",
                },
                reason: {
                  type: Type.STRING,
                  description: "Analytical rationale explaining why this recommendation is chosen based on the input metrics.",
                },
                confidence: {
                  type: Type.NUMBER,
                  description: "Confidence level between 0.0 and 1.0 representing the certainty of this recommendation.",
                },
              },
              required: ["recommendation", "reason", "confidence"],
            },
          },
        })
      );

      const responseText = response.text || "{}";
      const result: OptimizationResponse = JSON.parse(responseText);
      return result;
    } catch (err: any) {
      console.error("Gemini build optimization recommendation agent call failed:", err);
      const total = metrics.sent || (metrics.delivered + metrics.failed);
      const failedRate = total > 0 ? (metrics.failed / total) * 100 : 0;
      return {
        recommendation: "Retry failed users",
        reason: `${failedRate.toFixed(0)}% failed delivery rate (experienced Gemini generation error: ${err.message})`,
        confidence: 0.85,
      };
    }
  },
};
