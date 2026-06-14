import prisma from "@/lib/prisma";

export const UserService = {
  // Empty space for potential authentication users if needed, or we can focus on core domain services below.
};

export const CustomerService = {
  async createCustomer(data: {
    name: string;
    email: string;
    phone?: string;
    totalSpend?: number;
    lastOrderDate?: Date;
  }) {
    return prisma.customer.create({
      data,
    });
  },

  async getCustomerById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        orders: true,
        communications: true,
      },
    });
  },

  async getCustomerByEmail(email: string) {
    return prisma.customer.findUnique({
      where: { email },
    });
  },

  async getAllCustomers() {
    return prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async updateCustomer(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      totalSpend?: number;
      lastOrderDate?: Date;
    }
  ) {
    return prisma.customer.update({
      where: { id },
      data,
    });
  },

  async deleteCustomer(id: string) {
    return prisma.customer.delete({
      where: { id },
    });
  },
};

export const OrderService = {
  async createOrder(data: { customerId: string; amount: number; createdAt?: Date }) {
    // Run inside a transaction so totalSpend and lastOrderDate are updated atomicly
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data,
      });

      const orderDate = data.createdAt || new Date();

      // Get the customer to aggregate
      const customer = await tx.customer.findUnique({
        where: { id: data.customerId },
      });

      if (customer) {
        const newTotalSpend = (customer.totalSpend || 0) + data.amount;
        // Determine latest order date
        const currentLastOrder = customer.lastOrderDate;
        const newLastOrderDate =
          !currentLastOrder || orderDate > currentLastOrder ? orderDate : currentLastOrder;

        await tx.customer.update({
          where: { id: data.customerId },
          data: {
            totalSpend: newTotalSpend,
            lastOrderDate: newLastOrderDate,
          },
        });
      }

      return order;
    });
  },

  async getOrdersByCustomerId(customerId: string) {
    return prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getAllOrders() {
    return prisma.order.findMany({
      include: {
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },
};

export const CampaignService = {
  async createCampaign(data: { name: string; status: string; channel: string }) {
    return prisma.campaign.create({
      data,
    });
  },

  async getCampaignById(id: string) {
    return prisma.campaign.findUnique({
      where: { id },
      include: {
        communications: true,
        recommendations: true,
      },
    });
  },

  async getAllCampaigns() {
    return prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async updateCampaign(
    id: string,
    data: {
      name?: string;
      status?: string;
      channel?: string;
    }
  ) {
    return prisma.campaign.update({
      where: { id },
      data,
    });
  },

  async deleteCampaign(id: string) {
    return prisma.campaign.delete({
      where: { id },
    });
  },
};

export const CommunicationService = {
  async createCommunication(data: {
    campaignId: string;
    customerId: string;
    status: string;
    message: string;
  }) {
    return prisma.communication.create({
      data,
    });
  },

  async getCommunicationsByCampaign(campaignId: string) {
    return prisma.communication.findMany({
      where: { campaignId },
      include: {
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getCommunicationsByCustomer(customerId: string) {
    return prisma.communication.findMany({
      where: { customerId },
      include: {
        campaign: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },
};

export const AIRecommendationService = {
  async createRecommendation(data: {
    campaignId: string;
    recommendation: string;
    reason: string;
    confidence: number;
  }) {
    return prisma.aIRecommendation.create({
      data,
    });
  },

  async getRecommendationsByCampaign(campaignId: string) {
    return prisma.aIRecommendation.findMany({
      where: { campaignId },
      orderBy: { createdAt: "desc" },
    });
  },
};
