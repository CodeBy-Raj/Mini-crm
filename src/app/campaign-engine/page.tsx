"use client";

import React from "react";
import { CampaignBuilder } from "@/components/dashboard/campaign-builder";
import { Sparkles, Brain } from "lucide-react";

export default function CampaignEnginePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dynamic strategic header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-805/80 w-full">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Campaign Builder
            </h1>
            <span className="text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-900/60 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
              <Brain size={10} className="text-indigo-400" />
              AI Powered
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">Generate campaign messages from business goals.</p>
        </div>
      </header>

      {/* Hero Flow Visualizer Timeline */}
      <div className="bg-zinc-950/45 border border-zinc-900 rounded-2xl p-5">
        <h3 className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-widest mb-3.5 flex items-center gap-1 text-center justify-center">
          <Sparkles size={11} className="text-indigo-500" />
          Campaign Workflow
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs font-mono">
          <div className="bg-zinc-900/40 p-2.5 border border-zinc-850 rounded-xl relative">
            <div className="text-[9px] text-[#6366f1] font-bold">STEP 01</div>
            <div className="text-zinc-200 font-medium mt-1">Campaign Goal</div>
          </div>
          <div className="flex items-center justify-center text-zinc-650 font-bold hidden sm:flex">➔</div>
          <div className="bg-zinc-900/40 p-2.5 border border-zinc-850 rounded-xl">
            <div className="text-[9px] text-[#6366f1] font-bold">STEP 02</div>
            <div className="text-zinc-200 font-medium mt-1">AI Reasoning</div>
          </div>
          <div className="flex items-center justify-center text-zinc-650 font-bold hidden sm:flex">➔</div>
          <div className="bg-gradient-to-r from-indigo-950/30 to-blue-950/30 p-2.5 border border-indigo-900/30 rounded-xl shadow-md">
            <div className="text-[9.5px] text-emerald-405 text-emerald-405 font-bold animate-pulse">STEP 03</div>
            <div className="text-zinc-150 font-bold mt-1">Ready to Launch</div>
          </div>
        </div>
      </div>

      {/* Core Campaign Engine Workspace */}
      <div className="bg-zinc-950/10 border border-zinc-900/80 p-1 rounded-2xl">
        <CampaignBuilder viewMode="engine" />
      </div>
    </div>
  );
}
