import prisma from "@/lib/prisma";
import { OptimizationAgent } from "@/ai/optimization.agent";

export const OptimizationService = {
  /**
   * Retrieves all stored recommendations for a given campaign.
   */
  async getRecommendations(campaignId: string) {
    return await prisma.aIRecommendation.findMany({
      where: { campaignId },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Generates a new recommendation for a campaign based on its current communications metrics
   * and persists it in the database.
   */
  async generateAndStore(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        communications: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Compute metrics
    const total = campaign.communications.length;
    let delivered = 0;
    let failed = 0;

    for (const comm of campaign.communications) {
      const status = comm.status.toUpperCase();
      if (status === "DELIVERED") {
        delivered++;
      } else if (status === "FAILED") {
        failed++;
      }
    }

    const sent = delivered + failed;
    const pending = total - sent;

    // Call the agent
    const aiResult = await OptimizationAgent.generateRecommendation(
      campaign.name,
      campaign.channel,
      { sent, delivered, failed, pending }
    );

    // Save to the database
    const saved = await prisma.aIRecommendation.create({
      data: {
        campaignId,
        recommendation: aiResult.recommendation,
        reason: aiResult.reason,
        confidence: aiResult.confidence,
      },
    });

    return saved;
  },

  /**
   * Helper to fetch metrics and automatically generate recommendations for all completed or transmitting campaigns
   * if they do not yet have one stored, to populate dashboard widgets quickly.
   */
  async getOrGenerateLatest(campaignId: string) {
    const existing = await prisma.aIRecommendation.findFirst({
      where: { campaignId },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return existing;
    }

    // If none exists, automatically generate and return it
    try {
      return await this.generateAndStore(campaignId);
    } catch (err: any) {
      console.error(`Auto-recommendation generation failed for campaign ${campaignId}:`, err);
      return null;
    }
  },
};
