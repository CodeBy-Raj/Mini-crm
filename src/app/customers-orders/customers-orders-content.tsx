"use client";

import React, { useState, useEffect } from "react";
import { CsvUploadSection } from "@/components/dashboard/csv-upload-section";
import { DashboardContentTabs } from "@/components/dashboard/dashboard-content-tabs";
import { StatsCard } from "@/components/dashboard/stats-card";
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  RefreshCw
} from "lucide-react";
import { useCrmData } from "@/components/crm-data-provider";

export function CustomersOrdersContent() {
  const { loading, stats, recentCustomers, recentOrders, refreshData } = useCrmData();
  
  // Real-time logs state kept for tracking uploads
  const [logs, setLogs] = useState<string[]>([
    "✓ CRM Foundation module activated."
  ]);

  const addLogMessage = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  // Fetch when logs state changes (e.g., upload completes)
  useEffect(() => {
    if (logs.length > 1) {
      refreshData(false);
    }
  }, [logs, refreshData]);

  const totalCustomers = stats?.totalCustomers || 0;
  const totalOrders = stats?.totalOrders || 0;
  const totalRevenue = stats?.totalRevenue || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-800/60 w-full animate-fade-in font-sans">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Customers & Orders
            </h1>
            
          </div>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">Upload and manage customer and order data.</p>
        </div>

        {!loading && (
          <button 
            onClick={() => refreshData(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-805 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-mono transition-colors cursor-pointer select-none"
          >
            <RefreshCw size={11} />
            <span>Refresh Lists</span>
          </button>
        )}
      </header>

      {loading ? (
        <>
          {/* Skeleton Database Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-5 animate-pulse h-28 flex flex-col justify-between">
                <div className="h-4 bg-zinc-805 rounded w-1/2" />
                <div className="h-6 bg-zinc-855 rounded w-1/3" />
                <div className="h-3 bg-zinc-800/30 rounded w-3/4" />
              </div>
            ))}
          </div>

          {/* Skeleton Tables */}
          <div className="bg-zinc-900/10 border border-zinc-800/30 rounded-2xl p-6 animate-pulse">
            <div className="flex gap-4 border-b border-zinc-800/40 pb-4 mb-4">
              <div className="h-8 bg-zinc-855 rounded w-24" />
              <div className="h-8 bg-zinc-855 rounded w-24" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-10 bg-zinc-900/20 rounded w-full" />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Database Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono select-none">
            <StatsCard 
              title="Total Customers Indexed"
              value={totalCustomers}
              icon={<Users size={16} />}
              description="Total shopper records"
              variant="blue"
            />

            <StatsCard 
              title="Invoice Orders Logged"
              value={totalOrders}
              icon={<ShoppingBag size={16} />}
              description="Distributed sales count"
              variant="indigo"
            />

            <StatsCard 
              title="Dynamic Invoice Revenue"
              value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
                recentCustomers={recentCustomers} 
                recentOrders={recentOrders} 
              />
            </section>
          </div>
        </>
      )}
    </div>
  );
}
