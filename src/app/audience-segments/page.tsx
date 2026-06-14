"use client";

import React, { useState } from "react";
import { AudienceBuilder } from "@/components/dashboard/audience-builder";
import { Sparkles, Layers, BookOpen, HelpCircle, ArrowRight, CheckCircle2, History } from "lucide-react";

export default function AudienceSegmentsPage() {
  const [logs, setLogs] = useState<string[]>([
    "✓ Audience Discovery workspace initiated.",
    "✓ Segment engine ready."
  ]);

  const handleLogMessage = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  // Pre-packaged Saved Segments targeting logic requested by the user
  const savedSegments = [
    {
      name: "Inactive Customers",
      promptText: "Users inactive for 90 days",
      logic: "Last Purchase > 90 days",
      audienceEst: "148 shoppers",
      status: "Calculated",
      variant: "orange",
    },
    {
      name: "High Value Spenders",
      promptText: "High value customers with over 1000 spend",
      logic: "Total Invoice Amount > $1,000",
      audienceEst: "42 shoppers",
      status: "Active",
      variant: "amber",
    },
    {
      name: "Recent Loyal Customers",
      promptText: "Recent buyers who spent at least 200 within 30 days",
      logic: "Spend >= $200 and Last Purchase <= 30 days",
      audienceEst: "85 shoppers",
      status: "Ready",
      variant: "emerald",
    }
  ];

  const [lastSelectedPrompt, setLastSelectedPrompt] = useState("");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-800/60 w-full animate-fade-in">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Audience Discovery
            </h1>
            <span className="text-[9px] bg-amber-950 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded-full font-mono font-medium">
              Segment Shoppers
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">Create customer groups using simple English.</p>
        </div>
      </header>

      {/* Campaign Story Introduction Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {savedSegments.map((segment, index) => (
          <div 
            key={index}
            className="bg-zinc-950/45 border border-zinc-900 hover:border-zinc-800 p-4 rounded-2xl flex flex-col justify-between transition-colors relative overflow-hidden group"
          >
            <div className="absolute right-4 top-4 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform">
              <Layers size={70} />
            </div>

            <div>
              <div className="flex justify-between items-start gap-1 pb-1.5 border-b border-zinc-900 mb-3">
                <span className="text-xs font-bold text-zinc-200 font-sans">{segment.name}</span>
                <span className={`text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                  segment.variant === "orange" ? "bg-orange-950/20 text-orange-400 border-orange-950/30" :
                  segment.variant === "amber" ? "bg-amber-950/20 text-amber-450 text-amber-300 border-amber-900/30" :
                  "bg-emerald-950/20 text-emerald-400 border-emerald-900/30"
                }`}>
                  {segment.status}
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-[10.5px]">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Targeting Logic:</span>
                </div>
                <p className="text-zinc-3 font-semibold text-zinc-300 leading-normal">{segment.logic}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-900 flex justify-between items-center text-[11px] font-mono">
              <div>
                <span className="text-zinc-500 font-medium">Size: </span>
                <span className="text-zinc-200 font-bold">{segment.audienceEst}</span>
              </div>

              <button
                onClick={() => {
                  setLastSelectedPrompt(segment.promptText);
                  handleLogMessage(`- Fast-tracked criteria from preset "${segment.name}": "${segment.promptText}"`);
                }}
                className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 hover:underline cursor-pointer font-bold uppercase tracking-wider"
              >
                <span>Discover</span>
                <ArrowRight size={10} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Main Builder workspace */}
      <div className="bg-zinc-950/10 border border-zinc-900/80 p-1 rounded-2xl">
        <AudienceBuilder onLogMessage={handleLogMessage} key={lastSelectedPrompt} />
      </div>

      {/* Audit Pipeline Logs Console */}
      <div className="bg-zinc-900/30 border border-zinc-805/85 rounded-2xl p-5 hover:border-zinc-700/60 transition-all duration-300 font-mono text-xs">
        <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
          <History size={13} className="text-zinc-550" />
          Segment Creation Log
        </h3>
        <p className="text-[10.5px] text-zinc-500 font-mono mb-3">Shows how the audience was generated.</p>
        <div className="bg-black/60 border border-zinc-950 p-4 rounded-xl leading-relaxed text-zinc-300 space-y-1.5 max-h-[120px] overflow-y-auto font-mono scrollbar-thin">
          {logs.map((log, id) => (
            <p key={id} className={log.startsWith("✓") ? "text-green-400" : log.startsWith("❌") ? "text-red-400" : "text-zinc-400"}>
              {log}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
