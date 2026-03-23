"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">Artifexa</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/studio/product"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Try Product Studio
            </Link>
            <Link
              href="/studio/product"
              className="sm:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              Try Studio
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
