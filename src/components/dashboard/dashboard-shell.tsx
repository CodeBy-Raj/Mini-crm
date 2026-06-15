"use client";

import React, { useState } from "react";
import { CsvUploadSection } from "./csv-upload-section";
import { CliConsoleSection } from "./cli-console-section";
import { DashboardContentTabs } from "./dashboard-content-tabs";
import { AudienceBuilder } from "./audience-builder";
import { CampaignBuilder } from "./campaign-builder";
import { Database, Sparkles, Activity, FileText } from "lucide-react";

interface DashboardShellProps {
  initialStats: {
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
    calculatedSpend: number;
  };
  recentCustomers: any[];
  recentOrders: any[];
}

export function DashboardShell({
  initialStats,
  recentCustomers,
  recentOrders,
}: DashboardShellProps) {
  const [viewMode, setViewMode] = useState<"builder" | "campaign" | "ingest">("campaign"); // Defaulting to campaign to highlight Phase 5!
  
  // We keep logs here at the shell level to share events between components
  const [logs, setLogs] = useState<string[]>([
    "✓ System Initialized (Next.js 15.1.6, Prisma 6.3.0).",
    "✓ Database interface bound to secure PostgreSQL container.",
    "- Terminal awaiting inputs. Upload a CSV or use CLI commands."
  ]);

  const addLogMessage = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Workspace Selector Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-800/80">
        <div className="flex items-center gap-2 pl-3 py-1.5">
          <Activity size={13} className="text-blue-500 animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
            Select Active Workspace
          </span>
        </div>

        <div className="flex bg-zinc-900 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setViewMode("campaign")}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewMode === "campaign" 
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/50" 
                : "text-zinc-500 hover:text-white"
            }`}
          >
            <FileText size={13} className={viewMode === "campaign" ? "text-indigo-400" : ""} />
            AI Campaign Builder
          </button>

          <button
            onClick={() => setViewMode("builder")}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewMode === "builder" 
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/50" 
                : "text-zinc-500 hover:text-white"
            }`}
          >
            <Sparkles size={13} className={viewMode === "builder" ? "text-amber-400" : ""} />
            AI Audience Segmenter
          </button>
          
          <button
            onClick={() => setViewMode("ingest")}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewMode === "ingest" 
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/50" 
                : "text-zinc-500 hover:text-white"
            }`}
          >
            <Database size={13} className={viewMode === "ingest" ? "text-blue-400" : ""} />
            Performance & CSV Ingest
          </button>
        </div>
      </div>

      {/* Render selected workspace */}
      {viewMode === "campaign" ? (
        <section className="w-full">
          <CampaignBuilder onLogMessage={addLogMessage} />
        </section>
      ) : viewMode === "builder" ? (
        <section className="w-full">
          <AudienceBuilder onLogMessage={addLogMessage} />
        </section>
      ) : (
        <div className="flex flex-col gap-6 w-full">
          {/* 1. CSV Upload Sections */}
          <section className="w-full">
            <CsvUploadSection onLogMessage={addLogMessage} />
          </section>

          {/* 2. Interactive Data Table Inspector */}
          <section className="w-full">
            <DashboardContentTabs 
              recentCustomers={recentCustomers} 
              recentOrders={recentOrders} 
            />
          </section>
        </div>
      )}

      {/* Persistent CLI Terminal Console Log - extremely convenient for general monitoring! */}
      <section className="w-full">
        <CliConsoleSection 
          initialLogs={logs}
          totalCustomers={initialStats.totalCustomers}
          totalOrders={initialStats.totalOrders}
          totalRevenue={initialStats.totalRevenue}
        />
      </section>
    </div>
  );
}
