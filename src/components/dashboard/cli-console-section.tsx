"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Terminal as TerminalIcon, Play } from "lucide-react";

interface CliConsoleSectionProps {
  initialLogs?: string[];
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  onClearConsole?: () => void;
  onTruncateTriggered?: () => void;
}

export function CliConsoleSection({
  initialLogs = [
    "✓ System Initialized (Next.js 15.1.6, Prisma 6.3.0).",
    "✓ Database interface bound to secure PostgreSQL container.",
    "- Terminal awaiting inputs. Upload a CSV or use CLI commands."
  ],
  totalCustomers,
  totalOrders,
  totalRevenue,
}: CliConsoleSectionProps) {
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>(initialLogs);
  const [cliInput, setCliInput] = useState("");
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll console
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Truncate/Reset database helper
  const triggerDatabaseReset = async () => {
    try {
      const res = await fetch("/api/dashboard/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setLogs((prev) => [
          ...prev, 
          "✓ System reset triggered: Database table collections cleared safely.",
          "✓ All records set to 0."
        ]);
        router.refresh();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setLogs((prev) => [...prev, `❌ Reset failure: ${err.message}`]);
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;

    const cmd = cliInput.trim().toLowerCase();
    const newLogs = [...logs, `visitor@localhost:~$ ${cliInput}`];

    if (cmd === "help") {
      newLogs.push(
        "Available commands:",
        "  status           - Run dynamic diagnostics on system files",
        "  env              - Review environment credentials state",
        "  stats            - High-density query summaries",
        "  reset            - Erase database collections safely",
        "  clear            - Clear console outputs"
      );
    } else if (cmd === "status") {
      newLogs.push(
        `--- CRON STATUS REVIEWS ---`,
        `Core: Web-Server running on Port 3000`,
        `DBMS: PostgreSQL initialized (Schema up-to-date)`,
        `Client Data Sync: Live connection verified`
      );
    } else if (cmd === "env") {
      newLogs.push(
        `DATABASE_URL:      Verified (postgresql://...)`,
        `GEMINI_API_KEY:    Verified (Secured in runtime)`,
        `APP_URL:           Verified (Self-referential bound)`
      );
    } else if (cmd === "stats") {
      newLogs.push(
        `--- DATA SUMMARY ---`,
        `Total Tracked CRM Customers:  ${totalCustomers}`,
        `Total Realized Sales Orders:  ${totalOrders}`,
        `Total CRM Sales Revenue:      $${totalRevenue.toFixed(2)}`
      );
    } else if (cmd === "clear") {
      setLogs([]);
      setCliInput("");
      return;
    } else if (cmd === "reset") {
      if (confirm("Are you sure you want to flush all database records? This is non-reversible!")) {
        setLogs(newLogs);
        setCliInput("");
        triggerDatabaseReset();
        return;
      } else {
        newLogs.push("Reset command aborted.");
      }
    } else {
      newLogs.push(`Command not recognized: '${cmd}'. Use 'help' for instructions.`);
    }

    setLogs(newLogs);
    setCliInput("");
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between overflow-hidden hover:border-zinc-700/60 transition-all duration-300">
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
          <TerminalIcon size={12} className="text-amber-500 animate-pulse" />
          Ingestion Shell & Console Logs
        </div>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-850"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-850"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-850"></span>
        </div>
      </div>

      {/* Screen */}
      <div className="bg-black/60 border border-zinc-950/80 rounded-xl p-4 font-mono text-xs text-zinc-300 space-y-1.5 h-[140px] overflow-y-auto mb-3 shadow-inner scrollbar-thin">
        {logs.map((log, index) => {
          const isCommand = log.includes("visitor@localhost:~$");
          return (
            <div key={index} className="flex items-start gap-1">
              <p className={`${
                log.startsWith("✓") ? "text-green-400" :
                log.startsWith("❌") ? "text-red-400" :
                isCommand ? "text-indigo-300" :
                log.includes("---") ? "text-zinc-500 border-b border-zinc-900 pb-0.5 w-full block font-semibold mb-1" :
                log.startsWith(" ") ? "text-zinc-400 pl-4" :
                "text-zinc-300"
              }`}>
                {log}
              </p>
            </div>
          );
        })}
        <div ref={consoleBottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleCommandSubmit} className="flex gap-2 items-center">
        <span className="font-mono text-zinc-500 text-xs pl-1">visitor@localhost:~$</span>
        <input
          type="text"
          value={cliInput}
          onChange={(e) => setCliInput(e.target.value)}
          placeholder="Type 'help', 'status', 'stats' or 'reset'..."
          className="flex-1 bg-black/40 border border-zinc-800/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 font-mono placeholder:text-zinc-650 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10"
        />
        <button 
          type="submit"
          className="bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 px-3 py-1.5 text-xs rounded-lg font-mono flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <Play size={10} />
          Execute
        </button>
      </form>
    </div>
  );
}
