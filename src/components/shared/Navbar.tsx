"use client";
import Link from "next/link";
import Image from "next/image";
import { BRAND_CONFIG } from "@/config/brand";
import { ArrowRight } from "lucide-react";
import { STUDIO_CONFIG } from "@/config/studios";

export function Navbar() {
  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full px-6 py-3 flex items-center justify-between w-full max-w-5xl transition-all duration-300">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Image src={BRAND_CONFIG.assets.logoTransparent} alt={`${BRAND_CONFIG.name} Logo`} width={36} height={36} className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">{BRAND_CONFIG.name}</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href={STUDIO_CONFIG.vision.href}
            className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-purple-600 transition-colors duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          >
            Try {STUDIO_CONFIG.vision.name.replace(" Studio", "")}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={STUDIO_CONFIG.vision.href}
            className="sm:hidden inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-medium"
          >
            {STUDIO_CONFIG.vision.name.replace(" Studio", "")}
          </Link>
        </div>
      </nav>
    </div>
  );
}
