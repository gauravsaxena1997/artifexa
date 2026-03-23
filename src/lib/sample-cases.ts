import type { SampleCase } from "@/types";

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: "sc-001",
    title: "Vague Startup Idea",
    category: "Idea → PRD",
    description: "A very rough, one-liner idea with minimal detail. Tests the system's ability to expand vague input into a full product plan.",
    difficulty: "simple",
    input: "I want to build an app where people can share their book highlights and discover what others are reading.",
  },
  {
    id: "sc-002",
    title: "Feature Request for Existing Product",
    category: "Feature Request",
    description: "A specific feature enhancement for an existing e-commerce platform. Tests the system's ability to handle improvement-type inputs.",
    difficulty: "moderate",
    input: "We need to add a real-time collaborative wishlist feature to our e-commerce platform. Users should be able to create shared wishlists with friends/family, see when items go on sale, vote on which items to buy first, and set budget limits per list. The existing platform uses React frontend, Node.js backend, and PostgreSQL. We have about 50k monthly active users.",
  },
  {
    id: "sc-003",
    title: "Complex SaaS Platform Vision",
    category: "Full Product Vision",
    description: "A detailed product vision document for a B2B SaaS. Tests handling of complex, multi-feature inputs with technical constraints.",
    difficulty: "complex",
    input: `Build an AI-powered project management tool for remote engineering teams. Core requirements:

1. Smart Sprint Planning: AI analyzes past velocity, team capacity, and task complexity to suggest optimal sprint compositions
2. Async Standup Bot: Collects daily updates via Slack/Teams, generates summaries, flags blockers automatically
3. Dependency Mapper: Visual graph showing task dependencies across teams, auto-detects circular dependencies and bottlenecks
4. Risk Predictor: ML model that predicts sprint failure probability based on historical patterns, team sentiment analysis from standups, and external factors (holidays, on-call rotations)
5. Integration Hub: Must integrate with GitHub, Jira, Linear, Slack, Teams, and Google Calendar
6. Role-based dashboards: Different views for ICs, tech leads, engineering managers, and VPs

Constraints: Must be SOC2 compliant, support SSO via SAML/OIDC, handle 10k+ concurrent users, and have <200ms API response times. Target market is Series B+ startups with 50-500 engineers.`,
  },
  {
    id: "sc-004",
    title: "Legacy System Modernization",
    category: "Improvement",
    description: "Migrating a monolithic system to microservices. Tests architectural reasoning for brownfield projects.",
    difficulty: "complex",
    input: `Our hospital management system is a 15-year-old Java monolith running on Tomcat with an Oracle database. It handles patient records, appointment scheduling, billing, pharmacy inventory, and lab results. We need to modernize it to a cloud-native architecture while maintaining zero downtime for the 200+ hospitals currently using it. Key pain points: deployments take 4 hours with frequent rollbacks, the billing module is tightly coupled with everything else, and we can't scale individual modules independently. Budget allows for a 2-year migration timeline with a team of 12 engineers.`,
  },
  {
    id: "sc-005",
    title: "Mobile App UI/UX Concept",
    category: "UI/UX Concept",
    description: "A design-focused product brief emphasizing user experience. Tests the system's UX thinking capabilities.",
    difficulty: "moderate",
    input: `Design a meditation and mental wellness app targeted at busy professionals aged 25-45. The app should feel premium but not clinical. Key UX requirements: onboarding should take under 60 seconds, daily sessions should be findable in 2 taps or less, progress tracking should be motivating but not anxiety-inducing. We want haptic feedback integration, ambient sound mixing, and a unique "breathing canvas" feature where users draw patterns that become their breathing exercises. The app needs to work offline for core features and respect user privacy — no social features, no data selling.`,
  },
  {
    id: "sc-006",
    title: "Extremely Vague Input",
    category: "Idea → PRD",
    description: "Tests the system's limits with an extremely minimal input. Shows how AI handles ambiguity.",
    difficulty: "simple",
    input: "food delivery but better",
  },
  {
    id: "sc-007",
    title: "Developer Tool PRD",
    category: "Full Product Vision",
    description: "A technical product targeted at developers. Tests domain-specific technical output quality.",
    difficulty: "complex",
    input: `Build an open-source database migration tool that supports PostgreSQL, MySQL, and MongoDB. It should provide: schema diffing between environments, automatic migration script generation, dry-run capability with rollback plans, team collaboration features (migration reviews, approval workflows), integration with CI/CD pipelines (GitHub Actions, GitLab CI), and a visual schema editor. The CLI should be the primary interface with an optional web dashboard. Must handle databases with 500+ tables and support zero-downtime migrations for tables with 100M+ rows.`,
  },
  {
    id: "sc-008",
    title: "Marketplace Platform",
    category: "Feature Request",
    description: "An existing marketplace needs a trust & safety overhaul. Tests the system on cross-cutting concerns.",
    difficulty: "moderate",
    input: "Our peer-to-peer marketplace for handmade goods is getting hit with counterfeit listings and fraudulent sellers. We need a comprehensive trust & safety system: automated listing verification using image analysis, seller reputation scoring, buyer protection program with escrow payments, dispute resolution workflow, and a reporting system. Current tech: Next.js, Supabase, Stripe. We process about 2,000 transactions per day.",
  },
];
