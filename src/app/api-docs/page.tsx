"use client";

import React, { useState, useEffect } from "react";
import { 
  Terminal, 
  Code, 
  Copy, 
  Check, 
  Play, 
  FileJson, 
  Search, 
  Database,
  RefreshCw,
  Cpu,
  Info,
  ShieldCheck,
  Upload,
  RefreshCcw,
  Trash2,
  Lock
} from "lucide-react";

interface Endpoint {
  id: string;
  method: "GET" | "POST" | "DELETE";
  path: string;
  category: "Dashboard" | "Audience" | "Campaigns" | "Optimization" | "Uploads" | "Maintenance";
  summary: string;
  description: string;
  parameters?: {
    name: string;
    in: "query" | "header";
    required: boolean;
    type: string;
    description: string;
    default?: string;
  }[];
  requestBody?: string;
}

// List of documented APIs matching the openapi spec
const endpoints2: Endpoint[] = [
  {
    id: "dashboard-stats",
    method: "GET",
    path: "/api/dashboard/stats",
    category: "Dashboard",
    summary: "Retrieve CRM overview metrics",
    description: "Fetches aggregated performance KPIs including total customer count, purchase transactions, raw sales revenues, and dynamic lifetime spend calculations. Also returns lists of recent customers and transactions to display in live CRM modules.",
    parameters: []
  },
  {
    id: "segmentation-build",
    method: "POST",
    path: "/api/segmentation",
    category: "Audience",
    summary: "Filter CRM audience with AI prompting",
    description: "Applies Gemini natural language processing to map plain English descriptions into optimized SQL filters. Executes the filters against the database, returning matching records, the computed SQL condition, and a natural language rationale.",
    requestBody: JSON.stringify({
      prompt: "customers from New York who spent more than $300"
    }, null, 2)
  },
  {
    id: "campaign-list",
    method: "GET",
    path: "/api/campaign",
    category: "Campaigns",
    summary: "List campaign drafts or review dispatch performance",
    description: "Returns saved campaign configurations (drafts) or detailed metrics. If the 'type' parameter is set to 'metrics', it aggregates status tallies and logs across launched activities.",
    parameters: [
      {
        name: "type",
        in: "query",
        required: false,
        type: "string",
        description: "Filter parameter. Set to 'metrics' to list live run statistics. Omit or leave blank to list saved drafts.",
        default: ""
      }
    ]
  },
  {
    id: "campaign-generate",
    method: "POST",
    path: "/api/campaign",
    category: "Campaigns",
    summary: "Design campaign copy based on goals",
    description: "Funnels target business marketing objectives through the AI generator to draft attractive copy, recommended channels, and execution rationales tailored to target audience segments.",
    requestBody: JSON.stringify({
      action: "generate",
      goal: "Attract regular customers to try out our new premium fleece hoodies with a special discount code cozy50"
    }, null, 2)
  },
  {
    id: "campaign-save",
    method: "POST",
    path: "/api/campaign",
    category: "Campaigns",
    summary: "Save designed campaign as a draft",
    description: "Stores campaign metrics, channels, content copy, and explanations into the relational backend for future editing or launching.",
    requestBody: JSON.stringify({
      action: "save",
      name: "Premium hoodie winter drive",
      channel: "EMAIL",
      message: "Stay warm! Get 15% off our new premium fleece hoodies with code WARM15 at checkout.",
      reason: "Targeting high-frequency buyers with seasonal offerings"
    }, null, 2)
  },
  {
    id: "campaign-launch",
    method: "POST",
    path: "/api/campaign",
    category: "Campaigns",
    summary: "Activate and dispatch marketing communications",
    description: "Executes actual campaign dispatches. It filters targeted consumers, maps template parameters (e.g. {{name}}), records delivery communications, and outputs log tracking variables.",
    requestBody: JSON.stringify({
      action: "launch",
      name: "Cozy Fleece Fall Launch",
      channel: "EMAIL",
      message: "Hi {{name}}, autumn is here! Enjoy 15% off all knits. Code: AUTUMN15",
      audiencePrompt: "Customers who spent over $100 and live in California"
    }, null, 2)
  },
  {
    id: "campaign-delete",
    method: "DELETE",
    path: "/api/campaign",
    category: "Campaigns",
    summary: "Delete a saved campaign draft",
    description: "Permanently removes designated campaign records from the relational backend.",
    parameters: [
      {
        name: "id",
        in: "query",
        required: true,
        type: "string",
        description: "Unique string UUID/ID matching the draft to remove.",
        default: ""
      }
    ]
  },
  {
    id: "optimization-get",
    method: "GET",
    path: "/api/optimization",
    category: "Optimization",
    summary: "Review AI content optimization advice",
    description: "Retrieves generated recommendations and analytical critiques concerning specific sent campaigns to evaluate and adjust marketing models.",
    parameters: [
      {
        name: "campaignId",
        in: "query",
        required: true,
        type: "string",
        description: "Registered campaign ID linking back to logs.",
        default: ""
      }
    ]
  },
  {
    id: "optimization-create",
    method: "POST",
    path: "/api/optimization",
    category: "Optimization",
    summary: "Trigger immediate audience optimization advice",
    description: "Inspects specific metrics and channel communication outcomes to deliver smart recommendations for scheduling adjustments and message tweaks.",
    requestBody: JSON.stringify({
      campaignId: "replace-with-active-campaign-id"
    }, null, 2)
  },
  {
    id: "upload-customers",
    method: "POST",
    path: "/api/upload/customers",
    category: "Uploads",
    summary: "Bulk upload customers using CSV raw payload",
    description: "Parses, cleans, and ingests bulk customer rows direct to the database. Maps name, email, phone, and optional location properties cleanly.",
    requestBody: JSON.stringify({
      csv: "name,email,phone,location\nAlice Walker,alice@test.com,555-0192,New York\nBob Simmons,bob@test.com,555-0104,San Francisco"
    }, null, 2)
  },
  {
    id: "upload-orders",
    method: "POST",
    path: "/api/upload/orders",
    category: "Uploads",
    summary: "Bulk upload orders using CSV raw payload",
    description: "Parses CSV of order histories. Resolves customer email linkages, sums up spend totals, and recalculates key statistical counters on the spot.",
    requestBody: JSON.stringify({
      csv: "customerEmail,totalAmount,items\nalice@test.com,320.50,Premium Jacket\nbob@test.com,95.00,Classic Cap"
    }, null, 2)
  },
  {
    id: "db-seed",
    method: "POST",
    path: "/api/dashboard/seed",
    category: "Maintenance",
    summary: "Populate mock CRM records instantly",
    description: "Wipes standard application metrics and runs fresh high-quality seed configurations to simulate consumer spend tracks, past recommendations, active draft campaigns, and dispatch queues.",
    parameters: []
  },
  {
    id: "db-reset",
    method: "POST",
    path: "/api/dashboard/reset",
    category: "Maintenance",
    summary: "Flush databases cleanly",
    description: "Purges custom campaign records, dispatch statistics, segmentation parameters, and customer transactional data to zero-out dashboards.",
    parameters: []
  }
];

