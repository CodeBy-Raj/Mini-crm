import prisma from "@/lib/prisma";
import { SegmentationAgent, SegmentationFilters } from "@/ai/segmentation.agent";

export interface AudienceResult {
  filters: SegmentationFilters;
  explanation: string;
  size: number;
  samples: Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    totalSpend: number;
    lastOrderDate: Date | null;
    createdAt: Date;
  }>;
}

export const SegmentationService = {
  async buildAudience(prompt: string): Promise<AudienceResult> {
    // 1. Call standard AI Agent to transform word prompts to structured JSON filters
    const agentResponse = await SegmentationAgent.generateFilters(prompt);
    const { filters, explanation } = agentResponse;

    // 2. Construct Safe Prisma Query Clauses incrementally without any SQL string templates
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
      // Safe domain match: either ends with @domain or just domain
      const sanitizedDomain = domain.startsWith("@") ? domain : `@${domain}`;
      andClauses.push({
        email: { endsWith: sanitizedDomain }
      });
    }

    const whereClause = andClauses.length > 0 ? { AND: andClauses } : {};

    // 3. Execute Prisma Client Query to ensure type safety and full ORM security
    const size = await prisma.customer.count({
      where: whereClause,
    });

    const samples = await prisma.customer.findMany({
      where: whereClause,
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    return {
      filters,
      explanation,
      size,
      samples,
    };
  }
};
