import React from "react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { User, ClipboardList } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  totalSpend: number;
  lastOrderDate: Date | string | null;
  createdAt: Date | string;
}

interface RecentCustomersProps {
  customers: Customer[];
}

export function RecentCustomers({ customers }: RecentCustomersProps) {
  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-500 bg-zinc-900/10 border border-zinc-800/40 rounded-2xl min-h-[220px]">
        <User size={36} className="text-zinc-700 mb-2.5" />
        <p className="text-xs font-mono font-medium text-zinc-400">No customers registered yet</p>
        <p className="text-[11px] text-zinc-600 mt-1 max-w-sm">
          Awaiting input records. Use the Seed Board above or upload a custom CSV template.
        </p>
      </div>
    );
  }

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

  const sliceLimit = 15;
  const displayedCustomers = customers.slice(0, sliceLimit);

  // Helper to resolve custom badges
  const getTierBadge = (spend: number) => {
    if (spend >= 1000) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase bg-amber-950/40 text-amber-300 border border-amber-900/40 shadow-sm">
          👑 Gold VIP
        </span>
      );
    }
    if (spend >= 500) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase bg-indigo-950/40 text-indigo-300 border border-indigo-900/45">
          ⭐ Silver Loyalty
        </span>
      );
    }
    if (spend >= 150) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase bg-emerald-950/20 text-emerald-405 text-emerald-400 border border-emerald-900/30">
          ✓ Active
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase bg-zinc-900/40 text-zinc-550 text-zinc-500 border border-zinc-905 border-zinc-800/40">
        Core Account
      </span>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-mono px-1">
        <span className="text-zinc-550 text-zinc-500">Showing top {displayedCustomers.length} most recent</span>
        <span className="text-emerald-400 font-bold bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/30">
          Scale: {customers.length} Customers Indexed (DBMS Direct)
        </span>
      </div>

      <div className="border border-zinc-850 border-zinc-800/70 rounded-xl overflow-hidden bg-zinc-950/20">
        <Table>
          <TableHeader className="bg-zinc-950/40 border-b border-zinc-800/60">
            <TableRow className="hover:bg-transparent border-zinc-800/80">
              <TableHead className="font-mono text-[9.5px] text-zinc-500 uppercase tracking-wider py-3 px-4 h-auto">Customer Name</TableHead>
              <TableHead className="font-mono text-[9.5px] text-zinc-500 uppercase tracking-wider py-3 px-4 h-auto">Email Address</TableHead>
              <TableHead className="font-mono text-[9.5px] text-zinc-500 uppercase tracking-wider py-3 px-4 h-auto text-center">Status Tier</TableHead>
              <TableHead className="font-mono text-[9.5px] text-zinc-500 uppercase tracking-wider py-3 px-4 h-auto text-right">Total Invested</TableHead>
              <TableHead className="font-mono text-[9.5px] text-zinc-500 uppercase tracking-wider py-3 px-4 h-auto text-center">Last Purchase</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-zinc-900/40">
            {displayedCustomers.map((c) => (
              <TableRow key={c.id} className="border-zinc-900/60 hover:bg-zinc-900/20 transition-colors">
                <TableCell className="py-2.5 px-4 text-xs font-semibold text-zinc-100 flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center text-[9px] font-mono text-zinc-400 font-bold select-none shrink-0">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[120px]" title={c.name}>{c.name}</span>
                </TableCell>
                <TableCell className="py-2.5 px-4 text-[11px] font-mono text-zinc-400 truncate max-w-[150px]" title={c.email}>
                  {c.email}
                </TableCell>
                <TableCell className="py-2.5 px-4 text-center">
                  {getTierBadge(c.totalSpend)}
                </TableCell>
                <TableCell className="py-2.5 px-4 text-[11px] font-mono text-right text-emerald-400 font-bold">
                  {formatCurrency(c.totalSpend)}
                </TableCell>
                <TableCell className="py-2.5 px-4 text-[11px] font-mono text-center text-zinc-450 text-zinc-500">
                  {formatDate(c.lastOrderDate)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
