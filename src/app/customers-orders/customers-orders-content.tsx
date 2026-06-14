"use client";

import React, { useState, useEffect } from "react";
import { CsvUploadSection } from "@/components/dashboard/csv-upload-section";
import { DashboardContentTabs } from "@/components/dashboard/dashboard-content-tabs";
import { CliConsoleSection } from "@/components/dashboard/cli-console-section";
import { StatsCard } from "@/components/dashboard/stats-card";
import { 
  Database, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  RefreshCw,
  Info
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CustomersOrdersContentProps {
  initialStats: {
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
    calculatedSpend: number;
  };
  initialCustomers: any[];
  initialOrders: any[];
}

export function CustomersOrdersContent({
  initialStats,
  initialCustomers,
  initialOrders,
}: CustomersOrdersContentProps) {
  const router = useRouter();

  // Active sync lists
  const [stats, setStats] = useState(initialStats);
  const [customers, setCustomers] = useState(initialCustomers);
  const [orders, setOrders] = useState(initialOrders);
  
  // Real-time console logs
  const [logs, setLogs] = useState<string[]>([
    "✓ CRM Foundation module activated.",
    "✓ Database status: Connected.",
    "- Ready for imports. Upload customer & order CSV sheets, or trigger automated seeder."
  ]);

  const addLogMessage = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  // Sync state with back-end to refresh after action (like seed or reset) occurs
  const syncLatestDatabaseState = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.stats);
        setCustomers(data.customers || []);
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.warn("Transient sync state notice:", err);
    }
  };

  // Triggering sync upon state logs changes
  useEffect(() => {
    syncLatestDatabaseState();
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-800/60 w-full animate-fade-in">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Customers & Orders
            </h1>
            <span className="text-[9px] bg-blue-950 text-blue-400 border border-blue-900/60 px-2 py-0.5 rounded-full font-mono font-medium">
              Import Data
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">Upload and manage customer and order data.</p>
        </div>

        <button 
          onClick={syncLatestDatabaseState}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-805 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-mono transition-colors cursor-pointer"
        >
          <RefreshCw size={11} />
          <span>Refresh Lists</span>
        </button>
      </header>

      {/* Database Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard 
          title="Total Customers Indexed"
          value={stats.totalCustomers}
          icon={<Users size={16} />}
          description="Total shopper records"
          variant="blue"
        />

        <StatsCard 
          title="Invoice Orders Logged"
          value={stats.totalOrders}
          icon={<ShoppingBag size={16} />}
          description="Distributed sales count"
          variant="indigo"
        />

        <StatsCard 
          title="Dynamic Invoice Revenue"
          value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign size={16} className="text-emerald-400" />}
          description="Full invoices sum"
          variant="emerald"
        />
      </div>

      {/* Main CSV upload / seeder block */}
      <div className="grid grid-cols-1 gap-6">
        <section className="w-full">
          <CsvUploadSection onLogMessage={addLogMessage} />
        </section>
      </div>

      {/* Live Data Tables Inspector */}
      <div className="grid grid-cols-1 gap-6">
        <section className="w-full">
          <DashboardContentTabs 
            recentCustomers={customers} 
            recentOrders={orders} 
          />
        </section>
      </div>

      {/* Live shell logging terminal */}
      <div className="grid grid-cols-1 gap-6">
        <section className="w-full">
          <CliConsoleSection 
            initialLogs={logs}
            totalCustomers={stats.totalCustomers}
            totalOrders={stats.totalOrders}
            totalRevenue={stats.totalRevenue}
          />
        </section>
      </div>
    </div>
  );
}
