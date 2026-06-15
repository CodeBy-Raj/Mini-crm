import prisma from "@/lib/prisma";

export interface GlobalMetrics {
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
}

export interface CampaignProgress {
  id: string;
  name: string;
  channel: string;
  status: string;
  total: number;
  delivered: number;
  failed: number;
  pending: number;
  successRate: string;
  metrics?: {
    total: number;
    delivered: number;
    failed: number;
    pending: number;
    successRate: string;
  };
}

export interface RecentEvent {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  campaignId: string;
  campaignName: string;
  status: string;
  message: string;
  updatedAt: Date;
}

export const CampaignMetricsService = {
  /**
   * Fetches global transmission stats efficiently using database aggregations.
   */
  async getGlobalMetrics(): Promise<GlobalMetrics> {
    const aggregations = await prisma.communication.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    let delivered = 0;
    let failed = 0;
    let pending = 0;

    for (const group of aggregations) {
      if (group.status === "DELIVERED") {
        delivered = group._count.id;
      } else if (group.status === "FAILED") {
        failed = group._count.id;
      } else if (group.status === "PENDING" || group.status === "SENT") {
        pending = group._count.id;
      }
    }

    // "Sent" represents all messages that have passed or are passing through transmission channels
    const sent = delivered + failed + pending; 

    return {
      sent,
      delivered,
      failed,
      pending,
    };
  },

  /**
   * Fetches progressive stats for all non-draft campaigns efficiently.
   */
  async getCampaignsProgress(): Promise<CampaignProgress[]> {
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: {
          not: "DRAFT",
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        channel: true,
        status: true,
        communications: {
          select: {
            status: true,
          },
        },
      },
    });

    return campaigns.map((c:any) => {
      const total = c.communications.length;
      let delivered = 0;
      let failed = 0;
      let pending = 0;

      for (const comm of c.communications) {
        if (comm.status === "DELIVERED") {
          delivered++;
        } else if (comm.status === "FAILED") {
          failed++;
        } else {
          pending++;
        }
      }

      const processed = delivered + failed;
      const successRate = processed > 0 ? ((delivered / processed) * 100).toFixed(0) + "%" : "0%";

      return {
        id: c.id,
        name: c.name,
        channel: c.channel,
        status: c.status,
        total,
        delivered,
        failed,
        pending,
        successRate,
        metrics: {
          total,
          delivered,
          failed,
          pending,
          successRate,
        }
      };
    });
  },

  /**
   * Fetches the most recent transmission event details with customer and campaign associations.
   */
  async getRecentEvents(limit: number = 10): Promise<RecentEvent[]> {
    const communications = await prisma.communication.findMany({
      take: limit,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        customerId: true,
        status: true,
        message: true,
        updatedAt: true,
        campaignId: true,
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

    return communications.map((comm:any) => ({
      id: comm.id,
      customerId: comm.customerId,
      customerName: comm.customer?.name || "Unknown Customer",
      customerEmail: comm.customer?.email || "N/A",
      campaignId: comm.campaignId,
      campaignName: comm.campaign?.name || "Unnamed Campaign",
      status: comm.status,
      message: comm.message,
      updatedAt: comm.updatedAt,
    }));
  },

  /**
   * Retrieves high-performance combined payload containing global, progressive, and recent records.
   */
  async getCombinedExecutionMetrics() {
    const [global, campaigns, events] = await Promise.all([
      this.getGlobalMetrics(),
      this.getCampaignsProgress(),
      this.getRecentEvents(15),
    ]);

    return {
      global,
      campaigns,
      events,
    };
  }
};
