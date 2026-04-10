"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProcessMonitor } from "@/components/studio/ProcessMonitor";
import type { StudioEvent, StudioStage } from "@/components/studio/ProcessMonitor";
import type { StudioRunMeta } from "@/hooks/useStudioStream";

interface StudioProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: StudioEvent[];
  isRunning: boolean;
  runMeta: StudioRunMeta | null;
  stageMeta: StudioStage[];
}

export function StudioProcessDialog({
  open,
  onOpenChange,
  events,
  isRunning,
  runMeta,
  stageMeta,
}: StudioProcessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-none w-screen h-[100dvh] sm:w-[95vw] sm:h-[85vh] p-0 sm:!max-w-4xl overflow-hidden border-0 sm:border sm:border-slate-200 bg-white shadow-2xl flex flex-col gap-0 rounded-none sm:rounded-2xl"
        showCloseButton={!isRunning}
      >
        <div className="flex-1 min-h-0 bg-white">
          <ProcessMonitor
            events={events}
            isRunning={isRunning}
            runMeta={runMeta}
            stages={stageMeta}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
