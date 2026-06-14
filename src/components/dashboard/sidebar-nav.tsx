"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  Sparkles, 
  Play, 
  TrendingUp, 
  GraduationCap, 
  Activity, 
  Flame,
  Menu,
  X,
  MapPin,
  Compass
} from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Grouped by the Marketing Campaign Story workflow
  const mainFlowItems = [
    {
      name: "Customers & Orders",
      href: "/customers-orders",
      step: "01",
      icon: <Users size={16} />,
      badge: "Ingestion",
      color: "text-blue-400 group-hover:text-blue-300",
      activeColor: "bg-blue-500/10 border-blue-500/20 text-blue-300",
    },
    {
      name: "Audience Segments",
      href: "/audience-segments",
      step: "02",
      icon: <Layers size={16} />,
      badge: "Discovery",
      color: "text-amber-400 group-hover:text-amber-300",
      activeColor: "bg-amber-500/10 border-amber-500/20 text-amber-300",
    },
    {
      name: "Campaign Engine",
      href: "/campaign-engine",
      step: "03",
      icon: <Sparkles size={16} />,
      badge: "AI STRATEGIST",
      isHero: true,
      color: "text-indigo-400 group-hover:text-indigo-300 animate-pulse",
      activeColor: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]",
    },
    {
      name: "Campaign Execution",
      href: "/campaign-execution",
      step: "04",
      icon: <Play size={16} />,
      badge: "Dispatch Live",
      color: "text-rose-400 group-hover:text-rose-300",
      activeColor: "bg-rose-500/10 border-rose-500/20 text-rose-300",
    },
    {
      name: "Analytics",
      href: "/analytics",
      step: "05",
      icon: <TrendingUp size={16} />,
      badge: "Performance",
      color: "text-emerald-400 group-hover:text-emerald-300",
      activeColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
    }
  ];

  const generalItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={16} />,
      desc: "Overview of customers, orders, campaigns and revenue."
    },
    {
      name: "Quick Start Guide",
      href: "/demo-flow",
      icon: <GraduationCap size={16} />,
      desc: "Follow these steps to explore the CRM workflow.",
      highlight: true
    }
  ];

  const renderNavGroup = (items: typeof mainFlowItems, isWorkflow = false) => {
    return (
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`group flex items-center justify-between px-3.5 py-3 rounded-xl border transition-all text-xs font-mono font-medium relative ${
                isActive
                  ? item.activeColor + " border-solid shadow-sm"
                  : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              }`}
            >
              {isActive && (
                <span className={`absolute left-0 top-1/4 bottom-1/4 w-1 bg-current rounded-r-md ${
                  item.href === "/campaign-engine" ? "text-indigo-500" :
                  item.href === "/customers-orders" ? "text-blue-500" :
                  item.href === "/audience-segments" ? "text-amber-500" :
                  item.href === "/campaign-execution" ? "text-rose-500" : "text-emerald-500"
                }`} />
              )}
              
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "" : "text-zinc-500"} ${item.color}`}>
                  {item.icon}
                </span>
                <span className="truncate leading-none">
                  {item.name}
                </span>
              </div>

              {isWorkflow ? (
                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  {"step" in item && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-zinc-350">
                      #{item.step}
                    </span>
                  )}
                </div>
              ) : (
                "badge" in item && (
                  <span className="text-[8px] uppercase tracking-wider text-zinc-600 group-hover:text-zinc-450 font-bold">
                    {item.badge}
                  </span>
                )
              )}
            </Link>
          );
        })}
      </div>
    );
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#09090b] text-zinc-100 font-sans border-r border-zinc-800/80 p-4 relative z-20">
      {/* Glow Effect */}
      <div className="absolute top-[10%] left-[-20%] w-[120%] h-[150px] bg-indigo-500/5 rounded-full blur-[50px] pointer-events-none" />

      {/* Brand Header */}
      <div className="flex items-center gap-3 pb-5 mb-5 border-b border-zinc-800/60 mt-2 shrink-0">
        
        <div>
          <h2 className="text-sm font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            AI-Native Mini CRM
          </h2>
          
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1">
        {/* Navigation Categories */}
        <div className="space-y-2">
          <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest pl-1.5 flex items-center gap-1">
            <Compass size={11} className="text-zinc-550" />
            General
          </p>
          <div className="space-y-1">
            {generalItems.map((item) => {
              const isActive = pathname === item.href;
              const isHighlight = item.highlight;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex flex-col px-3.5 py-3 rounded-xl border transition-all text-xs font-mono font-medium relative ${
                    isActive
                      ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
                      : isHighlight
                      ? "bg-emerald-950/20 border-emerald-900/20 text-emerald-400 hover:bg-emerald-950/30"
                      : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`shrink-0 ${isActive ? "text-indigo-400" : isHighlight ? "text-emerald-400 animate-pulse" : "text-zinc-500 group-hover:text-zinc-350"}`}>
                      {item.icon}
                    </span>
                    <span className="truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[9px] text-zinc-500 group-hover:text-zinc-400 pl-6.5 mt-0.5 leading-none transition-colors">
                    {item.desc}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* The Marketing Story Workflow Pipeline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pl-1.5">
            <p className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-widest flex items-center gap-1">
              <Flame size={11} className="text-amber-500 animate-pulse" />
              Workflow
            </p>
          </div>

          {/* Workflow list container */}
          <div className="relative space-y-1 pl-1">
            {renderNavGroup(mainFlowItems, true)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navbar Header spacer */}
      <header className="lg:hidden h-14 bg-[#09090b] border-b border-zinc-800/80 flex items-center justify-between px-4 sticky top-0 z-40 w-full">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center font-bold italic text-xs text-white">
            XC
          </div>
          <span className="text-xs font-mono font-bold text-zinc-100">Xeno Campaign CRM</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white"
        >
          {isOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </header>

      {/* Mobile Sidebar Overlay Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <nav className="w-72 max-w-[80vw] h-full relative z-50">
            {renderSidebarContent()}
          </nav>
        </div>
      )}

      {/* Dedicated Desktop Sidebar */}
      <nav className="hidden lg:block w-64 xl:w-72 h-screen fixed left-0 top-0 bottom-0 z-30 shrink-0">
        {renderSidebarContent()}
      </nav>
    </>
  );
}
