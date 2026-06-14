import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full animate-in fade-in duration-300">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
      <h2 className="text-xl font-bold tracking-tight text-zinc-100">Loading Route...</h2>
      <p className="text-zinc-500 text-sm font-mono mt-2">Fetching live database metrics</p>
    </div>
  );
}
