"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Database,
  Trash2,
  Sparkles
} from "lucide-react";

interface CSVStatus {
  state: "idle" | "loading" | "success" | "error";
  message: string;
  skippedCount?: number;
  details?: string[];
}

interface CsvUploadSectionProps {
  onLogMessage: (message: string) => void;
}

export function CsvUploadSection({ onLogMessage }: CsvUploadSectionProps) {
  const router = useRouter();

  const [customerDragActive, setCustomerDragActive] = useState(false);
  const [orderDragActive, setOrderDragActive] = useState(false);

  const [customerUploadStatus, setCustomerUploadStatus] = useState<CSVStatus>({ state: "idle", message: "" });
  const [orderUploadStatus, setOrderUploadStatus] = useState<CSVStatus>({ state: "idle", message: "" });

  const [seedLoading, setSeedLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const customerInputRef = useRef<HTMLInputElement>(null);
  const orderInputRef = useRef<HTMLInputElement>(null);

  const handleSeedDemoseed = async () => {
    setSeedLoading(true);
    onLogMessage("- Requesting automated seeding of 1,000 Customers and 3,000 Orders in PostgreSQL...");
    try {
      const res = await fetch("/api/dashboard/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        onLogMessage("✓ Database Seeding completed cleanly!");
        onLogMessage(`✓ Loaded ${data.details.customersAdded} Customers and ${data.details.ordersAdded} Orders distributed across 1 year.`);
        router.refresh();
      } else {
        throw new Error(data.error || "Seeding API failed.");
      }
    } catch (e: any) {
      onLogMessage(`❌ Seeding Fault: ${e.message || e}`);
    } finally {
      setSeedLoading(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm("Are you sure you want to delete all customers, orders, and campaigns? This cannot be undone.")) return;
    setResetLoading(true);
    onLogMessage("- Requesting safe truncation of DB models (cascade purge)...");
    try {
      const res = await fetch("/api/dashboard/reset", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        onLogMessage("✓ Database safely reset. Zero customer index values active.");
        router.refresh();
      } else {
        throw new Error(data.error || "Reset API failed.");
      }
    } catch (e: any) {
      onLogMessage(`❌ Reset Fault: ${e.message || e}`);
    } finally {
      setResetLoading(false);
    }
  };

  const customerTemplateCSV = `name,email,phone,totalSpend,lastOrderDate
John Doe,john@example.com,+123456789,150.50,2026-05-15
Jane Smith,jane@example.com,+987654321,299.99,2026-06-01
Michael Scott,michael@dundermifflin.com,555-0199,45.00,2026-04-12
Dwayne Johnson,rock@hollywood.com,,1250.00,2026-06-10`;

  const orderTemplateCSV = `amount,email,createdAt,id
50.25,john@example.com,2026-06-05,order-uuid-101
100.25,john@example.com,2026-06-08,order-uuid-102
299.99,jane@example.com,2026-06-01,order-uuid-103
45.00,michael@dundermifflin.com,2026-04-12,order-uuid-104`;

  const uploadCSVContent = async (type: "customers" | "orders", rawCsvText: string) => {
    const statusSetter = type === "customers" ? setCustomerUploadStatus : setOrderUploadStatus;
    statusSetter({ state: "loading", message: "Parsing csv stream..." });
    onLogMessage(`- Triggering CSV ingest payload for [${type}]`);

    try {
      const response = await fetch(`/api/upload/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: rawCsvText }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        statusSetter({
          state: "success",
          message: data.message,
          skippedCount: data.skipped,
          details: data.errors,
        });
        
        onLogMessage(`✓ CSV Ingest completed [${type}]: ${data.message}`);
        if (data.skipped > 0) {
          onLogMessage(`⚠ Ingestion Warning: ${data.skipped} rows skipped due to invalid inputs.`);
        }

        // Trigger next.js server-side router refresh to refetch from DB
        router.refresh();
      } else {
        throw new Error(data.error || "File import failure.");
      }
    } catch (e: any) {
      statusSetter({
        state: "error",
        message: e.message || "An unexpected error occurred during import.",
      });
      onLogMessage(`❌ Ingest Error [${type}]: ${e.message || "Parsing error."}`);
    }
  };

  const handleFileChange = (type: "customers" | "orders", file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        uploadCSVContent(type, text);
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent, type: "customers" | "orders", active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "customers") setCustomerDragActive(active);
    else setOrderDragActive(active);
  };

  const handleDrop = (e: React.DragEvent, type: "customers" | "orders") => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "customers") setCustomerDragActive(false);
    else setOrderDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(type, e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Seeding and Control Board */}
      <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700/60 transition-all duration-305 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800 pb-4">
          <div>
            <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 font-mono">
              <Database size={15} className="text-emerald-500 animate-pulse" />
              Demo Dataset
            </h4>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
              Instant generation of massive datasets to demonstrate scalability & filtering.
            </p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleResetDatabase}
              disabled={resetLoading || seedLoading}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                resetLoading 
                  ? "bg-red-950/25 text-red-400 border-red-900/40 animate-pulse cursor-not-allowed" 
                  : "bg-red-950/40 hover:bg-red-900/55 text-red-400 border-red-900/40"
              }`}
            >
              <Trash2 size={13} />
              {resetLoading ? "Clearing DB..." : "Purge Database"}
            </button>

            <button
              onClick={handleSeedDemoseed}
              disabled={seedLoading || resetLoading}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                seedLoading 
                  ? "bg-emerald-950/25 text-emerald-400 border-emerald-900/40 animate-pulse cursor-not-allowed" 
                  : "bg-emerald-900 hover:bg-emerald-800 text-white border-emerald-700"
              }`}
            >
              <Sparkles size={13} className="text-amber-300" />
              {seedLoading ? "Seeding..." : "Load Demo Dataset (4,000 Rows)"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono text-[10px] text-zinc-400 bg-black/40 p-3 rounded-xl border border-zinc-800/60">
          <div>
            <span className="text-zinc-550 text-zinc-500 block font-bold text-[9px] uppercase tracking-wider">Customers Loaded</span>
            <span className="text-zinc-200 mt-0.5 block">1,000 Customers</span>
          </div>
          <div>
            <span className="text-zinc-550 text-zinc-500 block font-bold text-[9px] uppercase tracking-wider">Purchase History</span>
            <span className="text-zinc-200 mt-0.5 block">3,000 Orders</span>
          </div>
          <div>
            <span className="text-zinc-550 text-zinc-500 block font-bold text-[9px] uppercase tracking-wider">Load Time</span>
            <span className="text-emerald-400 mt-0.5 block font-bold">~ 2.5 seconds (Bulk)</span>
          </div>
          <div>
            <span className="text-zinc-550 text-zinc-500 block font-bold text-[9px] uppercase tracking-wider">Status</span>
            <span className="text-zinc-300 mt-0.5 block">Ready for segment logic</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
      {/* Customers Ingest Card */}
      <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-300">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
              <FileSpreadsheet size={15} className="text-blue-500" />
              Customer Upload
            </h4>
            <button
              onClick={() => uploadCSVContent("customers", customerTemplateCSV)}
              className="text-[9px] sm:text-[10px] bg-blue-950 hover:bg-blue-900 text-blue-400 border border-blue-900/50 px-2 py-0.5 rounded transition-colors font-mono font-medium"
            >
              Simulate Upload
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 mb-4 font-mono leading-relaxed">
            Fields: <code className="text-zinc-300">name</code>, <code className="text-zinc-300">email (key)</code>, <code className="text-zinc-300">phone</code>, <code className="text-zinc-300">totalSpend</code>, <code className="text-zinc-300">lastOrderDate</code>
          </p>

          {/* Drag Area */}
          <div
            onDragOver={(e) => handleDrag(e, "customers", true)}
            onDragLeave={(e) => handleDrag(e, "customers", false)}
            onDrop={(e) => handleDrop(e, "customers")}
            onClick={() => customerInputRef.current?.click()}
            className={`border border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              customerDragActive
                ? "border-blue-500 bg-blue-950/20 text-blue-400"
                : "border-zinc-800 hover:border-zinc-700 bg-black/10"
            }`}
          >
            <input
              type="file"
              ref={customerInputRef}
              onChange={(e) => handleFileChange("customers", e.target.files?.[0] || null)}
              accept=".csv"
              className="hidden"
            />
            <Upload size={24} className="text-zinc-500 mb-1.5 text-blue-400" />
            <p className="text-xs text-zinc-300 font-semibold mb-0.5">
              Drag & Drop <span className="text-blue-400">customers.csv</span> here
            </p>
            <p className="text-[10px] text-zinc-600 font-mono">Or click to select locally</p>
          </div>
        </div>

        {/* Upload feedback */}
        {customerUploadStatus.state !== "idle" && (
          <div className={`mt-3 p-3 rounded-xl border text-[11px] ${
            customerUploadStatus.state === "loading" ? "bg-blue-950/10 border-blue-900/20 text-blue-300 animate-pulse" :
            customerUploadStatus.state === "success" ? "bg-emerald-950/10 border-emerald-950/30 text-emerald-300" :
            "bg-red-950/10 border-red-950/30 text-red-350"
          }`}>
            <div className="flex items-center gap-1.5 font-bold font-mono">
              {customerUploadStatus.state === "loading" && <RefreshCw size={11} className="animate-spin" />}
              {customerUploadStatus.state === "success" && <CheckCircle2 size={11} className="text-emerald-400" />}
              {customerUploadStatus.state === "error" && <AlertTriangle size={11} className="text-rose-450" />}
              <span>INGEST STATUS: {customerUploadStatus.state.toUpperCase()}</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{customerUploadStatus.message}</p>
            
            {customerUploadStatus.details && customerUploadStatus.details.length > 0 && (
              <div className="mt-1.5 pt-1.5 border-t border-zinc-800/40 max-h-[80px] overflow-y-auto space-y-0.5 font-mono text-[9px] text-zinc-500">
                {customerUploadStatus.details.map((det, di) => (
                  <p key={di}>{det}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Orders Ingest Card */}
      <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-300">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
              <FileSpreadsheet size={15} className="text-indigo-500" />
              Order Upload
            </h4>
            <button
              onClick={() => uploadCSVContent("orders", orderTemplateCSV)}
              className="text-[9px] sm:text-[10px] bg-indigo-950 hover:bg-indigo-900 text-indigo-400 border border-indigo-900/50 px-2 py-0.5 rounded transition-colors font-mono font-medium"
            >
              Simulate Upload
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 mb-4 font-mono leading-relaxed">
            Fields: <code className="text-zinc-300">amount</code>, <code className="text-zinc-300">email</code>, <code className="text-zinc-300">createdAt</code>, <code className="text-zinc-300">id (optional)</code>
          </p>

          {/* Drag Area */}
          <div
            onDragOver={(e) => handleDrag(e, "orders", true)}
            onDragLeave={(e) => handleDrag(e, "orders", false)}
            onDrop={(e) => handleDrop(e, "orders")}
            onClick={() => orderInputRef.current?.click()}
            className={`border border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              orderDragActive
                ? "border-indigo-500 bg-indigo-950/20 text-indigo-400"
                : "border-zinc-800 hover:border-zinc-700 bg-black/10"
            }`}
          >
            <input
              type="file"
              ref={orderInputRef}
              onChange={(e) => handleFileChange("orders", e.target.files?.[0] || null)}
              accept=".csv"
              className="hidden"
            />
            <Upload size={24} className="text-zinc-500 mb-1.5 text-indigo-400" />
            <p className="text-xs text-zinc-300 font-semibold mb-0.5">
              Drag & Drop <span className="text-indigo-400">orders.csv</span> here
            </p>
            <p className="text-[10px] text-zinc-600 font-mono">Or click to select locally</p>
          </div>
        </div>

        {/* Upload feedback */}
        {orderUploadStatus.state !== "idle" && (
          <div className={`mt-3 p-3 rounded-xl border text-[11px] ${
            orderUploadStatus.state === "loading" ? "bg-indigo-950/10 border-indigo-900/20 text-indigo-300 animate-pulse" :
            orderUploadStatus.state === "success" ? "bg-emerald-950/10 border-emerald-950/30 text-emerald-300" :
            "bg-red-950/10 border-red-950/30 text-red-350"
          }`}>
            <div className="flex items-center gap-1.5 font-bold font-mono">
              {orderUploadStatus.state === "loading" && <RefreshCw size={11} className="animate-spin" />}
              {orderUploadStatus.state === "success" && <CheckCircle2 size={11} className="text-emerald-400" />}
              {orderUploadStatus.state === "error" && <AlertTriangle size={11} className="text-rose-450" />}
              <span>INGEST STATUS: {orderUploadStatus.state.toUpperCase()}</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{orderUploadStatus.message}</p>
            
            {orderUploadStatus.details && orderUploadStatus.details.length > 0 && (
              <div className="mt-1.5 pt-1.5 border-t border-zinc-800/40 max-h-[80px] overflow-y-auto space-y-0.5 font-mono text-[9px] text-zinc-500">
                {orderUploadStatus.details.map((det, di) => (
                  <p key={di}>{det}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
