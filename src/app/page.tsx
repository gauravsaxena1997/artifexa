import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import {
  Sparkles,
  Package,
  Palette,
  ArrowRight,
  Brain,
  Users,
  FileCheck,
  Download,
  Zap,
  Shield,
  Lock,
} from "lucide-react";

const studios = [
  {
    title: "Product Studio",
    description: "Turn product ideas into developer-ready PRDs, architecture docs, and test plans.",
    icon: Package,
    href: "/studio/product",
    available: true,
    example: '"Build an AI-powered project management tool"',
  },
  {
    title: "Creative Studio",
    description: "Generate optimized prompts for text-to-image and text-to-video platforms.",
    icon: Palette,
    href: "/studio/creative",
    available: true,
    example: '"A female model doing a ramp walk inside a fashion studio"',
  },
];

const steps = [
  { icon: Brain, title: "Describe", subtitle: "Type your idea or upload a document" },
  { icon: Users, title: "AI Plans", subtitle: "Multi-agent pipeline analyzes and plans" },
  { icon: FileCheck, title: "Review", subtitle: "Quality critic scores and refines output" },
  { icon: Download, title: "Download", subtitle: "Get production-ready documents" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Multi-Agent AI Orchestration
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Turn Ideas into{" "}
                <span className="text-primary">Production-Ready</span>{" "}
                Outputs
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                AI Studios that transform your rough ideas into structured PRDs, technical
                architectures, test plans, and more — powered by intelligent multi-agent
                pipelines.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/studio/product"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20"
                >
                  Try Product Studio
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-secondary transition-colors"
                >
                  How It Works
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Studios Grid */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Studios</h2>
              <p className="mt-3 text-muted-foreground">
                Specialized workspaces powered by multi-agent orchestration
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {studios.map((studio) => (
                <Link
                  key={studio.title}
                  href={studio.href}
                  className={`group relative rounded-xl border p-6 transition-all ${
                    studio.available
                      ? "border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
                      : "border-border/50 opacity-60 pointer-events-none"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <studio.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{studio.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{studio.description}</p>
                      <p className="text-xs text-muted-foreground/70 mt-3 italic">
                        {studio.example}
                      </p>
                    </div>
                  </div>
                  {!studio.available && (
                    <span className="absolute top-4 right-4 text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                      Soon
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 sm:py-20 bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How It Works</h2>
              <p className="mt-3 text-muted-foreground">
                Four steps from idea to production-ready output
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {steps.map((step, idx) => (
                <div key={step.title} className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 relative">
                    <step.icon className="w-6 h-6 text-primary" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{step.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold">Fast Pipeline</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  5-7 LLM calls per run with intelligent caching and refinement loops
                </p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold">Quality Gated</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Built-in critic agent scores output and triggers refinement when needed
                </p>
              </div>
              <div className="text-center">
                <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold">Production Grade</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Strict JSON contracts, schema validation, and error recovery at every stage
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
