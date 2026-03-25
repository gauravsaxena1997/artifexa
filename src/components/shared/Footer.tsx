"use client";



export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo-transparent.png" alt="Artifexa Logo" className="w-5 h-5 object-contain" />
            <span className="text-sm font-semibold">Artifexa</span>
            <span className="text-xs text-muted-foreground">Multi-Agent AI Studios</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built with Next.js &middot; Powered by AI Orchestration
          </p>
        </div>
      </div>
    </footer>
  );
}
