import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
  variant?: "default" | "blue" | "indigo" | "emerald";
}

export function StatsCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
  variant = "default",
}: StatsCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "blue":
        return {
          iconBg: "bg-blue-950/40 border-blue-900/30 text-blue-400",
          glow: "shadow-blue-500/5",
        };
      case "indigo":
        return {
          iconBg: "bg-indigo-950/40 border-indigo-900/30 text-indigo-400",
          glow: "shadow-indigo-500/5",
        };
      case "emerald":
        return {
          iconBg: "bg-emerald-950/40 border-emerald-900/30 text-emerald-400",
          glow: "shadow-emerald-500/5",
        };
      default:
        return {
          iconBg: "bg-zinc-900/50 border-zinc-800 text-zinc-400",
          glow: "",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Card className={cn("bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700/60 transition-all duration-300 shadow-lg", styles.glow, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-5">
        <div className="space-y-1">
          <CardTitle className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider font-semibold">
            {title}
          </CardTitle>
        </div>
        <div className={cn("p-2 border rounded-xl", styles.iconBg)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-5">
        <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white mb-1.5">
          {value}
        </div>
        {(description || trend) && (
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-zinc-500">
            {trend && (
              <span className={cn("font-medium", trend.isPositive ? "text-emerald-400" : "text-rose-400")}>
                {trend.value}
              </span>
            )}
            {description && <span className="text-zinc-500 truncate">{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
