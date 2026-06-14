"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Search, 
  Play, 
  HelpCircle, 
  Users, 
  CheckCircle2, 
  FileJson, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign,
  AlertCircle
} from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface SampleCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  totalSpend: number;
  lastOrderDate: Date | string | null;
  createdAt: Date | string;
}

interface FilterPayload {
  lastOrderBeforeDays?: number;
  lastOrderAfterDays?: number;
  minSpend?: number;
  maxSpend?: number;
  hasPhone?: boolean;
  nameContains?: string;
  emailDomain?: string;
}

interface BuildResult {
  filters: FilterPayload;
  explanation: string;
  size: number;
  samples: SampleCustomer[];
}

interface AudienceBuilderProps {
  onLogMessage?: (msg: string) => void;
}

export function AudienceBuilder({ onLogMessage }: AudienceBuilderProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BuildResult | null>(null);

  const samplePrompts = [
    { text: "Users inactive for 90 days", icon: "🕒" },
    { text: "High value customers with over 1000 spend", icon: "💎" },
    { text: "Gmail accounts with no phone number listed", icon: "📧" },
    { text: "Recent buyers who spent at least 200 within 30 days", icon: "🔥" },
  ];

  const handleSuggestClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const executeSegmentQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    if (onLogMessage) {
      onLogMessage(`- Submitting pipeline build prompt: "${prompt}"`);
    }

    try {
      const response = await fetch("/api/segmentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          filters: data.filters,
          explanation: data.explanation,
          size: data.size,
          samples: data.samples,
        });
        if (onLogMessage) {
          onLogMessage(`✓ Audience Built safely: found ${data.size} matched accounts.`);
        }
      } else {
        throw new Error(data.error || "Audience generation returned unexpected code.");
      }
    } catch (err: any) {
      setError(err.message || "Network exception building audience segment.");
      if (onLogMessage) {
        onLogMessage(`❌ AI Segment compilation error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateValue: Date | string | null) => {
    if (!dateValue) return "—";
    const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* Prompt Form Input Section */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700/60 transition-all duration-300">
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5 mb-3 font-mono">
            <Sparkles size={14} className="text-amber-400" />
            Segment Builder
          </h3>

          <p className="text-xs text-zinc-500 mb-4 font-mono leading-relaxed">
            Describe your audience in plain English. Example: Customers inactive for 90 days
          </p>

          <form onSubmit={executeSegmentQuery} className="space-y-4">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., High-value VIP spenders with more than 500 dollars who made a purchase recently within 10 days..."
                rows={4}
                className="w-full bg-black/40 border border-zinc-800/80 rounded-xl p-3.5 text-xs text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/10 resize-none leading-relaxed"
              />
              <Search size={14} className="absolute right-3.5 bottom-3.5 text-zinc-650" />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className={`w-full font-mono text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  loading
                    ? "bg-indigo-950/20 text-indigo-400 border border-indigo-900/30 animate-pulse"
                    : !prompt.trim()
                    ? "bg-zinc-900/50 text-zinc-600 border border-zinc-800/60 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/10 active:scale-[0.98]"
                }`}
              >
                {loading ? (
                  <>Building Audience Pipeline...</>
                ) : (
                  <>
                    <Play size={11} fill="currentColor" />
                    Create Segment
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick-play suggestions */}
          <div className="mt-5 border-t border-zinc-850/60 pt-4">
            <p className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-widest mb-2.5 flex items-center gap-1">
              <HelpCircle size={10} />
              Suggested Filters
            </p>
            <div className="grid grid-cols-1 gap-2">
              {samplePrompts.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSuggestClick(p.text)}
                  className="w-full text-left bg-zinc-950/40 hover:bg-zinc-900/40 border border-zinc-850/60 hover:border-zinc-800 rounded-xl p-2.5 transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <span className="text-xs">{p.icon}</span>
                  <span className="text-[11px] font-mono text-zinc-400 group-hover:text-zinc-250 truncate">
                    {p.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Structured Output Visualization Section */}
      <div className="lg:col-span-7 flex flex-col gap-5">
        {error && (
          <div className="border border-red-900/40 bg-red-950/10 text-red-400 rounded-2xl p-4 flex items-start gap-2.5 text-xs font-mono">
            <AlertCircle size={15} className="mt-0.5 text-red-500 shrink-0" />
            <div>
              <p className="font-bold uppercase tracking-wider text-red-300">Audience Build Error</p>
              <p className="text-zinc-400 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="border border-dashed border-zinc-800/80 bg-zinc-900/10 rounded-2xl p-12 text-center text-zinc-500 flex flex-col items-center justify-center min-h-[350px]">
            <Sparkles size={36} className="text-zinc-700 mb-3 animate-pulse" />
            <p className="text-xs font-mono font-medium text-zinc-400">No Segment Created Yet</p>
            <p className="text-[11px] text-zinc-650 mt-1 max-w-sm font-mono leading-relaxed">
              Select or type a segmentation phrase in the input panel to compile natural language filters using the server-side Gemini system.
            </p>
          </div>
        )}

        {loading && (
          <div className="border border-dashed border-zinc-800 bg-zinc-900/10 rounded-2xl p-12 text-center text-zinc-500 flex flex-col items-center justify-center min-h-[350px] animate-pulse">
            <Sparkles size={36} className="text-indigo-400 mb-3 animate-spin duration-3000" />
            <p className="text-xs font-mono font-medium text-indigo-300">Compiling Filter Logic...</p>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-sm font-mono">
              Generating structured query filters via `@google/genai` and running high-density database counts against Prisma.
            </p>
          </div>
        )}

        {result && !loading && (
          <div className="flex flex-col gap-5">
            {/* Metadata Stats Box */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-4 bg-zinc-900/30 border border-zinc-800/85 rounded-2xl p-4 text-center hover:border-zinc-700/50 transition-colors flex flex-col items-center justify-center">
                <div className="p-2 border border-blue-900/30 bg-blue-950/20 text-blue-400 rounded-xl mb-2.5">
                  <Users size={16} />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100 mb-0.5">
                  {result.size}
                </div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">
                  Audience Size
                </p>
              </div>

              <div className="sm:col-span-8 bg-zinc-900/30 border border-zinc-800/85 rounded-2xl p-4 hover:border-zinc-700/50 transition-colors flex flex-col justify-center">
                <div className="flex gap-1.5 items-center text-amber-400 font-mono text-[10px] uppercase tracking-wider font-semibold mb-2">
                  <CheckCircle2 size={12} />
                  Safe Explanation Logic
                </div>
                <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                  {result.explanation}
                </p>
              </div>
            </div>

            {/* Generated JSON Token Output */}
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 hover:border-zinc-700/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-2.5 border-b border-zinc-900 pb-2">
                <div className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <FileJson size={12} className="text-indigo-400" />
                  Structured Target Token Filters
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-900/40 rounded-full">
                  SECURE INTERMEDIATE SCHEMA
                </span>
              </div>
              <pre className="text-[11px] font-mono text-zinc-350 bg-black/50 p-3 rounded-xl overflow-x-auto leading-relaxed border border-black/80 max-h-[140px] scrollbar-thin">
                {JSON.stringify(result.filters, null, 2)}
              </pre>
            </div>

            {/* Dynamic Results Table Preview */}
            <div className="border border-zinc-800/80 rounded-2xl p-4 bg-zinc-900/10">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 font-mono">
                Matching Segment Sample Preview ({result.samples.length})
              </h4>

              {result.samples.length === 0 ? (
                <div className="text-center p-6 border border-dashed border-zinc-900 rounded-xl font-mono text-[11px] text-zinc-500">
                  Filters compile successfully, but zero customers match these conditions inside the current DBMS tables.
                </div>
              ) : (
                <div className="border border-zinc-850/60 rounded-xl overflow-hidden bg-zinc-950/20">
                  <Table>
                    <TableHeader className="bg-zinc-950/40">
                      <TableRow className="border-zinc-850/60">
                        <TableHead className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider py-2 px-3 h-auto">Customer</TableHead>
                        <TableHead className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider py-2 px-3 h-auto">Contact Info</TableHead>
                        <TableHead className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider py-2 px-3 h-auto text-right">Sum Invested</TableHead>
                        <TableHead className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider py-2 px-3 h-auto text-center">Last Purchase</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-zinc-900/40">
                      {result.samples.map((cust) => (
                        <TableRow key={cust.id} className="border-zinc-900/60 hover:bg-zinc-900/10">
                          <TableCell className="py-2.5 px-3 text-xs font-semibold text-zinc-200">
                            {cust.name}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-xs font-mono">
                            <div className="flex flex-col">
                              <span className="text-blue-400 text-[11px]">{cust.email}</span>
                              {cust.phone && (
                                <span className="text-zinc-500 text-[10px] flex items-center gap-1">
                                  <Phone size={8} /> {cust.phone}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-xs font-mono text-right text-emerald-400 font-bold">
                            {formatCurrency(cust.totalSpend)}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-xs font-mono text-center text-zinc-400 text-[11px]">
                            {cust.lastOrderDate ? (
                              <span className="flex items-center justify-center gap-1">
                                <Calendar size={10} className="text-zinc-650" />
                                {formatDate(cust.lastOrderDate)}
                              </span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
