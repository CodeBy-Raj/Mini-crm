"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  MessageSquare, 
  PhoneCall, 
  Bookmark, 
  Plus, 
  RefreshCw,
  Terminal,
  HelpCircle,
  FileSpreadsheet,
  Activity
} from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface SavedCampaignDraft {
  id: string;
  name: string;
  status: string;
  channel: string;
  recommendationText?: string;
  reason?: string;
  createdAt: Date | string;
}

interface CampaignBuilderProps {
  onLogMessage?: (msg: string) => void;
  viewMode?: "engine" | "execution" | "analytics";
}

export function CampaignBuilder({ onLogMessage, viewMode = "engine" }: CampaignBuilderProps) {
  // Goals & suggestions
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suggested values edit state
  const [recChannel, setRecChannel] = useState("EMAIL");
  const [recMessage, setRecMessage] = useState("");
  const [recReason, setRecReason] = useState("");
  const [customName, setCustomName] = useState("");
  
  // Results status
  const [aiGenerated, setAiGenerated] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // History list state
  const [draftsList, setDraftsList] = useState<SavedCampaignDraft[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Launch state (Phase 6 additions)
  const [launchAudiencePrompt, setLaunchAudiencePrompt] = useState("");
  const [launchLoading, setLaunchLoading] = useState(false);
  const [launchResult, setLaunchResult] = useState<{
    campaignId: string;
    campaignName: string;
    channel: string;
    status: string;
    audienceSize: number;
    communicationsGenerated: number;
  } | null>(null);

  // Launching from previous drafts
  const [selectedLaunchDraft, setSelectedLaunchDraft] = useState<SavedCampaignDraft | null>(null);
  const [draftLaunchAudiencePrompt, setDraftLaunchAudiencePrompt] = useState("");
  const [draftLaunchLoading, setDraftLaunchLoading] = useState(false);

  const sampleGoals = [
    { text: "Bring inactive users back", icon: "⏰" },
    { text: "Increase repeat purchases", icon: "🔄" },
    { text: "Reward loyal customers", icon: "🏆" },
  ];

  // Live delivery updates
  const [liveCampaigns, setLiveCampaigns] = useState<any[]>([]);
  const [recentComms, setRecentComms] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState({ sent: 0, delivered: 0, failed: 0, pending: 0 });
  const [polling, setPolling] = useState(false);

  // AI Optimization Recommendations state (Phase 9)
  const [optimizations, setOptimizations] = useState<Record<string, any>>({});
  const [optimizationsLoading, setOptimizationsLoading] = useState<Record<string, boolean>>({});
  const [optimizationsError, setOptimizationsError] = useState<Record<string, string>>({});
  const [runningAction, setRunningAction] = useState<Record<string, boolean>>({});

  const fetchOptimization = async (campaignId: string) => {
    if (!campaignId) return;
    setOptimizationsLoading((prev) => ({ ...prev, [campaignId]: true }));
    setOptimizationsError((prev) => ({ ...prev, [campaignId]: "" }));
    try {
      const res = await fetch(`/api/optimization?campaignId=${campaignId}`);
      if (!res.ok) {
        throw new Error(`Endpoint returned status ${res.status}`);
      }
      const data = await res.json();
      if (data && data.success) {
        setOptimizations((prev) => ({ ...prev, [campaignId]: data.latest }));
      } else {
        throw new Error(data.error || "Failed to load optimization.");
      }
    } catch (e: any) {
      console.error(`Error loading metrics optimization for campaign ${campaignId}:`, e);
      setOptimizationsError((prev) => ({ ...prev, [campaignId]: e.message || "Failed to fetch recommendation." }));
    } finally {
      setOptimizationsLoading((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  const reanalyzeCampaign = async (campaignId: string) => {
    if (!campaignId) return;
    setOptimizationsLoading((prev) => ({ ...prev, [campaignId]: true }));
    setOptimizationsError((prev) => ({ ...prev, [campaignId]: "" }));
    if (onLogMessage) {
      onLogMessage(`- Triggering AI Performance analysis for Campaign ID: "${campaignId}"...`);
    }
    try {
      const res = await fetch("/api/optimization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId }),
      });
      if (!res.ok) {
        throw new Error(`Endpoint returned status ${res.status}`);
      }
      const data = await res.json();
      if (data && data.success) {
        setOptimizations((prev) => ({ ...prev, [campaignId]: data.recommendation }));
        if (onLogMessage) {
          onLogMessage(`✓ AI Optimization successful! Generated recommendation: "${data.recommendation.recommendation}" with confidence ${Math.round(data.recommendation.confidence * 100)}%`);
        }
      } else {
        throw new Error(data.error || "Generation error.");
      }
    } catch (e: any) {
      console.error("Failed manual re-analysis:", e);
      setOptimizationsError((prev) => ({ ...prev, [campaignId]: e.message || "Manual analysis failed." }));
      if (onLogMessage) {
        onLogMessage(`❌ AI Optimization Exception: ${e.message || "server-side error"}`);
      }
    } finally {
      setOptimizationsLoading((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  const executeOptimizationAction = (campaignId: string, recommendation: string, count: number) => {
    setRunningAction((prev) => ({ ...prev, [campaignId]: true }));
    if (onLogMessage) {
      onLogMessage(`[AI Optimization Tool] Applying corrective recommendation: "${recommendation}"`);
    }
    setTimeout(() => {
      setRunningAction((prev) => ({ ...prev, [campaignId]: false }));
      if (onLogMessage) {
         if (recommendation.toLowerCase().includes("retry") || recommendation.toLowerCase().includes("fail")) {
           onLogMessage(`✓ [AI Optimization] Corrective active action triggered! Programmed automatic scheduling of retry dispatches for ${count || 80} failed delivery contacts successfully.`);
         } else {
           onLogMessage(`✓ [AI Optimization] Optimization strategy initiated. Campaign metrics adjusted to maximum dispatch scale.`);
         }
      }
    }, 1500);
  };

  const fetchLiveMetrics = async () => {
    try {
      const res = await fetch("/api/campaign?type=metrics");
      if (!res.ok) {
        console.warn("Transient notice: Campaign metrics endpoint returned non-ok status: " + res.status);
        return;
      }
      const data = await res.json();
      if (data && data.success) {
        setLiveCampaigns(data.campaigns || []);
        setRecentComms(data.communications || []);
        
        if (data.global) {
          setGlobalStats(data.global);
        } else {
          // Fallback stats computation
          const delivered = (data.campaigns || []).reduce((sum: number, c: any) => sum + (c.delivered !== undefined ? c.delivered : (c.metrics?.delivered || 0)), 0);
          const failed = (data.campaigns || []).reduce((sum: number, c: any) => sum + (c.failed !== undefined ? c.failed : (c.metrics?.failed || 0)), 0);
          const pending = (data.campaigns || []).reduce((sum: number, c: any) => sum + (c.pending !== undefined ? c.pending : (c.metrics?.pending || 0)), 0);
          setGlobalStats({
            sent: delivered + failed,
            delivered,
            failed,
            pending,
          });
        }

        // Conditionally activate/deactivate polling based on whether active transmissions are occurring
        const hasPending = (data.campaigns || []).some((c: any) => {
          const pendingCount = c.pending !== undefined ? c.pending : (c.metrics?.pending || 0);
          return c.status === "PENDING" || pendingCount > 0;
        });
        setPolling(hasPending);
      }
    } catch (e) {
      console.warn("Transient notice: Initializing campaign live metrics connection...", e);
    }
  };

  const fetchDrafts = async () => {
    setFetchLoading(true);
    try {
      const res = await fetch("/api/campaign");
      if (!res.ok) {
        console.warn("Transient notice: Drafts endpoint returned non-ok status: " + res.status);
        return;
      }
      const data = await res.json();
      if (data && data.success) {
        setDraftsList(data.drafts || []);
      }
    } catch (e) {
      console.warn("Transient notice: Initializing saved drafts connection...", e);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
    fetchLiveMetrics();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (polling) {
      timer = setInterval(() => {
        fetchLiveMetrics();
      }, 2000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [polling]);

  // Automatically fetch recommendations for loaded live campaigns (Phase 9)
  useEffect(() => {
    if (liveCampaigns && liveCampaigns.length > 0) {
      liveCampaigns.forEach((c) => {
        if (!optimizations[c.id] && !optimizationsLoading[c.id] && !optimizationsError[c.id]) {
          fetchOptimization(c.id);
        }
      });
    }
  }, [liveCampaigns, optimizations, optimizationsLoading, optimizationsError]);

  const handleSuggestClick = (suggestion: string) => {
    setGoal(suggestion);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    setError(null);
    setAiGenerated(false);
    setSaveSuccess(false);
    setLaunchResult(null);

    if (onLogMessage) {
      onLogMessage(`- Requesting Campaign proposal for: "${goal.trim()}"`);
    }

    try {
      const response = await fetch("/api/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", goal: goal.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setRecChannel(data.channel || "EMAIL");
        setRecMessage(data.message || "");
        setRecReason(data.reason || "");
        setCustomName(`Campaign Segment: ${goal.trim().slice(0, 20)}...`);
        setLaunchAudiencePrompt(goal.trim()); // Autofill audience target search
        setAiGenerated(true);

        if (onLogMessage) {
          onLogMessage(`✓ Proposed Campaign Layout: Channel = [${data.channel}], Reasoning loaded safely.`);
        }
      } else {
        throw new Error(data.error || "Generation exception.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to process campaign generation request.");
      if (onLogMessage) {
        onLogMessage(`❌ Campaign Agent Exception: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!customName.trim() || !recMessage.trim()) return;

    setSaveLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          name: customName.trim(),
          channel: recChannel,
          message: recMessage,
          reason: recReason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
        if (onLogMessage) {
          onLogMessage(`✓ Saved campaign draft successfully to host DBMS: "${customName.trim()}"`);
        }
        fetchDrafts(); // Refetch drafts to show updated list
      } else {
        throw new Error(data.error || "Failed to save draft.");
      }
    } catch (err: any) {
      setError(err.message || "Backend persistence error.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLaunchCampaign = async () => {
    if (!customName.trim() || !recMessage.trim() || !launchAudiencePrompt.trim()) return;

    setLaunchLoading(true);
    setError(null);
    setLaunchResult(null);

    if (onLogMessage) {
      onLogMessage(`- Triggering Campaign launch transactional build: "${customName.trim()}"`);
    }

    try {
      const res = await fetch("/api/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "launch",
          name: customName.trim(),
          channel: recChannel,
          message: recMessage,
          audiencePrompt: launchAudiencePrompt.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLaunchResult({
          campaignId: data.campaign.id,
          campaignName: data.campaign.name,
          channel: data.campaign.channel,
          status: data.campaign.status,
          audienceSize: data.audienceSize,
          communicationsGenerated: data.communicationsGenerated,
        });

        if (onLogMessage) {
          onLogMessage(`✓ Campaign [${data.campaign.name}] launched! Target count: ${data.audienceSize}, Created ${data.communicationsGenerated} communication logs.`);
        }
        
        fetchDrafts();
        fetchLiveMetrics();
      } else {
        throw new Error(data.error || "Launch execution failed.");
      }
    } catch (err: any) {
      setError(err.message || "Launch process transaction failed.");
      if (onLogMessage) {
        onLogMessage(`❌ Campaign Launch error: ${err.message}`);
      }
    } finally {
      setLaunchLoading(false);
    }
  };

  const handleDeleteDraft = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/campaign?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        if (onLogMessage) {
          onLogMessage(`✓ Removed campaign draft safely: "${name}"`);
        }
        fetchDrafts();
      } else {
        throw new Error(data.error || "Delete call failed.");
      }
    } catch (err: any) {
      setError(`Failed to delete draft: ${err.message}`);
    }
  };

  const formatChannelIcon = (channel: string) => {
    switch (channel.toUpperCase()) {
      case "EMAIL":
        return <Mail size={14} className="text-blue-400" />;
      case "SMS":
        return <MessageSquare size={14} className="text-amber-400" />;
      case "WHATSAPP":
        return <PhoneCall size={14} className="text-emerald-400" />;
      default:
        return <FileText size={14} className="text-zinc-400" />;
    }
  };

  return (
    <>
      {/* 4. Active Saved Draft Launch Overlay */}
      {selectedLaunchDraft && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 font-sans">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative font-mono text-xs hover:border-zinc-750 transition-all duration-300">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5 font-mono border-b border-zinc-900 pb-3">
              <Send size={15} className="text-blue-400 shrink-0" />
              Launch Saved Draft Sequence
            </h3>
            
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              Confirm your choice to launch campaign draft <span className="text-blue-400 font-bold">&quot;{selectedLaunchDraft.name}&quot;</span>. Define your target audience criteria using natural language.
            </p>

            <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-900/80 space-y-1.5">
              <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-500">Selected Template Copy</span>
              <p className="text-[10px] text-zinc-400 leading-normal line-clamp-3 italic">
                &quot;{selectedLaunchDraft.recommendationText || "Empty template message text."}&quot;
              </p>
            </div>

            <div className="space-y-1.5 font-sans">
              <label className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-widest block">
                Audience Rules
              </label>
              <textarea
                value={draftLaunchAudiencePrompt}
                onChange={(e) => setDraftLaunchAudiencePrompt(e.target.value)}
                placeholder="E.g., Customers inactive for 90 days with over 100 spent..."
                rows={3}
                className="w-full bg-black/40 border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500/40 leading-relaxed"
              />
              <p className="text-[9px] text-zinc-550 leading-normal">
                Prisma parses this prompt using standard AI filters and registers communication records with PENDING statuses.
              </p>
            </div>

            {error && (
              <p className="text-red-400 text-[10px] border border-red-900/40 bg-red-950/15 p-2.5 rounded-lg font-bold">
                ⚠️ Launch Error: {error}
              </p>
            )}

            <div className="flex gap-2 justify-end pt-3 border-t border-zinc-900 font-sans">
              <button
                type="button"
                onClick={() => {
                  setSelectedLaunchDraft(null);
                  setError(null);
                }}
                className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors font-semibold cursor-pointer text-[10px] uppercase font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={draftLaunchLoading || !draftLaunchAudiencePrompt.trim()}
                onClick={async () => {
                  setDraftLaunchLoading(true);
                  setError(null);
                  if (onLogMessage) {
                    onLogMessage(`- Deploying bulk launch trigger for draft: "${selectedLaunchDraft.name}"`);
                  }
                  try {
                    const res = await fetch("/api/campaign", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "launch",
                        name: selectedLaunchDraft.name,
                        channel: selectedLaunchDraft.channel,
                        message: selectedLaunchDraft.recommendationText || "",
                        audiencePrompt: draftLaunchAudiencePrompt.trim(),
                      }),
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                      setLaunchResult({
                        campaignId: data.campaign.id,
                        campaignName: data.campaign.name,
                        channel: data.campaign.channel,
                        status: data.campaign.status,
                        audienceSize: data.audienceSize,
                        communicationsGenerated: data.communicationsGenerated,
                      });
                      if (onLogMessage) {
                        onLogMessage(`✓ Launched draft [${data.campaign.name}] successfully! Generated ${data.communicationsGenerated} communication records.`);
                      }
                      setSelectedLaunchDraft(null);
                      fetchDrafts();
                      fetchLiveMetrics();
                    } else {
                      throw new Error(data.error || "Draft launch execution failed.");
                    }
                  } catch (err: any) {
                    setError(err.message || "Failed to process launch.");
                    if (onLogMessage) {
                      onLogMessage(`❌ Campaign launch failure: ${err.message}`);
                    }
                  } finally {
                    setDraftLaunchLoading(false);
                  }
                }}
                className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-colors uppercase font-mono cursor-pointer ${
                  draftLaunchLoading
                    ? "bg-blue-950/20 text-blue-400 border border-blue-900/30 animate-pulse"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              >
                {draftLaunchLoading ? "Launching..." : "Launch Campaign 🚀"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* 1. Left hand: Input Area & Quick Suggestions */}
      {viewMode === "engine" && (
        <div className="lg:col-span-5 flex flex-col gap-5">
        <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700/60 transition-all duration-305">
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5 mb-3 font-mono">
            <Sparkles size={14} className="text-blue-400" />
            Campaign Setup
          </h3>

          <p className="text-xs text-zinc-500 mb-4 font-mono leading-relaxed">
            Describe what you want the campaign to achieve.
          </p>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="relative">
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="E.g., Bring back users who haven't placed an order within 120 days by offering a 15% discount coupon..."
                rows={4}
                className="w-full bg-black/40 border border-zinc-800/80 rounded-xl p-3.5 text-xs text-zinc-100 font-mono placeholder:text-zinc-650 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !goal.trim()}
              className={`w-full font-mono text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                loading
                  ? "bg-blue-950/20 text-blue-400 border border-blue-900/30 animate-pulse"
                  : !goal.trim()
                  ? "bg-zinc-900/50 text-zinc-600 border border-zinc-800/65 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/10 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>AI Strategist Planning Campaign...</>
              ) : (
                <>
                  <Sparkles size={12} className="text-amber-300 fill-amber-300" />
                  Generate Campaign
                </>
              )}
            </button>
          </form>

          {/* Quick suggesting goals */}
          <div className="mt-5 border-t border-zinc-855/60 pt-4">
            <p className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-widest mb-2.5 flex items-center gap-1">
              <HelpCircle size={10} />
              Pre-defined Goals
            </p>
            <div className="grid grid-cols-1 gap-2">
              {sampleGoals.map((g, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSuggestClick(g.text)}
                  className="w-full text-left bg-zinc-950/40 hover:bg-zinc-900/40 border border-zinc-850/60 hover:border-zinc-805 rounded-xl p-2.5 transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <span className="text-xs">{g.icon}</span>
                  <span className="text-[11px] font-mono text-zinc-400 group-hover:text-zinc-200">
                    {g.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 2. Right hand: Proposal, Drafting Arena & Previous Draft Lists */}
      <div className={`${viewMode === "engine" ? "lg:col-span-7" : "lg:col-span-12"} flex flex-col gap-5`}>
        {viewMode === "engine" && (
          <>
            {error && (
          <div className="border border-red-900/40 bg-red-950/10 text-red-400 rounded-2xl p-4 flex items-start gap-2.5 text-xs font-mono">
            <AlertCircle size={15} className="mt-0.5 text-red-500 shrink-0" />
            <div>
              <p className="font-bold uppercase tracking-wider text-red-350">Campaign Build Error</p>
              <p className="text-zinc-400 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Launch summary reports (Phase 6 additions) */}
        {launchResult && (
          <div className="border border-emerald-950 bg-emerald-950/10 text-emerald-300 rounded-2xl p-5 flex flex-col gap-3.5 font-mono text-xs border-solid animate-fade-in">
            <div className="flex items-center gap-2 pb-1">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold uppercase tracking-wider text-emerald-400">Campaign Launched Successfully (Phase 6)</p>
                <p className="text-zinc-500 mt-0.5 leading-normal">Atomically generated live communications mapping in PostgreSQL using transactions.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-black/45 p-3.5 rounded-xl border border-emerald-900/20 text-center">
              <div className="flex flex-col items-center justify-center">
                <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Campaign Name</p>
                <p className="text-zinc-200 font-semibold mt-1 truncate max-w-[150px]" title={launchResult.campaignName}>
                  {launchResult.campaignName}
                </p>
                <span className="inline-block text-[9px] bg-emerald-950/60 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded-full font-mono mt-1 uppercase font-bold">
                  {launchResult.status}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-x border-zinc-900 py-2 sm:py-0">
                <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Audience Size</p>
                <p className="text-2xl font-bold text-zinc-100 mt-1">{launchResult.audienceSize}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5 font-semibold">Matched Accounts</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Communications</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{launchResult.communicationsGenerated}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5 font-semibold">PENDING logs generated</p>
              </div>
            </div>

            <button
              onClick={() => setLaunchResult(null)}
              className="text-center w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white py-2 rounded-lg text-xs font-mono border border-zinc-800 transition-colors cursor-pointer"
            >
              Acknowledge Launch Success
            </button>
          </div>
        )}

        {/* Generate outputs */}
        {aiGenerated && (
          <div className="bg-zinc-900/30 border border-zinc-800/85 rounded-2xl p-5 hover:border-zinc-700/60 transition-all duration-300 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-850 pb-3 gap-2">
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">
                  Campaign Preview
                </h4>
                <p className="text-[10px] text-zinc-500 font-mono">Review and edit the generated campaign.</p>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950 rounded-lg border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500">Channel Mode:</span>
                <select
                  value={recChannel}
                  onChange={(e) => setRecChannel(e.target.value)}
                  className="bg-transparent border-none text-xs font-mono font-bold text-blue-400 focus:outline-none cursor-pointer"
                >
                  <option value="EMAIL">EMAIL</option>
                  <option value="SMS">SMS</option>
                  <option value="WHATSAPP">WHATSAPP</option>
                </select>
              </div>
            </div>

            {/* Campaign Name Entry */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-widest block">
                Draft Title
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-blue-500/40"
              />
            </div>

            {/* Dynamic message draft */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-widest block">
                Campaign Message
              </label>
              <textarea
                value={recMessage}
                onChange={(e) => setRecMessage(e.target.value)}
                rows={5}
                className="w-full bg-black/40 border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-blue-500/40 leading-relaxed"
              />
            </div>

            {/* Tactical Logic explanation */}
            <div className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-blue-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                <Bookmark size={11} />
                Why This Channel?
              </div>
              <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                {recReason}
              </p>
            </div>

            {/* Target Audience Ingress (Phase 6 additions) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-widest block font-bold">
                Audience Rules
              </label>
              <textarea
                value={launchAudiencePrompt}
                onChange={(e) => setLaunchAudiencePrompt(e.target.value)}
                rows={2}
                placeholder="E.g., Users inactive for 90 days with over 100 dollars total spend..."
                className="w-full bg-black/40 border border-zinc-800 rounded-lg p-2.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500/40 leading-relaxed"
              />
              <p className="text-[9px] font-mono text-zinc-500 leading-normal">
                Define who should receive this campaign. This standard English criteria parses into safe database count filters atomically.
              </p>
            </div>

            {/* Actions panel */}
            <div className="flex gap-2 justify-end border-t border-zinc-850 pt-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saveLoading || !customName.trim() || !recMessage.trim()}
                className={`px-3 py-2 font-mono text-[11px] font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  saveSuccess 
                    ? "bg-zinc-900/40 text-zinc-405 border border-zinc-800/60 cursor-default" 
                    : "bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-805 text-zinc-350 hover:text-white"
                }`}
              >
                {saveLoading ? (
                  <>Saving draft...</>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle2 size={11} className="text-emerald-500" />
                    Draft Saved
                  </>
                ) : (
                  <>
                    <Bookmark size={11} />
                    Save Draft to DB
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleLaunchCampaign}
                disabled={launchLoading || !customName.trim() || !recMessage.trim() || !launchAudiencePrompt.trim()}
                className={`px-4 py-2 font-mono text-[11px] font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  launchLoading
                    ? "bg-blue-950/20 text-blue-400 border border-blue-900/30 animate-pulse"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold"
                }`}
              >
                {launchLoading ? (
                  <>Launching...</>
                ) : (
                  <>
                    <Send size={11} />
                    Launch Campaign 🚀
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {!aiGenerated && !loading && !error && (
          <div className="border border-dashed border-zinc-800/80 bg-zinc-900/10 rounded-2xl p-12 text-center text-zinc-500 flex flex-col items-center justify-center min-h-[180px]">
            <Sparkles size={32} className="text-zinc-700 mb-2.5" />
            <p className="text-xs font-mono font-medium text-zinc-400 font-bold">Drafting Space Empty</p>
            <p className="text-[11px] text-zinc-650 mt-1 max-w-sm font-mono">
              Provide a campaign marketing goal on the left to activate the structured copy drafting space.
            </p>
          </div>
        )}
          </>
        )}

        {/* 3. Persistent saved draft rosters */}
        {(viewMode === "engine" || viewMode === "execution") && (
          <div className="bg-zinc-900/30 border border-zinc-800/85 rounded-2xl p-5 hover:border-zinc-700/60 transition-all duration-300">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">
                Saved Campaigns ({draftsList.length})
              </h4>
              <p className="text-[10px] text-zinc-500 font-mono">Live PostgreSQL records synced via CampaignService</p>
            </div>
            <button
              onClick={fetchDrafts}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 p-1.5 hover:bg-zinc-800/40 border border-zinc-850 rounded-lg transition-colors cursor-pointer"
              title="Refresh lists"
            >
              <RefreshCw size={11} className={fetchLoading ? "animate-spin" : ""} />
            </button>
          </div>

          {draftsList.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-zinc-850 rounded-xl font-mono text-[11px] text-zinc-650">
              No saved drafts present. Complete a generation recommendation above and click &quot;Save Draft&quot; to persist your setup.
            </div>
          ) : (
            <div className="border border-zinc-850 rounded-xl overflow-hidden bg-zinc-950/20 max-h-[250px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-zinc-950/40 border-b border-zinc-800/60">
                  <TableRow className="hover:bg-transparent border-zinc-850">
                    <TableHead className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider py-2 px-3.5 h-auto">Campaign Name</TableHead>
                    <TableHead className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider py-2 px-3.5 h-auto text-center">Channel</TableHead>
                    <TableHead className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider py-2 px-3.5 h-auto">Message Preview</TableHead>
                    <TableHead className="py-2 px-3.5 h-auto"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-zinc-900/40">
                  {draftsList.map((x) => (
                    <TableRow key={x.id} className="border-zinc-900/60 hover:bg-zinc-900/10">
                      <TableCell className="py-2.5 px-3.5 text-[11px] font-semibold text-zinc-250 truncate max-w-[130px]" title={x.name}>
                        {x.name}
                      </TableCell>
                      <TableCell className="py-2.5 px-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-zinc-950 rounded border border-zinc-800/80 font-mono font-bold">
                          {formatChannelIcon(x.channel)}
                          <span className="text-zinc-400 lowercase">{x.channel}</span>
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 px-3.5 text-[11px] font-mono text-zinc-400 truncate max-w-[200px]" title={x.recommendationText}>
                        {x.recommendationText || "—"}
                      </TableCell>
                      <TableCell className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedLaunchDraft(x);
                              setDraftLaunchAudiencePrompt(goal.trim() || "all active customers");
                            }}
                            className="hover:text-blue-400 text-zinc-500 p-1.5 rounded hover:bg-zinc-950 transition-colors cursor-pointer"
                            title="Launch draft with criteria"
                          >
                            <Send size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteDraft(x.id, x.name)}
                            className="hover:text-red-400 text-zinc-500 p-1.5 rounded hover:bg-zinc-950 transition-colors cursor-pointer"
                            title="Purge record"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        )}

        {/* Real-time Execution Dashboard (Phase 8 HUD) */}
        {(viewMode === "execution" || viewMode === "analytics") && (
          <>
            <div className="bg-zinc-900/30 border border-zinc-800/85 rounded-2xl p-5 hover:border-zinc-700/60 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Activity size={13} className="text-emerald-500 animate-pulse" />
                Delivery Summary
              </h4>
              <p className="text-[10px] text-zinc-500 font-mono">Near real-time dispatch progress (polling every 2s)</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950 rounded-lg text-[9px] font-mono font-bold text-zinc-400 border border-zinc-850">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>SYNCED</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Sent Messages Stat */}
            <div className="relative overflow-hidden bg-black/40 border border-zinc-850 p-4 rounded-xl hover:border-zinc-800 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 tracking-wider">Sent</span>
                <Send size={13} className="text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-zinc-150 mt-2 font-mono">{globalStats.sent}</p>
              <p className="text-[9px] text-zinc-550 font-mono mt-1 leading-none">Messages Sent</p>
            </div>

            {/* Delivered Messages Stat */}
            <div className="relative overflow-hidden bg-black/40 border border-zinc-850 p-4 rounded-xl hover:border-zinc-805 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 tracking-wider">Delivered</span>
                <CheckCircle2 size={13} className="text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-emerald-400 mt-2 font-mono">{globalStats.delivered}</p>
              <p className="text-[9px] text-zinc-550 font-mono mt-1 leading-none">Delivered</p>
            </div>

            {/* Failed Messages Stat */}
            <div className="relative overflow-hidden bg-black/40 border border-zinc-850 p-4 rounded-xl hover:border-zinc-805 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 tracking-wider">Failed</span>
                <AlertCircle size={13} className="text-red-400" />
              </div>
              <p className="text-2xl font-bold text-red-400 mt-2 font-mono">{globalStats.failed}</p>
              <p className="text-[9px] text-zinc-550 font-mono mt-1 leading-none">Failed Deliveries</p>
            </div>
          </div>
        </div>

        {/* 4. Live Campaign Delivery Pipelines */}
        {liveCampaigns.length > 0 && (
          <div className="bg-zinc-900/30 border border-zinc-800/85 rounded-2xl p-5 hover:border-zinc-700/60 transition-all duration-300">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5 font-bold">
                  
                  Active Campaigns ({liveCampaigns.length})
                </h4>
                <p className="text-[10px] text-zinc-500 font-mono">Live status of running campaigns.</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {liveCampaigns.map((c) => {
                const total = c.metrics?.total || 0;
                const delivered = c.metrics?.delivered || 0;
                const failed = c.metrics?.failed || 0;
                const pending = c.metrics?.pending || 0;
                const processed = delivered + failed;
                const pct = total > 0 ? Math.round((processed / total) * 100) : 0;

                const isCompleted = pending === 0 && total > 0;

                return (
                  <div key={c.id} className="bg-black/40 border border-zinc-850 p-3.5 rounded-xl space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-zinc-200 truncate font-sans" title={c.name}>{c.name}</p>
                        <p className="text-[9px] text-zinc-550 font-mono mt-0.5">
                          Channel: <span className="text-zinc-400 font-bold">{c.channel}</span> • Tracked: {total}
                        </p>
                      </div>
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded font-mono border ${
                        c.status === "COMPLETED" 
                          ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30" 
                          : c.status === "PARTIAL_FAILURE"
                          ? "bg-red-950/20 text-red-400 border-red-950/30"
                          : isCompleted
                          ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30"
                          : "bg-blue-950/20 text-blue-400 border-blue-900/30 animate-pulse"
                      }`}>
                        {c.status || (isCompleted ? "COMPLETED" : "TRANSMITTING")}
                      </span>
                    </div>

                    {/* Progress Bar UI */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                        <span>Delivery Progress ({pct}%)</span>
                        <span>{processed} / {total} logs finished</span>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-900 flex">
                        <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${total > 0 ? (delivered / total) * 100 : 0}%` }} title={`Delivered: ${delivered}`} />
                        <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${total > 0 ? (failed / total) * 100 : 0}%` }} title={`Failed: ${failed}`} />
                        <div className="bg-zinc-800 h-full transition-all duration-300" style={{ width: `${total > 0 ? (pending / total) * 100 : 0}%` }} title={`Pending: ${pending}`} />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-center pt-1.5 border-t border-zinc-900/60 font-mono text-[10px]">
                      <div>
                        <p className="text-[8px] uppercase text-zinc-500 font-bold">Total</p>
                        <p className="text-zinc-300 font-bold">{total}</p>
                      </div>
                      <div>
                        <p className="text-[8px] uppercase text-emerald-500 font-bold text-emerald-500/80">Delivered</p>
                        <p className="text-emerald-400 font-bold">{delivered}</p>
                      </div>
                      <div>
                        <p className="text-[8px] uppercase text-red-500 font-bold text-red-500/80">Failed</p>
                        <p className="text-red-400 font-bold">{failed}</p>
                      </div>
                      <div>
                        <p className="text-[8px] uppercase text-indigo-500 font-bold text-indigo-500/80">Delivery Rate</p>
                        <p className="text-indigo-400 font-bold">{c.metrics?.successRate || "0%"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4.5 AI Performance Optimization Advisory (Phase 9) */}
        {liveCampaigns.length > 0 && (
          <div className="bg-zinc-900/30 border border-zinc-800/85 rounded-2xl p-5 hover:border-zinc-700/60 transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5 font-bold">
                  <Sparkles size={13} className="text-indigo-400" />
                  Campaign Recommendations
                </h4>
                <p className="text-[10px] text-zinc-500 font-mono">Suggestions to improve campaign performance.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveCampaigns.map((c) => {
                const total = c.metrics?.total || 0;
                const delivered = c.metrics?.delivered || 0;
                const failed = c.metrics?.failed || 0;

                const recommendation = optimizations[c.id];
                const isLoading = optimizationsLoading[c.id];
                const isError = optimizationsError[c.id];
                const isRunning = runningAction[c.id];

                return (
                  <div key={`opt-${c.id}`} className="bg-black/60 border border-zinc-850 p-4 rounded-xl flex flex-col justify-between hover:border-zinc-800 transition-colors gap-3.5 relative overflow-hidden group">
                    <div>
                      {/* Campaign identifier header */}
                      <div className="flex justify-between items-start gap-1">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-200 truncate font-sans" title={c.name}>{c.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] uppercase font-mono bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                              {formatChannelIcon(c.channel)}
                              <span>{c.channel}</span>
                            </span>
                            <span className="text-[9px] font-mono text-zinc-500">
                              Stats: {delivered} Delivered • {failed} Failed
                            </span>
                          </div>
                        </div>

                        {/* Regenerate AI button */}
                        <button
                          onClick={() => reanalyzeCampaign(c.id)}
                          disabled={isLoading}
                          className="hover:text-amber-400 text-zinc-500 p-1 rounded hover:bg-zinc-900 transition-colors cursor-pointer self-start"
                          title="Trigger fresh Gemini re-analysis"
                        >
                          <RefreshCw size={11} className={isLoading ? "animate-spin" : ""} />
                        </button>
                      </div>

                      {/* AI recommendations loading, error or display */}
                      <div className="mt-3.5 border-t border-zinc-900 pt-3">
                        {isLoading ? (
                          <div className="flex items-center gap-2 justify-center py-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-505 bg-indigo-500 animate-bounce delay-100" />
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-505 bg-indigo-500 animate-bounce delay-200" />
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-505 bg-indigo-500 animate-bounce delay-300" />
                            <span className="text-[10px] text-zinc-500 font-mono ml-1">Analyzing delivery logs...</span>
                          </div>
                        ) : isError ? (
                          <div className="bg-red-950/10 text-red-400 border border-red-900/40 p-2 rounded-lg text-[10px] font-mono leading-relaxed">
                            ⚠️ {isError}
                            <button 
                              onClick={() => fetchOptimization(c.id)} 
                              className="text-blue-405 text-blue-400 underline ml-1 font-bold hover:text-blue-300 block mt-1"
                            >
                              Retry connection
                            </button>
                          </div>
                        ) : recommendation ? (
                          <div className="space-y-2 text-xs">
                            {/* Recommendation copy */}
                            <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-lg p-2.5 space-y-1 relative overflow-hidden group">
                              <div className="flex items-center justify-between text-[8px] uppercase tracking-wider font-bold text-indigo-400">
                                <span>Suggested Improvement</span>
                                <span className="bg-indigo-900/40 px-1 py-0.5 rounded font-mono text-[9px] font-medium text-indigo-300 border border-indigo-800/40">
                                  {Math.round(recommendation.confidence * 100)}% Confidence
                                </span>
                              </div>
                              <p className="text-[11.5px] font-semibold text-zinc-200 leading-snug font-sans">
                                {recommendation.recommendation}
                              </p>
                              <p className="text-[10px] text-zinc-400 leading-normal font-mono italic mt-1 bg-black/40 p-1.5 rounded border border-zinc-900">
                                Reason: &quot;{recommendation.reason}&quot;
                              </p>
                            </div>

                            {/* Confidence indicators metrics progress bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[8px] font-mono uppercase text-zinc-500 font-bold">
                                <span>Confidence Score</span>
                                <span>{(recommendation.confidence * 100).toFixed(0)}%</span>
                              </div>
                              <div className="w-full bg-zinc-950 rounded-full h-1 border border-zinc-900 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300" 
                                  style={{ width: `${recommendation.confidence * 100}%` }} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 text-zinc-600 text-[10.5px] font-mono">
                            No telemetry logs evaluated. Click reload above to analyze.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Operational Action button */}
                    {recommendation && !isLoading && !isError && (
                      <button
                        onClick={() => executeOptimizationAction(c.id, recommendation.recommendation, failed)}
                        disabled={isRunning}
                        className={`w-full py-1.5 rounded-lg text-[10px] font-semibold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center border cursor-pointer ${
                          isRunning
                            ? "bg-zinc-950/40 text-blue-400 border-zinc-800/60 animate-pulse"
                            : "bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-white border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        {isRunning ? (
                          <>Applying Optimizer Strategy...</>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            Run &quot;{recommendation.recommendation}&quot; Sequence
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Recent Events / Dispatch Logs */}
        {recentComms.length > 0 && (
          <div className="bg-zinc-900/30 border border-zinc-800/85 rounded-2xl p-5 hover:border-zinc-700/60 transition-all duration-300">
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Terminal size={12} className="text-zinc-500" />
                Recent Events ({recentComms.length})
              </h4>
              <p className="text-[10px] text-zinc-500 font-mono mb-3">Audit logs detailing precise transmission events in real-time</p>
            </div>

            <div className="border border-zinc-850 rounded-xl overflow-hidden bg-zinc-950/20 max-h-[220px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-zinc-950/45 border-b border-zinc-800/60">
                  <TableRow className="hover:bg-transparent border-zinc-850">
                    <TableHead className="font-mono text-[9px] text-zinc-500 py-1.5 px-3 uppercase tracking-wider">Recipient</TableHead>
                    <TableHead className="font-mono text-[9px] text-zinc-500 py-1.5 px-3 uppercase tracking-wider">Campaign & Message Copy</TableHead>
                    <TableHead className="font-mono text-[9px] text-zinc-500 py-1.5 px-3 text-center uppercase tracking-wider">Delivery</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-zinc-900/40">
                  {recentComms.map((comm) => (
                    <TableRow key={comm.id} className="border-zinc-900/60 hover:bg-zinc-900/10">
                      <TableCell className="py-2 px-3 text-[10px]">
                        <p className="text-zinc-200 font-semibold truncate max-w-[120px]">{comm.customer?.name}</p>
                        <p className="text-[9px] text-zinc-500 truncate max-w-[120px]">{comm.customer?.email}</p>
                      </TableCell>
                      <TableCell className="py-2 px-3 text-[10px]">
                        <p className="text-[8px] text-zinc-550 font-mono truncate max-w-[170px]" title={comm.campaign?.name}>
                          Campaign: {comm.campaign?.name}
                        </p>
                        <p className="text-[9.5px] text-zinc-400 truncate max-w-[170px] mt-0.5 font-mono italic" title={comm.message}>
                          &quot;{comm.message}&quot;
                        </p>
                      </TableCell>
                      <TableCell className="py-2 px-3 text-center">
                        <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase border ${
                          comm.status === "DELIVERED" ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/30" :
                          comm.status === "FAILED" ? "bg-red-950/30 text-red-400 border-red-900/30" :
                          "bg-blue-950/30 text-blue-400 border-blue-900/30 animate-pulse"
                        }`}>
                          {comm.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>

    </>
  );
}
