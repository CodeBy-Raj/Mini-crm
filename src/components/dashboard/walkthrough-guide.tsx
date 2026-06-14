"use client";

import React, { useState } from "react";
import { 
  Database, 
  Sparkles, 
  Send, 
  RefreshCw, 
  Play, 
  ChevronRight, 
  Info,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface Step {
  id: number;
  title: string;
  badge: string;
  description: string;
  actionHint: string;
  color: string;
  icon: React.ReactNode;
}

export function WalkthroughGuide() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps: Step[] = [
    {
      id: 1,
      title: "Seed Database",
      badge: "DATASET",
      color: "from-blue-500 to-cyan-500",
      icon: <Database size={14} />,
      description: "Initialize PostgreSQL with 1,000 customers and 3,000 distributed orders in 2 seconds to simulate a live corporate CRM.",
      actionHint: "Go to Import Data → Click 'Load Demo Dataset' to populate DBMS tables instantaneously."
    },
    {
      id: 2,
      title: "Build Segment",
      badge: "SEGMENT",
      color: "from-amber-500 to-orange-500",
      icon: <Sparkles size={14} />,
      description: "Ask Gemini to build high-performance Prisma SQL queries using standard English questions.",
      actionHint: "Go to Audience Discovery → Click suggestion 'High value customers over 1000 spend' → Press Compile."
    },
    {
      id: 3,
      title: "Generate Campaign",
      badge: "CREATIVE",
      color: "from-indigo-500 to-violet-500",
      icon: <Sparkles size={14} />,
      description: "Give a campaign goal (inactive winback, repeat upsell) for Gemini to choose the channel and write optimized copy.",
      actionHint: "Go to AI Campaign Builder → Enter 'Reward loyal customers' → Click Generate Strategic Proposal."
    },
    {
      id: 4,
      title: "Launch Sequence",
      badge: "BULK FORCE",
      color: "from-rose-500 to-pink-500",
      icon: <Send size={14} />,
      description: "Launch campaign with natural language target criteria. Creates bulk matching communications inside transactions.",
      actionHint: "Provide target criteria (e.g., 'spent over 1000') → Click 'Launch Campaign' to execute transacted DBMS commits."
    },
    {
      id: 5,
      title: "Delivery Simulation",
      badge: "WEBHOOK",
      color: "from-yellow-500 to-amber-600",
      icon: <Clock size={14} />,
      description: "Simulated communications Express queue receives requests, delays for 2s latency, then posts results via delivery webhook.",
      actionHint: "The dispatch initiates automatically in the background on launch. Real webhook payloads post back with live statuses."
    },
    {
      id: 6,
      title: "Live metrics HUD",
      badge: "ANALYTICS",
      color: "from-emerald-500 to-green-600",
      icon: <RefreshCw size={14} />,
      description: "A secure live webhook poller updates total counts in near real-time, detailing delivered successes vs carrier failed bounces.",
      actionHint: "Monitor 'Delivery Summary' progress bar and live delivery rate percentages."
    },
    {
      id: 7,
      title: "AI Optimization",
      badge: "AGENTS",
      color: "from-teal-500 to-blue-600",
      icon: <Sparkles size={14} />,
      description: "Gemini agent evaluates the delivery failure telemetry, computes statistical correlations, and recommends retry actions.",
      actionHint: "Click the Campaign Recommendations action button to initiate automated correction sequences."
    }
  ];

  return (
    <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-705 transition-all duration-300 w-full relative">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest font-mono">
            Interactive Walkthrough Roadmap & DEMO Guide
          </h3>
        </div>
        <span className="text-[10px] bg-blue-950 font-bold border border-blue-900/60 text-blue-400 px-2 py-0.5 rounded-full font-mono">
          PHASE 10 END-TO-END DEMO
        </span>
      </div>

      {/* Progress Circles Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-7 gap-3 mb-5">
        {steps.map((s) => {
          const isActive = activeStep === s.id;
          const isPast = s.id < activeStep;
          return (
            <button
              onClick={() => setActiveStep(s.id)}
              key={s.id}
              className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between min-h-[68px] cursor-pointer ${
                isActive 
                  ? "bg-zinc-900/90 border-zinc-700 ring-1 ring-blue-500/25 " 
                  : "bg-zinc-950/40 border-zinc-900 hover:border-zinc-800"
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  isActive ? "bg-gradient-to-r " + s.color + " text-white" : "bg-zinc-800 text-zinc-400"
                }`}>
                  {s.id}
                </span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">
                  {s.badge.split(" ")[0]}
                </span>
              </div>
              <p className={`text-[10px] font-mono font-bold mt-1.5 ${
                isActive ? "text-zinc-100" : "text-zinc-400"
              }`}>
                {s.title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Step Deck */}
      {steps.map((s) => {
        if (s.id !== activeStep) return null;
        return (
          <div key={s.id} className="bg-black/40 border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider font-mono bg-gradient-to-r ${s.color}`}>
                  Step {s.id}: {s.badge}
                </span>
                <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5 font-sans">
                  {s.icon}
                  {s.title}
                </h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {s.description}
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 px-4 py-3 rounded-xl md:w-[320px] shrink-0 space-y-1">
              <span className="text-[9px] uppercase font-bold text-blue-400 tracking-widest font-mono flex items-center gap-1">
                <Info size={10} />
                Live Demo playbook action:
              </span>
              <p className="text-[10px] text-zinc-400 font-mono leading-relaxed italic">
                &quot;{s.actionHint}&quot;
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
