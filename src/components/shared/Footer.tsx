"use client";
import Image from "next/image";
import { BRAND_CONFIG } from "@/config/brand";
import { STUDIO_CONFIG } from "@/config/studios";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["100%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [0, 0.02, 0.04]);

  return (
    <footer ref={footerRef} className="relative border-t border-slate-200 bg-white overflow-hidden pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 block">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 relative z-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Image src={BRAND_CONFIG.assets.logoTransparent} alt={`${BRAND_CONFIG.name} Logo`} width={32} height={32} className="w-8 h-8 object-contain" />
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{BRAND_CONFIG.name}</span>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed">
              Industrial-grade AI studios that transform rough ideas into production-ready outputs through intelligent multi-agent orchestration.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-6">Studios</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><a href={STUDIO_CONFIG.vision.href} className="hover:text-indigo-600 transition-colors">{STUDIO_CONFIG.vision.name}</a></li>
              <li><a href={STUDIO_CONFIG.product.href} className="hover:text-indigo-600 transition-colors">{STUDIO_CONFIG.product.name}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Community</a></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-sm text-slate-400 font-medium z-10 relative">
          <p suppressHydrationWarning>&copy; {new Date().getFullYear()} {BRAND_CONFIG.name} Inc. All rights reserved.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
      
      {/* Massive subtle background text with rise up effect */}
      <div className="absolute bottom-0 w-full flex justify-center pointer-events-none select-none z-0 mix-blend-multiply overflow-hidden">
        <motion.h1 
          style={{ y, opacity }}
          className="text-[18vw] font-bold leading-none tracking-tighter text-slate-900 whitespace-nowrap"
        >
          {BRAND_CONFIG.name.toUpperCase()}
        </motion.h1>
      </div>
    </footer>
  );
}
