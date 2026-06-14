import prisma from "@/lib/prisma";
import { CampaignAgent, CampaignGenerationResponse } from "@/ai/campaign.agent";

export interface SavedCampaign {
  id: string;
  name: string;
  status: string;
  channel: string;
  recommendationText?: string;
  reason?: string;
  createdAt: Date;
}

export const CampaignService = {
  // Call AI models to recommend layout models
  async designCampaign(goal: string): Promise<CampaignGenerationResponse> {
    return CampaignAgent.generateCampaign(goal);
  },

  // Save the customized campaign parameters safely to PostgreSQL
  async saveDraft(params: {
    name: string;
    channel: string;
    message: string;
    reason: string;
  }) {
    return prisma.campaign.create({
      data: {
        name: params.name,
        status: "DRAFT",
        channel: params.channel,
        recommendations: {
          create: {
            recommendation: params.message,
            reason: params.reason,
            confidence: 0.95,
          },
        },
      },
      include: {
        recommendations: true,
      },
    });
  },

  // Fetch saved campaign drafts to list inside UI
  async getAllDrafts(): Promise<SavedCampaign[]> {
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: "DRAFT",
      },
      orderBy: { createdAt: "desc" },
      include: {
        recommendations: true,
      },
    });

    return campaigns.map((campaign) => {
      const rec = campaign.recommendations[0];
      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        channel: campaign.channel,
        recommendationText: rec?.recommendation || "",
        reason: rec?.reason || "",
        createdAt: campaign.createdAt,
      };
    });
  },

  // Fetch campaigns that have been launched, with their delivery statistics
  async getCampaignsWithMetrics() {
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: {
          not: "DRAFT",
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        communications: {
          select: {
            status: true,
          },
        },
      },
    });

    return campaigns.map((c) => {
      const total = c.communications.length;
      const delivered = c.communications.filter((comm) => comm.status === "DELIVERED").length;
      const failed = c.communications.filter((comm) => comm.status === "FAILED").length;
      const pending = c.communications.filter((comm) => comm.status === "PENDING").length;

      return {
        id: c.id,
        name: c.name,
        status: c.status,
        channel: c.channel,
        createdAt: c.createdAt,
        metrics: {
          total,
          delivered,
          failed,
          pending,
          successRate: (delivered + failed) > 0 ? ((delivered / (delivered + failed)) * 100).toFixed(0) + "%" : "0%",
        },
      };
    });
  },

  // Fetch 15 most recent communication entries across all campaigns to populate log streams
  async getRecentCommunications() {
    return prisma.communication.findMany({
      take: 15,
      orderBy: { updatedAt: "desc" },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        campaign: {
          select: {
            name: true,
          },
        },
      },
    });
  },

  // Delete a campaign
  async deleteDraft(id: string) {
    return prisma.campaign.delete({
      where: { id },
    });
  },
};
