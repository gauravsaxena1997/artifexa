"use client";

import { Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StudioToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description: string;
  showInfoIcon?: boolean;
  className?: string;
}

export function StudioToggle({
  checked,
  onCheckedChange,
  disabled,
  label = "Intelligent Refinement",
  description,
  showInfoIcon = false,
  className = "",
}: StudioToggleProps) {
  return (
    <div className={`flex items-center justify-between rounded-xl border border-slate-200 bg-white shadow-sm px-4 py-3 hover:border-slate-300 transition-colors ${className}`}>
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {label}
          </p>
          {showInfoIcon && (
            <TooltipProvider delay={200}>
              <Tooltip>
                <TooltipTrigger render={
                  <span 
                    role="button" 
                    tabIndex={0}
                    className="text-slate-400 hover:text-indigo-600 transition-colors outline-none cursor-help inline-flex items-center"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </span>
                }>
                </TooltipTrigger>


                <TooltipContent side="top" className="max-w-[240px] p-2 text-[11px] leading-relaxed bg-slate-900 border-slate-800 text-white">
                  {description}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {!showInfoIcon && (
          <p className="text-[11px] text-slate-500 font-light leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="pl-3">
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
