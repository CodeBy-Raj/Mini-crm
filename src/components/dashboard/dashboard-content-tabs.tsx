"use client";

import React, { useState } from "react";
import { RecentCustomers } from "./recent-customers";
import { RecentOrders } from "./recent-orders";
import { Database } from "lucide-react";

interface DashboardContentTabsProps {
  recentCustomers: any[];
  recentOrders: any[];
}

export function DashboardContentTabs({ recentCustomers, recentOrders }: DashboardContentTabsProps) {
  const [activeTab, setActiveTab] = useState<"customers" | "orders">("customers");

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/85 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-350 col-span-12">
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800/80 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Database size={15} className="text-blue-500" />
            <h4 className="text-sm font-semibold text-zinc-100 font-mono">Customer Records</h4>
          </div>

          <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800/60">
            <button
              onClick={() => setActiveTab("customers")}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                activeTab === "customers" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-white"
              }`}
            >
              Recent Customers ({recentCustomers.length})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                activeTab === "orders" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-white"
              }`}
            >
              Recent Orders ({recentOrders.length})
            </button>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="min-h-[220px]">
          {activeTab === "customers" ? (
            <RecentCustomers customers={recentCustomers} />
          ) : (
            <RecentOrders orders={recentOrders} />
          )}
        </div>
      </div>
    </div>
  );
}
