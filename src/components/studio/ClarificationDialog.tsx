"use client";

import { useMemo, useState } from "react";
import { Loader2, MessageSquareQuote } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      <DialogContent className="max-w-2xl p-0 sm:max-w-2xl" showCloseButton={!loading}>
        <DialogHeader className="px-6 pt-6 pb-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4 text-primary" />
            Clarify Before Generating
          </DialogTitle>
          <DialogDescription>
            {plan?.intentSummary || "Analyzing your intent and preparing quick cross questions..."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6 py-4">
          {loading ? (
            <div className="py-10 flex items-center justify-center text-sm text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating clarification questions...
            </div>
          ) : questions.length === 0 ? (
            <div className="py-8 text-sm text-muted-foreground text-center">
              No clarification needed. You can continue.
            </div>
          ) : (
            <div className="space-y-5">
              {questions.map((question) => {
                const answer = answersState[question.id];
                const selected = answer?.selectedOptionIds ?? [];
                const maxSelections = question.maxSelections ?? 3;

                return (
                  <div key={question.id} className="rounded-lg border border-border p-4">
                    <div className="mb-3">
                      <p className="text-sm font-medium">
                        {question.label}
                        {question.required && <span className="text-destructive ml-1">*</span>}
                      </p>
                      {question.description && (
                        <p className="text-xs text-muted-foreground mt-1">{question.description}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      {question.options.map((option) => {
                        const checked = selected.includes(option.id);
                        const inputId = `${question.id}-${option.id}`;

                        return (
                          <div key={option.id}>
                            <label
                              htmlFor={inputId}
                              className="flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 cursor-pointer hover:border-primary/30"
                            >
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
                                className="h-4 w-4 accent-primary"
                              />
                              <span className="text-sm text-foreground">{option.label}</span>
                            </label>

                            {option.allowsText && checked && (
                              <input
                                type="text"
                                placeholder="Add brief detail"
                                value={answer?.optionTexts?.[option.id] ?? ""}
                                onChange={(event) =>
                                  setOptionText(question.id, option.id, event.target.value)
                                }
                                className="mt-2 w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-primary"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {question.type === "multi" && (
                      <p className="text-[11px] text-muted-foreground mt-2">
                        Select up to {maxSelections} options.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-border bg-background">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || (!isValid && questions.length > 0)}>
            Continue to Pipeline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
