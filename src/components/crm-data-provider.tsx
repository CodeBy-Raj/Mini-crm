"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface CrmDataContextType {
  loading: boolean;
  stats: any;
  metrics: any;
  recentCustomers: any[];
  recentOrders: any[];
  lastUpdated: string | null;
  refreshData: (force?: boolean) => Promise<void>;
  notifyChange: () => Promise<void>;
}

const CrmDataContext = createContext<CrmDataContextType | undefined>(undefined);

export function CrmDataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchAllData = useCallback(async (showLoadingSpinner: boolean = false) => {
    if (showLoadingSpinner) {
      setLoading(true);
    }
    try {
      const [statsRes, metricsRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/campaign?type=metrics")
      ]);

      const [statsJson, metricsJson] = await Promise.all([
        statsRes.json(),
        metricsRes.json()
      ]);

      if (statsJson.success) {
        setStats(statsJson.stats);
        setRecentCustomers(statsJson.customers || []);
        setRecentOrders(statsJson.orders || []);
      }

      if (metricsJson.success) {
        setMetrics(metricsJson);
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Error in CrmDataProvider client-side sync:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount, perform initial fetch
  useEffect(() => {
    fetchAllData(true);
  }, [fetchAllData]);

  const refreshData = useCallback(async (force: boolean = false) => {
    await fetchAllData(force);
  }, [fetchAllData]);

  const notifyChange = useCallback(async () => {
    // Silently refresh in background when a change is made by the user
    await fetchAllData(false);
  }, [fetchAllData]);

  return (
    <CrmDataContext.Provider
      value={{
        loading,
        stats,
        metrics,
        recentCustomers,
        recentOrders,
        lastUpdated,
        refreshData,
        notifyChange,
      }}
    >
      {children}
    </CrmDataContext.Provider>
  );
}

export function useCrmData() {
  const context = useContext(CrmDataContext);
  if (context === undefined) {
    throw new Error("useCrmData must be used within a CrmDataProvider");
  }
  return context;
}
