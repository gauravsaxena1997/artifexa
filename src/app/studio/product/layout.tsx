import type { Metadata } from "next";
import { BRAND_CONFIG } from "@/config/brand";

export const metadata: Metadata = {
  title: `Product Architecture Studio | ${BRAND_CONFIG.name}`,
  description: "AI-powered product planning, software architecture design, and automated QA. Generate production-ready execution plans in minutes.",
  keywords: ["Product Architecture", "AI Planning", "Software Design", "Automated QA", "AI Developer Tools"],
  openGraph: {
    title: `Product Architecture Studio | ${BRAND_CONFIG.name}`,
    description: "Generate production-ready execution plans, software architecture, and QA sequences with our AI-powered studio.",
    url: `${BRAND_CONFIG.url}/studio/product`,
  },
};

export default function ProductStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${BRAND_CONFIG.name} Product Architecture Studio`,
    applicationCategory: 'DeveloperApplication',
    description: 'AI orchestration studio tailored for product architecture, generating execution plans, DB schemas, API endpoints, and QA tests.',
    url: `${BRAND_CONFIG.url}/studio/product`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