export default function ApiDocsPage() {
  const [activeTab, setActiveTab2] = useState<"interactive" | "swagger-json">("interactive");
  const [searchQuery2, setSearchQuery2] = useState("");
  const [selectedEndpoint2, setSelectedEndpoint2] = useState<string>("dashboard-stats");
  const [copiedKey2, setCopiedKey2] = useState<string | null>(null);

  // Client-side execution state
  const [parameterValues2, setParameterValues2] = useState<Record<string, string>>({});
  const [requestBodyValue2, setRequestBodyValue2] = useState<string>("");
  const [responseStatus2, setResponseStatus2] = useState<number | null>(null);
  const [responseTime2, setResponseTime2] = useState<number | null>(null);
  const [responseData2, setResponseData2] = useState<any>(null);
  const [loading2, setLoading2] = useState(false);

  // Dynamic values helper (drafts/campaigns in system to simplify copy-pasting for testing!)
  const [knownCampaigns2, setKnownCampaigns2] = useState<any[]>([]);
  const [knownDrafts2, setKnownDrafts2] = useState<any[]>([]);
  const [loadingSystemData2, setLoadingSystemData2] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey2(key);
    setTimeout(() => setCopiedKey2(null), 2000);
  };

  const refreshSuggestions = async () => {
    setLoadingSystemData2(true);
    try {
      const resDrafts = await fetch("/api/campaign");
      if (resDrafts.ok) {
        const d = await resDrafts.json();
        if (d.success && d.drafts) {
          setKnownDrafts2(d.drafts);
        }
      }
      
      const resMetrics = await fetch("/api/campaign?type=metrics");
      if (resMetrics.ok) {
        const m = await resMetrics.json();
        if (m.success) {
          setKnownCampaigns2(m.campaigns || []);
        }
      }
    } catch (e) {
      console.error("[Suggestions Loader Error]:", e);
    } finally {
      setLoadingSystemData2(false);
    }
  };

  useEffect(() => {
    refreshSuggestions();
  }, []);

  const curEndpoint = endpoints2.find(e => e.id === selectedEndpoint2) || endpoints2[0];

  useEffect(() => {
    const initParams: Record<string, string> = {};
    if (curEndpoint.parameters) {
      curEndpoint.parameters.forEach(p => {
        initParams[p.name] = p.default || "";
      });
    }
    setParameterValues2(initParams);
    setRequestBodyValue2(curEndpoint.requestBody || "");
    setResponseStatus2(null);
    setResponseTime2(null);
    setResponseData2(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEndpoint2]);

  const handleParamChange = (name: string, val: string) => {
    setParameterValues2(prev => ({ ...prev, [name]: val }));
  };

  const handleGenerateCurl = () => {
    let url = curEndpoint.path;
    const queryParams: string[] = [];

    if (curEndpoint.parameters) {
      curEndpoint.parameters.forEach(p => {
        if (p.in === "query" && parameterValues2[p.name]) {
          queryParams.push(`${p.name}=${encodeURIComponent(parameterValues2[p.name])}`);
        }
      });
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join("&")}`;
    }

    let curl = `curl -X ${curEndpoint.method} "http://localhost:3000${url}"`;
    curl += ` \\\n  -H "Content-Type: application/json"`;

    if (curEndpoint.method !== "GET" && requestBodyValue2) {
      try {
        const parsed = JSON.parse(requestBodyValue2);
        curl += ` \\\n  -d '${JSON.stringify(parsed)}'`;
      } catch {
        curl += ` \\\n  -d '${requestBodyValue2.replace(/\n\s*/g, "")}'`;
      }
    }

    return curl;
  };

  const executeApiRequest = async () => {
    setLoading2(true);
    setResponseStatus2(null);
    setResponseData2(null);
    const startTime = performance.now();

    try {
      let url = curEndpoint.path;
      const queryParams: string[] = [];

      if (curEndpoint.parameters) {
        curEndpoint.parameters.forEach(p => {
          if (p.in === "query" && parameterValues2[p.name]) {
            queryParams.push(`${p.name}=${encodeURIComponent(parameterValues2[p.name])}`);
          }
        });
      }

      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
      }

      const options: RequestInit = {
        method: curEndpoint.method,
        headers: {
          "Content-Type": "application/json"
        }
      };

      if (curEndpoint.method !== "GET" && requestBodyValue2) {
        try {
          JSON.parse(requestBodyValue2);
        } catch (e: any) {
          throw new Error("Invalid request body configuration. Verify the JSON content parameters.");
        }
        options.body = requestBodyValue2;
      }

      const res = await fetch(url, options);
      const endTime = performance.now();
      const rawText = await res.text();

      let resData: any;
      try {
        resData = JSON.parse(rawText);
      } catch {
        // Server returned non-JSON (e.g. HTML error page on 500)
        resData = { error: `Server returned non-JSON response (HTTP ${res.status})`, raw: rawText.slice(0, 300) };
      }

      setResponseStatus2(res.status);
      setResponseTime2(Math.round(endTime - startTime));
      setResponseData2(resData);

      if (curEndpoint.id.includes("campaign-") || curEndpoint.id.includes("segmentation-") || curEndpoint.id.includes("db-")) {
        refreshSuggestions();
      }
    } catch (err: any) {
      const endTime = performance.now();
      setResponseStatus2(500);
      setResponseTime2(Math.round(endTime - startTime));
      setResponseData2({ error: err.message || "Failed to finalize HTTP request execution." });
    } finally {
      setLoading2(false);
    }
  };

  const filteredEndpoints = endpoints2.filter(e => {
    const term = searchQuery2.toLowerCase();
    return e.path.toLowerCase().includes(term) || 
           e.summary.toLowerCase().includes(term) || 
           e.category.toLowerCase().includes(term) ||
           e.method.toLowerCase().includes(term);
  });

  return (
    <div className="flex flex-col gap-6 w-full text-zinc-100 font-sans" id="api-docs-main-container">
      {/* Top Deck Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-40 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div>
          <h1 className="text-xl sm:text-2xl text-white font-black tracking-tight bg-clip-text text-transparent flex items-center gap-2">
            <Cpu className="text-white " size={24} />
            CRM API Console
          </h1>
          <p className="text-xs text-zinc-400 max-w-2xl mt-1 leading-relaxed">
            Discover and interact directly with authentic system REST handlers powering CRM. Feed requests, submit parameters, check real response payloads, and capture cURL examples below.
          </p>
        </div>

        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 self-stretch md:self-auto shadow-inner text-xs">
          <button
            onClick={() => setActiveTab2("interactive")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-medium tracking-tight transition-all cursor-pointer ${
              activeTab === "interactive"
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/50"
                : "text-zinc-500 hover:text-zinc-350"
            }`}
          >
            <Terminal size={12} />
            Interactive Console
          </button>
          <button
            onClick={() => setActiveTab2("swagger-json")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-medium tracking-tight transition-all cursor-pointer ${
              activeTab === "swagger-json"
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/50"
                : "text-zinc-500 hover:text-zinc-350"
            }`}
          >
            <FileJson size={12} />
            Swagger OAS JSON
          </button>
        </div>
      </div>

      {activeTab === "interactive" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* List panel */}
          <div className="lg:col-span-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search database APIs..."
                value={searchQuery2}
                onChange={(e) => setSearchQuery2(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs font-mono text-zinc-200 placeholder-zinc-550 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
              <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase px-1">
                API Handlers Group
              </span>

              {filteredEndpoints.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500 font-mono">
                  No matching endpoints
                </div>
              ) : (
                filteredEndpoints.map((endpoint) => {
                  const isSelected = endpoint.id === selectedEndpoint2;
                  let methodBg = "bg-indigo-950/40 text-indigo-400 border-indigo-500/20";
                  if (endpoint.method === "GET") methodBg = "bg-emerald-950/40 text-emerald-400 border-emerald-500/20";
                  if (endpoint.method === "DELETE") methodBg = "bg-rose-950/40 text-rose-400 border-rose-500/20";

                  return (
                    <button
                      key={endpoint.id}
                      onClick={() => setSelectedEndpoint2(endpoint.id)}
                      className={`text-left p-2.5 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                        isSelected 
                          ? "bg-zinc-900 border-zinc-700 shadow-sm" 
                          : "bg-zinc-900/40 border-zinc-950 hover:bg-zinc-900/70 hover:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded border ${methodBg}`}>
                          {endpoint.method}
                        </span>
                        <code className="text-[10px] font-mono text-zinc-300 truncate tracking-tight">
                          {endpoint.path}
                        </code>
                      </div>
                      <span className="text-[11px] font-medium text-zinc-400 tracking-tight pl-1 truncate">
                        {endpoint.summary}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Quick Helper copysheet */}
            <div className="border-t border-zinc-805 pt-4 flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                  CRM Live UUIDs Copy Assistant
                </span>
                <button 
                  onClick={refreshSuggestions} 
                  title="Reload Live IDs"
                  disabled={loadingSystemData2}
                  className="text-zinc-500 hover:text-indigo-400 transition"
                >
                  <RefreshCw size={10} className={loadingSystemData2 ? "animate-spin" : ""} />
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto bg-zinc-900/30 p-2.5 rounded-xl border border-zinc-900 font-mono text-[10px]">
                {loadingSystemData2 && <div className="text-zinc-550 text-center py-1">Connecting...</div>}
                
                {!loadingSystemData2 && knownCampaigns2.length === 0 && knownDrafts2.length === 0 && (
                  <div className="text-zinc-550 text-center py-1">
                    No active campaign structures detected. Create a draft or launch to pop suggestions.
                  </div>
                )}

                {knownCampaigns2.length > 0 && (
                  <div>
                    <span className="text-indigo-400 text-[9px] font-semibold block mb-1">Launched Campaigns:</span>
                    <div className="space-y-1">
                      {knownCampaigns2.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-1 rounded bg-zinc-850 hover:bg-zinc-800 group">
                          <span className="text-zinc-400 truncate max-w-[120px]">{item.name}</span>
                          <span className="text-zinc-550 text-[9px]">{item.id.slice(0, 8)}...</span>
                          <button
                            onClick={() => handleCopy(item.id, `id-${item.id}`)}
                            className="text-[9px] text-zinc-500 hover:text-indigo-300 font-sans cursor-pointer shrink-0 ml-1"
                          >
                            {copiedKey2 === `id-${item.id}` ? "Copied" : "Copy ID"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {knownDrafts2.length > 0 && (
                  <div className="mt-2">
                    <span className="text-amber-400 text-[9px] font-semibold block mb-1">Saved Design Drafts:</span>
                    <div className="space-y-1">
                      {knownDrafts2.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-1 rounded bg-zinc-850 hover:bg-zinc-800 group">
                          <span className="text-zinc-400 truncate max-w-[120px]">{item.name}</span>
                          <span className="text-zinc-550 text-[9px]">{item.id.slice(0, 8)}...</span>
                          <button
                            onClick={() => handleCopy(item.id, `id-${item.id}`)}
                            className="text-[9px] text-zinc-500 hover:text-indigo-300 font-sans cursor-pointer shrink-0 ml-1"
                          >
                            {copiedKey2 === `id-${item.id}` ? "Copied" : "Copy ID"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Playground panel */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-800/60 pb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                    curEndpoint.method === "GET" 
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/20" 
                      : curEndpoint.method === "POST" 
                        ? "bg-indigo-950/40 text-indigo-400 border-indigo-500/20" 
                        : "bg-rose-950/40 text-rose-400 border-rose-500/20"
                  }`}>
                    {curEndpoint.method}
                  </span>
                  <code className="text-xs font-mono text-zinc-205 tracking-tight font-semibold">
                    {curEndpoint.path}
                  </code>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  Headers: <b className="text-zinc-400">Content-Type: application/json</b>
                </span>
              </div>

              <div>
                <h3 className="text-xs font-mono font-medium text-zinc-350 tracking-wider uppercase mb-1 flex items-center gap-1.5">
                  <Info size={11} className="text-indigo-400" />
                  Route Details
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                  {curEndpoint.description}
                </p>
              </div>

              {curEndpoint.parameters && curEndpoint.parameters.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-mono font-medium text-zinc-350 tracking-wider uppercase flex items-center gap-1.5">
                    <Database size={11} className="text-emerald-400" />
                    Query Parameters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-zinc-900/30 p-3 rounded-xl border border-zinc-900/60">
                    {curEndpoint.parameters.map((p) => (
                      <div key={p.name} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-mono text-zinc-300 font-bold">
                            {p.name}
                            {p.required && <span className="text-red-400 ml-0.5">*</span>}
                          </label>
                          <span className="text-[9px] font-mono text-zinc-550 uppercase bg-zinc-950 px-1 py-0.5 rounded">
                            {p.type}
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder={p.description}
                          value={parameterValues2[p.name] || ""}
                          onChange={(e) => handleParamChange(p.name, e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs font-mono text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-indigo-500/50"
                        />
                        <span className="text-[9px] text-zinc-500 leading-none">{p.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {curEndpoint.method !== "GET" && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-mono font-medium text-zinc-350 tracking-wider uppercase flex items-center gap-1.5">
                      <Code size={11} className="text-indigo-400" />
                      JSON Raw Payload
                    </h3>
                    <button
                      onClick={() => setRequestBodyValue2(curEndpoint.requestBody || "{}")}
                      className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      Reset Body
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={requestBodyValue2}
                    onChange={(e) => setRequestBodyValue2(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-indigo-200 focus:outline-none focus:border-indigo-500/50 resize-y"
                  />
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={executeApiRequest}
                  disabled={loading2}
                  className="bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/10 transition-all font-mono text-xs font-bold text-white px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading2 ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      Fetching Response...
                    </>
                  ) : (
                    <>
                      <Play size={13} className="fill-current text-white" />
                      Test Live Request (Try It Out)
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* cURL Display */}
            <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                  CURL equivalent command
                </span>
                <button
                  onClick={() => handleCopy(handleGenerateCurl(), "curl")}
                  className="p-1 px-2.5 hover:bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedKey2 === "curl" ? (
                    <>
                      <Check size={11} className="text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      Copy cURL
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-900 font-mono text-[10px] text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-tight">
                {handleGenerateCurl()}
              </pre>
            </div>

            {/* Real Response Board */}
            <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <h3 className="text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
                  Execution Payload Response
                </h3>

                <div className="flex items-center gap-4 text-xs font-mono">
                  {responseStatus2 !== null && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">Status:</span>
                      <span className={`font-bold px-1.5 py-0.5 rounded ${
                        responseStatus2 >= 200 && responseStatus2 < 300 
                          ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" 
                          : "bg-rose-950/40 text-rose-400 border border-rose-500/20"
                      }`}>
                        {responseStatus2}
                      </span>
                    </div>
                  )}

                  {responseTime2 !== null && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">Latency:</span>
                      <span className="text-zinc-300 font-bold">{responseTime2} ms</span>
                    </div>
                  )}
                </div>
              </div>

              {loading2 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-500">
                  <RefreshCw size={24} className="animate-spin text-indigo-500" />
                  <span className="text-xs font-mono">Simulating pipeline processing & transactional commit...</span>
                </div>
              ) : responseData2 ? (
                <div className="relative max-h-[400px] overflow-auto rounded-xl border border-zinc-900">
                  <button
                    onClick={() => handleCopy(JSON.stringify(responseData2, null, 2), "response")}
                    className="absolute right-3 top-3 p-1 px-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedKey2 === "response" ? (
                      <>
                        <Check size={11} className="text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        Copy Response
                      </>
                    )}
                  </button>
                  <pre className="bg-zinc-900/60 p-4 font-mono text-[11px] text-amber-200/90 whitespace-pre overflow-x-auto leading-relaxed">
                    {JSON.stringify(responseData2, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                  <Terminal size={20} className="text-zinc-650 mb-2" />
                  <p className="text-xs font-sans text-zinc-500 font-medium">Awaiting parameter guidelines</p>
                  <p className="text-[10px] font-mono text-zinc-600 mt-0.5">Choose an endpoint, configure inputs, and click &apos;Test Live Request&apos;.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Raw OpenAPI Tab */
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/60 pb-4">
            <div>
              <h2 className="text-xs font-mono font-bold tracking-wider text-zinc-300 flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                Raw OpenAPI 3.0 Specification
              </h2>
              <p className="text-[11px] font-sans text-zinc-500 mt-0.5 text-zinc-450">
                OAS definition perfect for Postman imports, Swagger libraries, and automated SDK codegen tools.
              </p>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <a
                href="/api/openapi"
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center font-mono text-[10px] font-bold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-2 rounded-lg cursor-pointer transition"
              >
                Open in Raw View
              </a>
              <button
                onClick={async () => {
                  try {
                    const r = await fetch("/api/openapi");
                    const json = await r.json();
                    handleCopy(JSON.stringify(json, null, 2), "raw-spec");
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 font-mono text-[10px] font-bold text-white px-3 py-2 rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                {copiedKey2 === "raw-spec" ? (
                  <>
                    <Check size={11} className="text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    Copy Schema
                  </>
                )}
              </button>
            </div>
          </div>

          <SpecViewer />
        </div>
      )}
    </div>
  );
}

function SpecViewer() {
  const [spec, setSpec] = useState<string>("Loading API descriptor spec...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/openapi")
      .then((res) => {
        if (!res.ok) throw new Error("Specification read error occurred.");
        return res.json();
      })
      .then((data) => {
        setSpec(JSON.stringify(data, null, 2));
        setLoading(false);
      })
      .catch((e) => {
        setSpec(`// Failed to fetch Schema Spec Manifest: ${e.message}`);
        setLoading(false);
      });
  }, []);

  return (
    <pre className="bg-zinc-900/60 p-4 border border-zinc-900 rounded-xl font-mono text-xs text-indigo-300 overflow-x-auto whitespace-pre leading-relaxed h-[55vh] max-h-[600px]">
      {spec}
    </pre>
  );
}
