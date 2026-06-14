import prisma from "@/lib/prisma";

export interface OrderInput {
  id?: string;
  customerId: string;
  amount: number;
  createdAt?: Date | string;
}

export const OrderService = {
  async createOrder(data: OrderInput) {
    return prisma.$transaction(async (tx) => {
      const orderDate = data.createdAt ? new Date(data.createdAt) : new Date();

      const order = await tx.order.create({
        data: {
          id: data.id || undefined,
          customerId: data.customerId,
          amount: data.amount,
          createdAt: orderDate,
        },
      });

      // Update customer totalSpend and lastOrderDate atomically
      const customer = await tx.customer.findUnique({
        where: { id: data.customerId },
      });

      if (customer) {
        const newTotalSpend = (customer.totalSpend || 0) + data.amount;
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

  async getStats() {
    const totalOrders = await prisma.order.count();
    const sumResult = await prisma.order.aggregate({
      _sum: {
        amount: true,
      },
    });

    return {
      totalOrders,
      totalRevenue: sumResult._sum.amount || 0,
    };
  },

  async importOrdersFromParsedRows(rows: any[]) {
    const results = {
      successCount: 0,
      skippedCount: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const amountRaw = row.amount || row.Amount || row.order_amount || row.price;
        const email = row.email || row.Email || row.customerEmail || row.customer_email;
        const customerIdRaw = row.customerId || row.CustomerId || row.customer_id;
        const orderDateRaw = row.createdAt || row.CreatedAt || row.order_date || row.date;
        const orderId = row.id || row.Id || row.orderId || row.order_id;

        // Skip rows without amount
        const amount = parseFloat(amountRaw);
        if (isNaN(amount)) {
          results.skippedCount++;
          results.errors.push(`Row ${i + 1}: Missing or invalid order amount (${amountRaw}).`);
          continue;
        }

        let customerId = "";

        // Resolve customer
        if (customerIdRaw) {
          // Verify if it is a valid customer in the db
          const existingCust = await prisma.customer.findUnique({
            where: { id: String(customerIdRaw) },
          });
          if (existingCust) {
            customerId = existingCust.id;
          }
        }

        // If not found by ID yet, use email
        if (!customerId && email) {
          const emailStr = String(email).toLowerCase().trim();
          let existingCust = await prisma.customer.findUnique({
            where: { email: emailStr },
          });

          // Elegant fallback: Create skeleton customer if they don't exist yet but contain a valid email
          if (!existingCust && emailStr.includes("@")) {
            existingCust = await prisma.customer.create({
              data: {
                name: emailStr.split("@")[0] || "Imported Customer",
                email: emailStr,
                totalSpend: 0.0,
              },
            });
          }

          if (existingCust) {
            customerId = existingCust.id;
          }
        }

        if (!customerId) {
          results.skippedCount++;
          results.errors.push(`Row ${i + 1}: Customer identifier not found in CRM (Need valid Customer Email or ID).`);
          continue;
        }

        const dateParsed = orderDateRaw ? new Date(orderDateRaw) : new Date();
        const finalDate = isNaN(dateParsed.getTime()) ? new Date() : dateParsed;

        // Create transaction to verify or upsert order safely
        await prisma.$transaction(async (tx) => {
          let orderExists = false;

          if (orderId) {
            const check = await tx.order.findUnique({
              where: { id: String(orderId) },
            });
            if (check) orderExists = true;
          }

          if (orderExists && orderId) {
            // Already imported, we update the amount to ensure idempotence
            const oldOrder = await tx.order.findUnique({
              where: { id: String(orderId) },
            });
            const difference = amount - (oldOrder?.amount || 0);

            await tx.order.update({
              where: { id: String(orderId) },
              data: {
                amount,
                createdAt: finalDate,
              },
            });

            // Adjust customer totalSpend
            if (difference !== 0) {
              const customer = await tx.customer.findUnique({
                where: { id: customerId },
              });
              if (customer) {
                await tx.customer.update({
                  where: { id: customerId },
                  data: {
                    totalSpend: (customer.totalSpend || 0) + difference,
                  },
                });
              }
            }
          } else {
            // Generate a secure creation
            await tx.order.create({
              data: {
                id: orderId ? String(orderId) : undefined,
                customerId,
                amount,
                createdAt: finalDate,
              },
            });

            // Increment customer stats
            const customer = await tx.customer.findUnique({
              where: { id: customerId },
            });
            if (customer) {
              const newTotal = (customer.totalSpend || 0) + amount;
              const currentLastOrder = customer.lastOrderDate;
              const newLastOrderDate =
                !currentLastOrder || finalDate > currentLastOrder ? finalDate : currentLastOrder;

              await tx.customer.update({
                where: { id: customerId },
                data: {
                  totalSpend: newTotal,
                  lastOrderDate: newLastOrderDate,
                },
              });
            }
          }
        });

        results.successCount++;
      } catch (err: any) {
        results.skippedCount++;
        results.errors.push(`Row ${i + 1}: ${err.message || "Failed to commit order."}`);
      }
    }

    return results;
  },

  async deleteOrder(id: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
      });

      if (order) {
        await tx.order.delete({
          where: { id },
        });

        // Recalculate customer totalSpend and lastOrderDate
        const customer = await tx.customer.findUnique({
          where: { id: order.customerId },
          include: { orders: true },
        });

        if (customer) {
          const newTotalSpend = customer.orders.reduce((sum, o) => sum + o.amount, 0);
          const hasOrders = customer.orders.length > 0;
          const newLastOrderDate = hasOrders
            ? new Date(Math.max(...customer.orders.map((o) => new Date(o.createdAt).getTime())))
            : null;

          await tx.customer.update({
            where: { id: customer.id },
            data: {
              totalSpend: newTotalSpend,
              lastOrderDate: newLastOrderDate,
            },
          });
        }
      }
    });
  },
};
