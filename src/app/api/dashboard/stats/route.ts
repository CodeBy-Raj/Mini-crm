import { NextResponse } from "next/server";
import { CustomerService } from "@/services/customer.service";
import { OrderService } from "@/services/order.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customerStats = await CustomerService.getStats();
    const orderStats = await OrderService.getStats();

    // Query recent listings to enrich the dashboard visual interface
    const customers = await CustomerService.getAllCustomers();
    const orders = await OrderService.getAllOrders();

    return NextResponse.json({
      success: true,
      stats: {
        totalCustomers: customerStats.totalCustomers,
        totalOrders: orderStats.totalOrders,
        totalRevenue: orderStats.totalRevenue,
        calculatedSpend: customerStats.totalSpend,
      },
      customers,
      orders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to retrieve statistics." },
      { status: 500 }
    );
  }
}
