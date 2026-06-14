import { CustomerService } from "./customer.service";
import { OrderService } from "./order.service";

export interface DashboardData {
  stats: {
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
    calculatedSpend: number;
  };
  recentCustomers: any[];
  recentOrders: any[];
}

export const DashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    const customerStats = await CustomerService.getStats();
    const orderStats = await OrderService.getStats();
    
    const customers = await CustomerService.getAllCustomers();
    const orders = await OrderService.getAllOrders();

    // Get 5 most recent customers
    const recentCustomers = customers.slice(0, 5);
    
    // Get 5 most recent orders
    const recentOrders = orders.slice(0, 5);

    return {
      stats: {
        totalCustomers: customerStats.totalCustomers,
        totalOrders: orderStats.totalOrders,
        totalRevenue: orderStats.totalRevenue,
        calculatedSpend: customerStats.totalSpend,
      },
      recentCustomers,
      recentOrders,
    };
  }
};
