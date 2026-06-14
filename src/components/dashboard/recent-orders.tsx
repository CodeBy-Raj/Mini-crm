import React from "react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { ShoppingBag } from "lucide-react";

interface Order {
  id: string;
  customerId: string;
  customer?: { id: string; name: string; email: string };
  amount: number;
  createdAt: Date | string;
}

interface RecentOrdersProps {
  orders: Order[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-500 bg-zinc-900/10 border border-zinc-800/40 rounded-2xl min-h-[220px]">
        <ShoppingBag size={36} className="text-zinc-700 mb-2.5" />
        <p className="text-xs font-mono font-medium text-zinc-400">No transactions recorded yet</p>
        <p className="text-[11px] text-zinc-600 mt-1 max-w-sm">
          Use the Database Seed Board above or drag-and-drop raw CSV transactions into the portal.
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

  const formatDate = (dateValue: Date | string) => {
    const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sliceLimit = 15;
  const displayedOrders = orders.slice(0, sliceLimit);

  // Helper for order tier badges
  const getOrderBadge = (amount: number) => {
    if (amount >= 500) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase bg-amber-950/40 text-amber-300 border border-amber-900/40 tracking-wider">
          💎 Whale Deal
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase bg-zinc-900/50 text-zinc-400">
        📦 Standard
      </span>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-mono px-1">
        <span className="text-zinc-500">Showing top {displayedOrders.length} most recent</span>
        <span className="text-indigo-400 font-bold bg-indigo-950/30 px-2 py-0.5 rounded border border-indigo-900/30">
          Scale: {orders.length} Orders Logged (DBMS Direct)
        </span>
      </div>

      <div className="border border-zinc-850 border-zinc-800/70 rounded-xl overflow-hidden bg-zinc-950/20">
        <Table>
          <TableHeader className="bg-zinc-950/40 border-b border-zinc-800/60">
            <TableRow className="hover:bg-transparent border-zinc-800/80">
              <TableHead className="font-mono text-[9.5px] text-zinc-500 uppercase tracking-wider py-3 px-4 h-auto">Order ID Reference</TableHead>
              <TableHead className="font-mono text-[9.5px] text-zinc-500 uppercase tracking-wider py-3 px-4 h-auto">Linked Customer Account</TableHead>
              <TableHead className="font-mono text-[9.5px] text-zinc-500 uppercase tracking-wider py-3 px-4 h-auto text-center">Volume</TableHead>
              <TableHead className="font-mono text-[9.5px] text-zinc-500 uppercase tracking-wider py-3 px-4 h-auto text-center">Purchase Date</TableHead>
              <TableHead className="font-mono text-[9.5px] text-zinc-500 uppercase tracking-wider py-3 px-4 h-auto text-right">Order Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-zinc-900/40">
            {displayedOrders.map((o) => (
              <TableRow key={o.id} className="border-zinc-900/60 hover:bg-zinc-900/20 transition-colors">
                <TableCell className="py-2.5 px-4 text-[10px] font-mono text-zinc-400 select-all truncate max-w-[100px]" title={o.id}>
                  {o.id}
                </TableCell>
                <TableCell className="py-2.5 px-4 text-xs text-blue-400 truncate max-w-[160px]" title={o.customer?.email}>
                  <span className="font-semibold text-zinc-200 block sm:inline mr-1">
                    {o.customer?.name || "System Ingestion"}
                  </span>
                  <span className="text-[10px] block sm:inline text-zinc-500 font-mono">
                    ({o.customer?.email || o.customerId})
                  </span>
                </TableCell>
                <TableCell className="py-2.5 px-4 text-center">
                  {getOrderBadge(o.amount)}
                </TableCell>
                <TableCell className="py-2.5 px-4 text-[10px] font-mono text-center text-zinc-500">
                  {formatDate(o.createdAt)}
                </TableCell>
                <TableCell className="py-2.5 px-4 text-[11px] font-mono text-right text-emerald-400 font-bold">
                  {formatCurrency(o.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
