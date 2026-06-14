"use client";

import React, { useState, useEffect } from "react";
import { CsvUploadSection } from "@/components/dashboard/csv-upload-section";
import { DashboardContentTabs } from "@/components/dashboard/dashboard-content-tabs";
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

export function CustomersOrdersContent() {
  const router = useRouter();

  // Active sync states
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    calculatedSpend: 0,
  });
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Real-time logs state kept for tracking uploads
  const [logs, setLogs] = useState<string[]>([
    "✓ CRM Foundation module activated."
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
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    syncLatestDatabaseState();
  }, []);

  // Fetch when logs state changes (e.g., upload completes)
  useEffect(() => {
    if (logs.length > 1) {
      syncLatestDatabaseState();
    }
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
          onClick={() => {
            setLoading(true);
            syncLatestDatabaseState();
          }}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-805 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-mono transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          <span>{loading ? "Syncing..." : "Refresh Lists"}</span>
        </button>
      </header>

      {loading ? (
        <>
          {/* Skeleton Database Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-5 animate-pulse h-28 flex flex-col justify-between">
                <div className="h-4 bg-zinc-800/50 rounded w-1/2" />
                <div className="h-6 bg-zinc-850 rounded w-1/3" />
                <div className="h-3 bg-zinc-800/30 rounded w-3/4" />
              </div>
            ))}
          </div>

          {/* Skeleton Tables */}
          <div className="bg-zinc-900/10 border border-zinc-800/30 rounded-2xl p-6 animate-pulse">
            <div className="flex gap-4 border-b border-zinc-800/40 pb-4 mb-4">
              <div className="h-8 bg-zinc-850 rounded w-24" />
              <div className="h-8 bg-zinc-850 rounded w-24" />
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
        </>
      )}
    </div>
  );
}
