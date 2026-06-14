"use client";

import React from "react";
import { CampaignBuilder } from "@/components/dashboard/campaign-builder";
import { PlayCircle, ShieldCheck } from "lucide-react";

export default function CampaignExecutionPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dynamic page header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-805/80 w-full">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Campaign Delivery
            </h1>
            <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-900/60 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <PlayCircle size={10} className="text-rose-400" />
              Campaign Delivery
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">Launch campaigns and track message delivery.</p>
        </div>
      </header>

      {/* Host Integration Notice Banner */}
      <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl flex items-center gap-3 font-mono text-[11px] text-zinc-400">
        <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
        <p className="leading-normal">
          <strong>Delivery Status:</strong> Active polling channel connected. Simulated progress updates are pushed dynamically to track live webhook callback delivery events below.
        </p>
      </div>

      {/* Core Campaign Builder Execution Views */}
      <div className="bg-zinc-950/10 border border-[#0d0d10] p-1 rounded-2xl">
        <CampaignBuilder viewMode="execution" />
      </div>
    </div>
  );
}
