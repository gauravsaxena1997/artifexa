export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export type OrchestratorState =
  | "IDLE"
  | "NORMALIZING"
  | "PLANNING"
  | "EXECUTING_ARCHITECT"
  | "EXECUTING_QA"
  | "REVIEWING"
  | "REFINING"
  | "FINALIZING"
  | "DONE"
  | "ERROR";

export interface AgentEvent {
  id: string;
  timestamp: number;
  state: OrchestratorState;
  agent: "System" | "Planner" | "Executor" | "Critic" | "Finalizer";
  persona?: string;
  type: "started" | "thinking" | "completed" | "error" | "loop";
  message: string;
  detail?: string;
}

export interface NormalizedContext {
  productGoal: string;
  targetUsers: string[];
  coreFeatures: string[];
  constraints: string[];
  assumptions: string[];
  inputType: "idea" | "feature_request" | "improvement";
  complexity: "low" | "medium" | "high";
}

export interface PlannerFeature {
  name: string;
  description: string;
  priority: "high" | "medium" | "low";
  phase: number;
}

export interface PlannerPhase {
  phase: number;
  name: string;
  deliverables: string[];
  estimatedDuration: string;
}

export interface UserJourney {
  persona: string;
  scenario: string;
  steps: string[];
  happyPath: boolean;
}

export interface PlannerOutput {
  prd: {
    title: string;
    objective: string;
    features: PlannerFeature[];
    phases: PlannerPhase[];
  };
  userJourneys: UserJourney[];
  edgeCases: string[];
}

export interface APIEndpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  requestBody?: string;
  responseShape: string;
}

export interface DBColumn {
  name: string;
  type: string;
  constraints?: string;
}

export interface DBTable {
  table: string;
  columns: DBColumn[];
  relationships?: string[];
}

export interface ArchitectOutput {
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    infrastructure: string[];
    reasoning: string;
  };
  hld: {
    overview: string;
    components: {
      name: string;
      responsibility: string;
      communicatesWith: string[];
    }[];
    dataFlowDescription: string;
  };
  lld: {
    apiEndpoints: APIEndpoint[];
    dbSchema: DBTable[];
    keyAlgorithms?: string[];
  };
  scalabilityNotes: string[];
}

export interface TestCase {
  id: string;
  scenario: string;
  steps: string[];
  expectedResult: string;
  priority: "critical" | "high" | "medium" | "low";
  type: "functional" | "edge_case" | "performance" | "security";
}

export interface QAOutput {
  testStrategy: string;
  testCases: TestCase[];
}

export interface CritiqueIssue {
  area: "prd" | "architecture" | "qa" | "consistency";
  severity: "critical" | "major" | "minor";
  description: string;
  suggestion: string;
}

export interface CritiqueOutput {
  score: number;
  summary: string;
  issues: CritiqueIssue[];
  refinementTarget: "planner" | "architect" | "qa" | "none";
}

export interface FinalBundle {
  title: string;
  generatedAt: string;
  qualityScore: number;
  sections: {
    prd: PlannerOutput;
    architecture: ArchitectOutput;
    testPlan: QAOutput;
    critique: CritiqueOutput;
  };
  executiveSummary: string;
  downloadFormats: string[];
}

export interface RunMemory {
  runId: string;
  studio: "product";
  status: OrchestratorState;
  userInput: {
    raw: string;
    source: "text" | "ocr";
    fileName?: string;
  };
  normalizedContext: NormalizedContext | null;
  plan: PlannerOutput | null;
  architectureDraft: ArchitectOutput | null;
  qaDraft: QAOutput | null;
  critique: CritiqueOutput | null;
  finalOutput: FinalBundle | null;
  events: AgentEvent[];
  meta: {
    totalCalls: number;
    totalTokensEstimate: number;
    promptTokens: number;
    completionTokens: number;
    refinementLoops: number;
    startedAt: number;
    completedAt: number | null;
  };
}

export interface SampleCase {
  id: string;
  title: string;
  category: string;
  description: string;
  input: string;
  difficulty: "simple" | "moderate" | "complex";
}

export interface SSEEvent {
  event: string;
  data: Record<string, unknown>;
}

export interface StudioRunMeta {
  totalCalls: number;
  totalTime: number;
  refinementLoops: number;
  qualityScore: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
