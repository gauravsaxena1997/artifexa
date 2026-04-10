"use client";

interface ScoreBarProps {
  score: number;
  label?: string;
  max?: number;
}

export function ScoreBar({ score, label, max = 10 }: ScoreBarProps) {
  const pct = (score / max) * 100;
  
  const getColor = (s: number) => {
    const ratio = s / max;
    if (ratio >= 0.75) return "bg-[var(--success)]";
    if (ratio >= 0.5) return "bg-[var(--warning)]";
    return "bg-destructive";
  };

  const getLabel = (s: number) => {
    const ratio = s / max;
    if (ratio >= 0.9) return "Excellent";
    if (ratio >= 0.75) return "Good";
    if (ratio >= 0.5) return "Adequate";
    return "Needs Work";
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">{label || "Quality Score"}</span>
        <span className="font-bold text-slate-900">
          {score}/{max} — <span className="text-slate-500 font-normal">{getLabel(score)}</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/50">
        <div 
          className={`h-full rounded-full ${getColor(score)} transition-all duration-700 ease-out`} 
          style={{ width: `${pct}%` }} 
        />
      </div>
    </div>
  );
}
