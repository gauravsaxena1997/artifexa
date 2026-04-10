"use client";

import { useMemo, useState, useLayoutEffect } from "react";
import { MessageSquareQuote, Check } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import type { ClarificationAnswer, ClarificationPlan } from "@/types/clarification";

interface ClarificationDialogProps {
  open: boolean;
  plan: ClarificationPlan | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (answers: ClarificationAnswer[]) => void;
}

type AnswersState = Record<
  string,
  {
    selectedOptionIds: string[];
    optionTexts: Record<string, string>;
  }
>;

function hasTextValue(value?: string) {
  return Boolean(value && value.trim().length > 0);
}

export function ClarificationDialog({
  open,
  plan,
  loading,
  onClose,
  onSubmit,
}: ClarificationDialogProps) {
  const [answersState, setAnswersState] = useState<AnswersState>({});

  // Reset answers synchronously before paint when dialog closes or plan changes
  useLayoutEffect(() => {
    if (!open) {
      setTimeout(() => setAnswersState({}), 0);
    }
  }, [open, plan?.intentSummary]);

  const questions = plan?.questions ?? [];

  const isValid = useMemo(() => {
    if (!plan) return false;

    return plan.questions.every((question) => {
      const state = answersState[question.id];
      const selected = state?.selectedOptionIds ?? [];

      if (question.required && selected.length === 0) {
        return false;
      }

      return selected.every((optionId) => {
        const option = question.options.find((item) => item.id === optionId);
        if (!option?.allowsText) return true;
        return hasTextValue(state?.optionTexts?.[optionId]);
      });
    });
  }, [answersState, plan]);

  const setSingleAnswer = (questionId: string, optionId: string) => {
    setAnswersState((prev) => ({
      ...prev,
      [questionId]: {
        selectedOptionIds: [optionId],
        optionTexts: prev[questionId]?.optionTexts ?? {},
      },
    }));
  };

  const toggleMultiAnswer = (
    questionId: string,
    optionId: string,
    maxSelections: number
  ) => {
    setAnswersState((prev) => {
      const current = prev[questionId]?.selectedOptionIds ?? [];
      const exists = current.includes(optionId);
      const next = exists
        ? current.filter((id) => id !== optionId)
        : current.length >= maxSelections
          ? current
          : [...current, optionId];

      return {
        ...prev,
        [questionId]: {
          selectedOptionIds: next,
          optionTexts: prev[questionId]?.optionTexts ?? {},
        },
      };
    });
  };

  const setOptionText = (questionId: string, optionId: string, text: string) => {
    setAnswersState((prev) => ({
      ...prev,
      [questionId]: {
        selectedOptionIds: prev[questionId]?.selectedOptionIds ?? [],
        optionTexts: {
          ...(prev[questionId]?.optionTexts ?? {}),
          [optionId]: text,
        },
      },
    }));
  };

  const handleSubmit = () => {
    if (!plan) return;
    const answers: ClarificationAnswer[] = plan.questions.map((question) => {
      const state = answersState[question.id];
      return {
        questionId: question.id,
        selectedOptionIds: state?.selectedOptionIds ?? [],
        optionTexts: state?.optionTexts ?? {},
      };
    });

    onSubmit(answers);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <DialogContent className="!max-w-none w-screen h-[100dvh] sm:w-[90vw] sm:h-[85vh] sm:!max-w-2xl p-0 rounded-none sm:rounded-2xl border-0 sm:border border-slate-200 overflow-hidden flex flex-col gap-0 bg-white shadow-2xl" showCloseButton={!loading}>
        <DialogHeader className="px-6 pt-6 pb-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4 text-primary" />
            Clarify Before Generating
          </DialogTitle>
          <DialogDescription>
            {plan?.intentSummary || "Analyzing your intent and preparing quick cross questions..."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/50 min-h-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-sm text-slate-500 gap-4">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
                <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
              <p className="font-medium">Curating specialist questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="py-20 text-sm text-slate-400 text-center font-medium">
              No clarification needed. You&apos;re ready to go.
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question) => {
                const answer = answersState[question.id];
                const selected = answer?.selectedOptionIds ?? [];
                const maxSelections = question.maxSelections ?? 3;

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={question.id} 
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="mb-4">
                      <p className="text-base font-semibold text-slate-900 tracking-tight">
                        {question.label.replace(/—/g, ": ")}
                        {question.required && <span className="text-rose-500 ml-1">*</span>}
                      </p>
                      {question.description && (
                        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{question.description.replace(/—/g, ": ")}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {question.options.map((option) => {
                        const checked = selected.includes(option.id);
                        const inputId = `${question.id}-${option.id}`;

                        return (
                          <div key={option.id} className="relative">
                            <label
                              htmlFor={inputId}
                              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all duration-200 ${
                                checked 
                                  ? "border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(37,99,235,0.1)]" 
                                  : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <div className={`shrink-0 w-4 h-4 border-2 flex items-center justify-center transition-all duration-200 ${
                                checked ? "border-primary bg-primary" : "border-slate-300 bg-white"
                              } ${question.type === "multi" ? "rounded-md" : "rounded-full"}`}>
                                {checked && (
                                  question.type === "multi" ? (
                                    <Check className="w-3 h-3 text-white stroke-[3]" />
                                  ) : (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  )
                                )}
                              </div>
                              <input
                                id={inputId}
                                type={question.type === "single" ? "radio" : "checkbox"}
                                name={question.id}
                                checked={checked}
                                onChange={() => {
                                  if (question.type === "single") {
                                    setSingleAnswer(question.id, option.id);
                                  } else {
                                    toggleMultiAnswer(question.id, option.id, maxSelections);
                                  }
                                }}
                                className="sr-only"
                              />
                              <span className={`text-sm font-medium transition-colors ${checked ? "text-primary" : "text-slate-600"}`}>
                                {option.label.replace(/—/g, ": ")}
                              </span>
                            </label>

                            {option.allowsText && checked && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-2"
                              >
                                <input
                                  type="text"
                                  placeholder="Add specific details..."
                                  value={answer?.optionTexts?.[option.id] ?? ""}
                                  onChange={(event) =>
                                    setOptionText(question.id, option.id, event.target.value)
                                  }
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {question.type === "multi" && (
                      <p className="text-[11px] text-slate-400 mt-3 font-medium flex items-center gap-1.5">
                         <span className="w-1 h-1 rounded-full bg-slate-300" />
                         Select up to {maxSelections} options
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="m-0 px-6 py-5 border-t border-slate-100 bg-white flex flex-row items-center justify-between gap-4 w-full rounded-b-xl relative z-20">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={loading}
            className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl px-6"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || (!isValid && questions.length > 0)}
            className="rounded-xl px-8 bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-900/10 min-w-[180px] max-w-full"
          >
            Continue to Pipeline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
