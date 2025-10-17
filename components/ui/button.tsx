import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2 rounded-2xl";
  const variants: Record<string, string> = {
    default: "bg-amber-500 text-white hover:bg-amber-600",
    outline: "border border-slate-300 hover:bg-white/60",
    ghost: "hover:bg-slate-100",
  };
  return <button className={cn(base, variants[variant], className)} {...props} />;
}
