import type { Metadata } from "next";
import { BRAND_CONFIG } from "@/config/brand";

export const metadata: Metadata = {
  title: `Creative & Vision Studio | ${BRAND_CONFIG.name}`,
  description: "AI-driven creative asset generation, visual analysis, and design prompt engineering.",
  keywords: ["Creative AI", "Image Generation", "Video Generation", "AI Vision", "Automated Prompt Engineering"],
  openGraph: {
    title: `Creative & Vision Studio | ${BRAND_CONFIG.name}`,
    description: "Orchestrate AI agents to analyze images and generate specialized prompts for creative asset generation.",
    url: `${BRAND_CONFIG.url}/studio/creative`,
  },
};

export default function CreativeStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${BRAND_CONFIG.name} Creative & Vision Studio`,
    applicationCategory: 'MultimediaApplication',
    description: 'AI orchestration studio for creative asset generation. Automatically refines and prompts text-to-image and text-to-video AI pipelines.',
    url: `${BRAND_CONFIG.url}/studio/creative`,
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </div>
  );
}
