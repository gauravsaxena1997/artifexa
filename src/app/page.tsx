"use client";
import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { STUDIO_CONFIG } from "@/config/studios";
import { BRAND_CONFIG } from "@/config/brand";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Palette,
  ArrowRight,
  BrainCircuit,
  Workflow,
  TerminalSquare,
  ShieldCheck,
  Cpu
} from "lucide-react";

export default function Home() {
  /* ── HERO CARD ── */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  // Scale and fade happen in the FIRST HALF of scroll (0 to 0.5) 
  // so that by the time the Bento overlaps, the Hero has already receded
  const heroScale = useTransform(heroProgress, [0, 0.5], [1, 0.92]);
  const heroOpacity = useTransform(heroProgress, [0, 0.6], [1, 0.4]);
  const heroBR = useTransform(heroProgress, [0, 0.5], [0, 48]);

  /* ── BENTO CARD ── */
  const bentoRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: bentoProgress } = useScroll({
    target: bentoRef,
    offset: ["start start", "end start"],
  });
  const bentoScale = useTransform(bentoProgress, [0.6, 1], [1, 0.92]);
  const bentoOpacity = useTransform(bentoProgress, [0.6, 1], [1, 0.4]);
  const bentoBR = useTransform(bentoProgress, [0, 0.5], [48, 48]);

  /* ── PIPELINE CARDS spread animation ── */
  const pipelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: cardsProgress } = useScroll({
    target: pipelineRef,
    offset: ["start end", "center center"],
  });
  const leftCardX = useTransform(cardsProgress, [0.4, 1], [0, -60]);
  const leftCardRotate = useTransform(cardsProgress, [0.4, 1], [0, -5]);
  const rightCardX = useTransform(cardsProgress, [0.4, 1], [0, 60]);
  const rightCardRotate = useTransform(cardsProgress, [0.4, 1], [0, 5]);
  const middleCardY = useTransform(cardsProgress, [0.4, 1], [40, 0]);

  const containerScale = useTransform(cardsProgress, [0, 0.4, 1], [0.94, 1, 1]);
  const containerBR = useTransform(cardsProgress, [0, 0.4], [80, 48]);
  const containerOpacity = useTransform(cardsProgress, [0, 0.3], [0, 1]);
  
  const lineOpacity = useTransform(cardsProgress, [0.4, 0.6], [0, 1]);
  const lineScale = useTransform(cardsProgress, [0.4, 0.6], [0.8, 1]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND_CONFIG.name,
    url: BRAND_CONFIG.url,
    description: BRAND_CONFIG.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BRAND_CONFIG.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-col min-h-screen selection:bg-purple-100 selection:text-purple-900 overflow-x-hidden w-full"
        style={{ backgroundColor: "#e8e8e8" }}
      >
      <Navbar />

      <main className="flex-1">
        {/* ═══════════════════════════════════════════════════════
            HERO CARD
            Outer wrapper: 200vh (100vh content + 100vh runway)
            Inner sticky: 100vh, pinned at top
        ═══════════════════════════════════════════════════════ */}
        <section ref={heroRef} className="relative h-[200vh] w-full" style={{ zIndex: 1 }}>
          <motion.div 
            style={{ 
              scale: heroScale, 
              opacity: heroOpacity, 
              borderRadius: heroBR,
            }}
            className="sticky top-0 h-[100vh] w-full flex items-center justify-center overflow-hidden origin-center bg-white will-change-transform"
          >
            {/* Abstract Fluid Orb Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-tr from-purple-200 via-indigo-100 to-pink-50 rounded-full blur-[100px] opacity-70 animate-pulse pointer-events-none z-0" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
              <div className="max-w-4xl text-center mx-auto">
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-slate-900 leading-[1.05]">
                  Your Vision, <br className="hidden sm:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Orchestrated.</span>
                </h1>
                
                <p className="mt-8 text-xl sm:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-light tracking-tight">
                  Harness a synchronized team of specialized AI agents. From generating breathtaking visual media to structuring complex project blueprints, orchestrate your entire workflow in seconds.
                </p>
                
                <div className="mt-14 flex flex-col sm:flex-row gap-5 justify-center items-center">
                  <Link
                    href={STUDIO_CONFIG.vision.href}
                    className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-slate-900 text-white font-medium text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10">Try {STUDIO_CONFIG.vision.name.replace(" Studio", "")}</span>
                    <ArrowRight className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <a
                    href="#platform"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-slate-50 text-slate-800 font-medium text-lg border border-slate-200 shadow-sm hover:bg-slate-100 hover:shadow-md transition-all duration-300"
                  >
                    Explore Platform
                  </a>
                </div>
              </div>
            </div>

            {/* Value Strip */}
            <div className="absolute bottom-0 w-full bg-slate-900 py-4 sm:py-6 border-t border-slate-800 z-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center gap-4 text-slate-200 font-medium tracking-wide text-sm sm:text-base">
                <Workflow className="w-5 h-5 text-indigo-400" />
                <span>Self-Correcting Flows: Zero hallucination drift enforced by strict JSON contracts.</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            BENTO GRID CARD  
            Same sticky-card pattern. Slides over the receding Hero.
            Has its OWN 200vh wrapper so IT also recedes when Pipeline arrives.
        ═══════════════════════════════════════════════════════ */}
        <section ref={bentoRef} className="relative h-[200vh] w-full -mt-[95vh]" style={{ zIndex: 2 }}>
          <motion.div 
            style={{ 
              scale: bentoScale, 
              opacity: bentoOpacity, 
              borderRadius: bentoBR,
            }}
            className="sticky top-0 w-full h-[100vh] overflow-hidden origin-center bg-slate-50 will-change-transform shadow-[0_-10px_60px_rgba(0,0,0,0.25)]"
          >


            <div id="platform" className="pt-24 pb-48 relative z-10 text-center sm:text-left">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-20 flex flex-col sm:flex-row justify-between items-end gap-6">
                  <div className="max-w-2xl">
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                      The Multi-Agent Matrix
                    </h2>
                    <p className="mt-4 text-xl text-slate-800 font-medium leading-relaxed">
                      A tightly integrated suite of specialized agents operating in orchestrated harmony.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 auto-rows-[380px] text-left pb-24">
                  {/* Vision Canvas */}
                  <div className="relative rounded-[2.5rem] overflow-hidden bg-white border border-slate-200 shadow-soft group hover:shadow-hover hover:-translate-y-1 transition-all duration-500 ease-out cursor-pointer">
                    <Link href={STUDIO_CONFIG.vision.href} className="absolute inset-0 z-20" />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 to-transparent z-0" />
                    <div className="relative z-10 p-10 h-full flex flex-col justify-between">
                      <div>
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30 mb-8 transform group-hover:scale-110 transition-transform duration-300">
                          <Palette className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-5">{STUDIO_CONFIG.vision.name}</h3>
                        <p className="text-lg text-slate-700 max-w-sm leading-relaxed font-medium">
                          {STUDIO_CONFIG.vision.description}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 text-purple-600 font-bold tracking-wide group-hover:text-purple-700 transition-colors w-fit">
                        Enter Workspace <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 border border-purple-200 rounded-full p-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Product Architect */}
                  <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 border border-slate-800 shadow-xl group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ease-out cursor-pointer">
                    <Link href={STUDIO_CONFIG.product.href} className="absolute inset-0 z-20" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/60 via-slate-900 to-slate-900 opacity-80" />
                    <div className="relative z-10 p-10 h-full flex flex-col justify-between">
                      <div>
                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 mb-8 backdrop-blur-md transform group-hover:scale-110 transition-transform duration-300">
                          <TerminalSquare className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold text-white tracking-tight mb-5">{STUDIO_CONFIG.product.name}</h3>
                        <p className="text-lg text-slate-200 max-w-sm leading-relaxed font-medium">
                          {STUDIO_CONFIG.product.description}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 text-indigo-400 font-bold tracking-wide group-hover:text-indigo-300 transition-colors w-fit">
                        Enter Workspace <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 border border-indigo-400/50 rounded-full p-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            PIPELINE MECHANICS CARD
            This is the final card that slides over the Bento Grid.
        ═══════════════════════════════════════════════════════ */}
        <section ref={pipelineRef} className="relative w-full -mt-[95vh] min-h-screen" style={{ zIndex: 3 }}>
          <motion.div 
            style={{ 
              scale: containerScale, 
              borderRadius: containerBR,
              opacity: containerOpacity,
            }}
            className="w-full bg-white overflow-hidden shadow-[0_-10px_60px_rgba(0,0,0,0.25)] min-h-screen origin-top mt-[5vh]"
          >
            <div className="py-40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-32 relative z-20">
                  <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-6 font-display">
                    Orchestration Under the Hood
                  </h2>
                  <p className="text-xl text-slate-700 font-medium leading-relaxed">
                    A deterministic execution environment that turns Large Language Models into reliable engineering machinery.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative pb-20">
                  <motion.div 
                    style={{ opacity: lineOpacity, scaleX: lineScale }}
                    className="absolute top-12 left-[15%] w-[70%] h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent hidden md:block z-0" 
                  />
                  
                  <motion.div style={{ x: leftCardX, rotate: leftCardRotate }} className="relative z-10 text-center flex flex-col items-center group">
                    <div className="w-24 h-24 rounded-3xl bg-white border border-slate-100 shadow-md flex items-center justify-center mb-8 relative overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <BrainCircuit className="w-10 h-10 text-indigo-600 relative z-10 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Cognitive Parsing</h3>
                    <p className="text-slate-600 text-center max-w-[260px] leading-relaxed font-normal mt-1">
                      Deconstructs vast unstructured text blocks into precise foundational requirements.
                    </p>
                  </motion.div>

                  <motion.div style={{ y: middleCardY }} className="relative z-10 text-center flex flex-col items-center group">
                    <div className="w-24 h-24 rounded-3xl bg-white border border-slate-100 shadow-md flex items-center justify-center mb-8 relative overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Cpu className="w-10 h-10 text-indigo-600 relative z-10 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Agent Delegation</h3>
                    <p className="text-slate-600 text-center max-w-[260px] leading-relaxed font-normal mt-1">
                      Spins up hyper-specialized micro-agents instantly depending on workload complexity.
                    </p>
                  </motion.div>
                  
                  <motion.div style={{ x: rightCardX, rotate: rightCardRotate }} className="relative z-10 text-center flex flex-col items-center group">
                    <div className="w-24 h-24 rounded-3xl bg-white border border-slate-100 shadow-md flex items-center justify-center mb-8 relative overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <ShieldCheck className="w-10 h-10 text-indigo-600 relative z-10 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Deterministic Sync</h3>
                    <p className="text-slate-600 text-center max-w-[260px] leading-relaxed font-normal mt-1">
                      Forces final generation through Zod schemas for guaranteed structural integrity.
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
    </>
  );
}
