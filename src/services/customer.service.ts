import prisma from "@/lib/prisma";

export interface CustomerInput {
  name: string;
  email: string;
  phone?: string;
  totalSpend?: number;
  lastOrderDate?: Date | string;
}

export const CustomerService = {
  async createCustomer(data: CustomerInput) {
    const lastOrderDateParsed = data.lastOrderDate ? new Date(data.lastOrderDate) : undefined;
    return prisma.customer.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        phone: data.phone || null,
        totalSpend: data.totalSpend || 0.0,
        lastOrderDate: lastOrderDateParsed || null,
      },
    });
  },

  async upsertCustomer(data: CustomerInput) {
    const emailStr = data.email.toLowerCase().trim();
    const lastOrderDateParsed = data.lastOrderDate ? new Date(data.lastOrderDate) : undefined;

    return prisma.customer.upsert({
      where: { email: emailStr },
      update: {
        name: data.name,
        phone: data.phone || undefined,
        // Optional key updates - don't overwrite manual override if already populated, unless provided
        totalSpend: data.totalSpend !== undefined ? data.totalSpend : undefined,
        lastOrderDate: lastOrderDateParsed || undefined,
      },
      create: {
        name: data.name,
        email: emailStr,
        phone: data.phone || null,
        totalSpend: data.totalSpend || 0.0,
        lastOrderDate: lastOrderDateParsed || null,
      },
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
      where: { email: email.toLowerCase().trim() },
    });
  },

  async getAllCustomers(options?: { limit?: number; offset?: number }) {
    const take = options?.limit;
    const skip = options?.offset;
    return prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      ...(take !== undefined ? { take } : {}),
      ...(skip !== undefined ? { skip } : {}),
    });
  },

  async getStats() {
    const totalCustomers = await prisma.customer.count();
    const sumSpendResult = await prisma.customer.aggregate({
      _sum: {
        totalSpend: true,
      },
    });

    return {
      totalCustomers,
      totalSpend: sumSpendResult._sum.totalSpend || 0,
    };
  },

  async importCustomersFromParsedRows(rows: any[]) {
    const results = {
      successCount: 0,
      skippedCount: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const name = row.name || row.Name || row.customer_name;
        const email = row.email || row.Email || row.customer_email;
        const phone = row.phone || row.Phone || row.customer_phone || "";
        const totalSpendRaw = row.totalSpend || row.TotalSpend || row.total_spend || row.spend || "0";
        const lastOrderDateRaw = row.lastOrderDate || row.LastOrderDate || row.last_order_date || "";

        if (!name || !email) {
          results.skippedCount++;
          results.errors.push(`Row ${i + 1}: Missing name or email.`);
          continue;
        }

        // Extremely simple email validation check
        if (!email.includes("@")) {
          results.skippedCount++;
          results.errors.push(`Row ${i + 1}: Invalid email format (${email}).`);
          continue;
        }

        let totalSpend = parseFloat(totalSpendRaw);
        if (isNaN(totalSpend)) totalSpend = 0.0;

        let lastOrderDate: Date | undefined = undefined;
        if (lastOrderDateRaw) {
          const parsedDate = new Date(lastOrderDateRaw);
          if (!isNaN(parsedDate.getTime())) {
            lastOrderDate = parsedDate;
          }
        }

        await this.upsertCustomer({
          name: String(name).trim(),
          email: String(email).trim(),
          phone: String(phone).trim() || undefined,
          totalSpend,
          lastOrderDate,
        });

        results.successCount++;
      } catch (err: any) {
        results.skippedCount++;
        results.errors.push(`Row ${i + 1}: ${err.message || "Database action failed"}`);
      }
    }

    return results;
  },

  async deleteCustomer(id: string) {
    return prisma.customer.delete({
      where: { id },
    });
  },
};
