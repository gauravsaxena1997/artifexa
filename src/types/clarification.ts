export type ClarificationStudio = "product" | "creative";

export type ClarificationQuestionType = "single" | "multi";

export interface ClarificationOption {
  id: string;
  label: string;
  allowsText?: boolean;
}

export interface ClarificationQuestion {
  id: string;
  type: ClarificationQuestionType;
  label: string;
  description?: string;
  required: boolean;
  options: ClarificationOption[];
  minSelections?: number;
  maxSelections?: number;
}

export interface ClarificationPlan {
  persona: string;
  intentSummary: string;
  questions: ClarificationQuestion[];
}

export interface ClarificationAnswer {
  questionId: string;
  selectedOptionIds: string[];
  optionTexts?: Record<string, string>;
}

export interface ClarificationResult {
  intentSummary: string;
  enrichedInput: string;
  qaSummary: string[];
}
