import React from "react";
import { DashboardService } from "@/services/dashboard.service";
import { CustomerService } from "@/services/customer.service";
import { OrderService } from "@/services/order.service";
import { CustomersOrdersContent } from "./customers-orders-content";

export const dynamic = "force-dynamic";

export default async function CustomersOrdersPage() {
  // Fetch initial stats and list on the server
  const data = await DashboardService.getDashboardData();
  const customerStats = await CustomerService.getStats();
  const orderStats = await OrderService.getStats();

  const allCustomers = await CustomerService.getAllCustomers();
  const allOrders = await OrderService.getAllOrders();

  return (
    <CustomersOrdersContent 
      initialStats={{
        totalCustomers: customerStats.totalCustomers,
        totalOrders: orderStats.totalOrders,
        totalRevenue: orderStats.totalRevenue,
        calculatedSpend: customerStats.totalSpend,
      }}
      initialCustomers={allCustomers}
      initialOrders={allOrders}
    />
  );
}
