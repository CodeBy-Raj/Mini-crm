"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Database, 
  Sparkles, 
  Send, 
  Radio, 
  TrendingUp, 
  Compass, 
  Info,
  ArrowRight,
  BookmarkCheck,
  ChevronRight,
  Cpu,
  Tv
} from "lucide-react";

interface Step {
  id: number;
  title: string;
  badge: string;
  color: string;
  icon: React.ReactNode;
  description: string;
  actionHint: string;
  targetHref: string;
  ctaText: string;
}

export default function DemoFlowPage() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps: Step[] = [
    {
      id: 1,
      title: "Load Demo Dataset",
      badge: "IMPORT DATA",
      color: "border-blue-500 text-blue-400 bg-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
      icon: <Database size={15} />,
      description: "Initialize PostgreSQL with 1,000 customers and 3,000 distributed orders in 2 seconds to simulate a live enterprise CRM workload.",
      actionHint: "Go to Import Data workspace. Click 'Load Demo Dataset' to populate DBMS tables instantaneously.",
      targetHref: "/customers-orders",
      ctaText: "Go to Customers & Orders"
    },
    {
      id: 2,
      title: "Create Audience",
      badge: "AUDIENCE DISCOVERY",
      color: "border-amber-500 text-amber-400 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
      icon: <Sparkles size={15} />,
      description: "Ask Gemini to perform Audience Discovery and build precise target queries using standard English questions.",
      actionHint: "Go to Audience segments workspace. Choose suggested filters (e.g. Ininactive Customers), then press Compile Segment.",
      targetHref: "/audience-segments",
      ctaText: "Go to Audience Discovery"
    },
    {
      id: 3,
      title: "Generate Campaign",
      badge: "AI STRATEGIST",
      color: "border-indigo-505 text-indigo-400 bg-indigo-950/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]",
      icon: <Cpu size={15} />,
      description: "Define a campaign objective (e.g. reward loyal customers) for the Gemini engine to choose the best channel model and write copy automatically.",
      actionHint: "Go to Campaign Builder. Enter or click suggested golden statement scenario, then click Formulate Campaign Strategy.",
      targetHref: "/campaign-engine",
      ctaText: "Go to Campaign Builder"
    },
    {
      id: 4,
      title: "Launch Campaign",
      badge: "TRANSACT ROUTER",
      color: "border-rose-500 text-rose-400 bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]",
      icon: <Send size={15} />,
      description: "Launch campaign with natural language target criteria. Creates bulk matching communications inside atomic SQL transaction commits.",
      actionHint: "Click Send on any Saved Draft, define target criteria context, and click 'Launch Campaign' to trigger dispatching.",
      targetHref: "/campaign-execution",
      ctaText: "Go to Campaign Delivery"
    },
    {
      id: 5,
      title: "Watch Delivery",
      badge: "QUEUE DISPATCH",
      color: "border-pink-500 text-pink-400 bg-pink-950/20 shadow-[0_0_15px_rgba(236,72,153,0.1)]",
      icon: <Radio size={15} className="animate-pulse" />,
      description: "Monitor progressive delivery pipeline. An Express background queue receives records, simulates carrier latency, and updates live statuses via webhooks.",
      actionHint: "The dispatch initiates automatically on launch. Watch progressive progress bars and immediate webhook audit trails.",
      targetHref: "/campaign-execution",
      ctaText: "Watch Campaign Delivery Status"
    },
    {
      id: 6,
      title: "View Analytics",
      badge: "RESULTS INDEX",
      color: "border-emerald-500 text-emerald-400 bg-emerald-950/25 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
      icon: <TrendingUp size={15} />,
      description: "Inspect Campaign Analytics to evaluate delivery rate handshakes, estimated opens, click actions, and transacted gross revenue.",
      actionHint: "Open Campaign Analytics to evaluate real time engagement funnel metrics.",
      targetHref: "/analytics",
      ctaText: "Go to Campaign Analytics"
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Brand Walkthrough Banner */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-805/85 w-full">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Quick Start Guide
            </h1>
            <span className="text-[9px] bg-indigo-950 text-indigo-305 text-indigo-400 border border-indigo-900/60 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider animate-pulse">
              Interactive Guide
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">Follow these steps to explore the CRM workflow.</p>
        </div>
      </header>

      {/* Intro Context Card */}
      <div className="bg-gradient-to-br from-zinc-900/40 to-zinc-950 border border-zinc-850 p-6 rounded-2xl relative overflow-hidden group">
        <div className="absolute right-6 top-6 opacity-[0.02] text-indigo-400 pointer-events-none">
          <BookmarkCheck size={110} />
        </div>

        <div>
          <span className="text-[9px] bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-lg text-emerald-400 font-mono font-bold uppercase tracking-widest inline-flex items-center gap-1.5 mb-3 animate-pulse">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            30-Second Evaluator Quickstart
          </span>
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 mb-2 leading-relaxed">
            Welcome, Evaluator!
          </h2>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-3xl">
            This module coordinates the entire CRM workflow in 6 sequential steps. Click the step badges below to outline the feature capabilities, then click the dynamic CTA buttons to instantly jump into the corresponding live workspace!
          </p>
        </div>
      </div>

      {/* Grid of 6 Steps */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {steps.map((s) => {
          const isActive = activeStep === s.id;
          return (
            <button
              onClick={() => setActiveStep(s.id)}
              key={s.id}
              className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between min-h-[95px] relative group cursor-pointer ${
                isActive 
                  ? s.color + " border-solid ring-1 ring-white/10" 
                  : "bg-zinc-950/40 border-zinc-900 hover:border-zinc-800"
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  isActive ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-zinc-500 group-hover:text-zinc-400"
                }`}>
                  {s.id}
                </span>
                <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-zinc-500">
                  {s.badge}
                </span>
              </div>
              
              <p className={`text-xs font-bold mt-3 ${
                isActive ? "text-zinc-50" : "text-zinc-400 group-hover:text-zinc-300"
              }`}>
                {s.title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Focus Step Deck Card */}
      {steps.map((s) => {
        if (s.id !== activeStep) return null;
        return (
          <div 
            key={s.id} 
            className="border border-zinc-850 bg-zinc-950/40 p-5 sm:p-6 rounded-2xl flex flex-col gap-5 animate-fade-in"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-90 w-full border-zinc-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 font-bold shadow-inner">
                  {s.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                      Step {s.id} of 6
                    </span>
                    <span className="text-[8.5px] uppercase font-bold tracking-widest bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-800">
                      {s.badge}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-zinc-100 mt-0.5">
                    {s.title}
                  </h4>
                </div>
              </div>

              {/* Directly Link CTA button */}
              <Link
                href={s.targetHref}
                className="px-4 py-2 bg-[#6366f1] hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold hover:shadow-lg hover:shadow-indigo-500/10 transition-all flex items-center gap-1 w-full sm:w-auto text-center justify-center"
              >
                <span>{s.ctaText}</span>
                <ArrowRight size={11} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 leading-normal">
              {/* Feature capability description */}
              <div className="space-y-1.5 text-xs text-zinc-400">
                <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-zinc-550 text-zinc-500 flex items-center gap-1">
                  <Tv size={10} />
                  Operational Capability
                </span>
                <p className="leading-relaxed bg-zinc-950/20 p-4 border border-zinc-900 rounded-xl">
                  {s.description}
                </p>
              </div>

              {/* Interactive playbook instructions */}
              <div className="space-y-1.5 text-xs text-zinc-400">
                <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-indigo-400 flex items-center gap-1">
                  <Info size={10} />
                  Interactive Guide Instructions
                </span>
                <div className="bg-gradient-to-br from-indigo-950/10 to-indigo-950/20 p-4 border border-indigo-900/30 rounded-xl space-y-1">
                  <p className="text-zinc-350 leading-relaxed italic">
                    &quot;{s.actionHint}&quot;
                  </p>
                  <p className="text-[9px] text-zinc-500 uppercase font-mono pt-2 border-t border-indigo-950 mt-2 font-bold">
                    Goal outcome: Verify system integration speeds & feedback telemetry loops
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Progress navigation controller bar */}
      <footer className="flex justify-between items-center text-xs font-mono text-zinc-500 border-t border-zinc-900 pt-4">
        <button
          disabled={activeStep === 1}
          onClick={() => setActiveStep(prev => prev - 1)}
          className={`px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-805 rounded-xl transition-colors cursor-pointer text-[10px] uppercase font-bold text-zinc-350 flex items-center gap-1 ${
            activeStep === 1 ? "opacity-30 cursor-not-allowed" : ""
          }`}
        >
          <span>Previous Step</span>
        </button>

        <span className="text-[10px] font-mono">Step {activeStep} / 6</span>

        <button
          disabled={activeStep === 6}
          onClick={() => setActiveStep(prev => prev + 1)}
          className={`px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-805 rounded-xl transition-colors cursor-pointer text-[10px] uppercase font-bold text-zinc-350 flex items-center gap-1 ${
            activeStep === 6 ? "opacity-30 cursor-not-allowed" : ""
          }`}
        >
          <span>Next Step</span>
          <ChevronRight size={10} />
        </button>
      </footer>
    </div>
  );
}
