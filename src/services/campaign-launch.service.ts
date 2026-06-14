import prisma from "@/lib/prisma";
import { SegmentationAgent, SegmentationFilters } from "@/ai/segmentation.agent";
import { randomUUID } from "crypto";

export interface CampaignLaunchParams {
  name: string;
  channel: string;
  message: string;
  audiencePrompt: string;
}

export interface CampaignLaunchResult {
  success: boolean;
  campaign: {
    id: string;
    name: string;
    channel: string;
    status: string;
    createdAt: Date;
  };
  audienceSize: number;
  communicationsGenerated: number;
  communications?: Array<{ id: string; message: string }>;
}

export const CampaignLaunchService = {
  /**
   * Helper to build safe Prisma WHERE clause matching SegmentationFilters
   */
  buildWhereClause(filters: SegmentationFilters) {
    const andClauses: any[] = [];

    if (filters.minSpend !== undefined && !isNaN(filters.minSpend)) {
      andClauses.push({ totalSpend: { gte: filters.minSpend } });
    }

    if (filters.maxSpend !== undefined && !isNaN(filters.maxSpend)) {
      andClauses.push({ totalSpend: { lte: filters.maxSpend } });
    }

    if (filters.lastOrderBeforeDays !== undefined && !isNaN(filters.lastOrderBeforeDays)) {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - filters.lastOrderBeforeDays);
      andClauses.push({
        OR: [
          { lastOrderDate: { lt: dateLimit } },
          { lastOrderDate: null }
        ]
      });
    }

    if (filters.lastOrderAfterDays !== undefined && !isNaN(filters.lastOrderAfterDays)) {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - filters.lastOrderAfterDays);
      andClauses.push({
        lastOrderDate: { gte: dateLimit }
      });
    }

    if (filters.hasPhone !== undefined) {
      if (filters.hasPhone) {
        andClauses.push({ phone: { not: null } });
      } else {
        andClauses.push({ phone: null });
      }
    }

    if (filters.nameContains !== undefined && filters.nameContains.trim() !== "") {
      andClauses.push({
        name: { contains: filters.nameContains, mode: "insensitive" }
      });
    }

    if (filters.emailDomain !== undefined && filters.emailDomain.trim() !== "") {
      const domain = filters.emailDomain.trim().toLowerCase();
      const sanitizedDomain = domain.startsWith("@") ? domain : `@${domain}`;
      andClauses.push({
        email: { endsWith: sanitizedDomain }
      });
    }

    return andClauses.length > 0 ? { AND: andClauses } : {};
  },

  /**
   * Main service call to compile objective audience, register Campaign,
   * make bulk Communication logs inside SQL transactions, and return Phase 6 statistics.
   */
  async launchCampaign(params: CampaignLaunchParams): Promise<CampaignLaunchResult> {
    const { name, channel, message, audiencePrompt } = params;

    if (!name?.trim()) {
      throw new Error("Campaign name is required.");
    }
    if (!channel?.trim()) {
      throw new Error("Campaign delivery channel is required.");
    }
    if (!message?.trim()) {
      throw new Error("Campaign marketing message text copy is required.");
    }
    if (!audiencePrompt?.trim()) {
      throw new Error("Audience target criteria prompt is required.");
    }

    // 1. Resolve structured filters via the Gemini AI Agent
    const agentResponse = await SegmentationAgent.generateFilters(audiencePrompt.trim());
    const whereClause = this.buildWhereClause(agentResponse.filters);

    // 2. Fetch ALL matching customers to enable bulk operations
    const matchedCustomers = await prisma.customer.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const audienceSize = matchedCustomers.length;

    if (audienceSize === 0) {
      throw new Error(`Zero matching customer accounts were discovered for target query: "${audiencePrompt}"`);
    }

    // 3. Atomically deploy the Campaign and bulk insert Communication records inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create campaign record
      const campaign = await tx.campaign.create({
        data: {
          name: name.trim(),
          status: "PENDING", // Newly created campaign state
          channel: channel.trim().toUpperCase(),
        },
      });

      // Insert AI recommendations details (reasoning track)
      await tx.aIRecommendation.create({
        data: {
          campaignId: campaign.id,
          recommendation: message,
          reason: `Auto-launched via criteria: "${audiencePrompt}". ${agentResponse.explanation}`,
          confidence: 0.98,
        },
      });

      // Prepare communication payload with manual UUIDs to ensure maximum platform driver resilience
      const communicationPayloads = matchedCustomers.map((cust) => {
        // Parse first name safely
        const firstName = cust.name ? cust.name.trim().split(/\s+/)[0] : "customer";
        // Interpolate templates safely (e.g. {{name}}, {{first_name}}, {{firstName}} or {{email}})
        let customizedMessage = message
          .replace(/\{\{\s*name\s*\}\}/gi, cust.name)
          .replace(/\{\{\s*first_name\s*\}\}/gi, firstName)
          .replace(/\{\{\s*firstName\s*\}\}/gi, firstName)
          .replace(/\{\{\s*email\s*\}\}/gi, cust.email);

        return {
          id: randomUUID(),
          campaignId: campaign.id,
          customerId: cust.id,
          status: "PENDING", // Communication Status must be Pending as specified
          message: customizedMessage,
        };
      });

      // Execute database bulk insert (createMany)
      const insertResult = await tx.communication.createMany({
        data: communicationPayloads,
      });

      return {
        campaign,
        communicationsGenerated: insertResult.count,
        communications: communicationPayloads.map(cp => ({ id: cp.id, message: cp.message })),
      };
    });

    return {
      success: true,
      campaign: {
        id: result.campaign.id,
        name: result.campaign.name,
        channel: result.campaign.channel,
        status: result.campaign.status,
        createdAt: result.campaign.createdAt,
      },
      audienceSize,
      communicationsGenerated: result.communicationsGenerated,
      communications: result.communications,
    };
  }
};
