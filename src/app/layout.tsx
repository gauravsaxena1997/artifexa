import type { Metadata } from "next";
import { BRAND_CONFIG } from "@/config/brand";
import { Inter, JetBrains_Mono, Outfit } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND_CONFIG.url),
  title: {
    default: BRAND_CONFIG.seo.defaultTitle,
    template: BRAND_CONFIG.seo.titleTemplate,
  },
  description: BRAND_CONFIG.description,
  keywords: BRAND_CONFIG.seo.keywords,
  authors: [{ name: `${BRAND_CONFIG.name} Team` }],
  creator: BRAND_CONFIG.name,
  publisher: BRAND_CONFIG.name,
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: BRAND_CONFIG.seo.defaultTitle,
    description: BRAND_CONFIG.description,
    url: BRAND_CONFIG.url,
    siteName: BRAND_CONFIG.name,
    images: [
      {
        url: BRAND_CONFIG.assets.logoBackground,
        width: 1200,
        height: 630,
        alt: `${BRAND_CONFIG.name} Platform`,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND_CONFIG.seo.defaultTitle,
    description: BRAND_CONFIG.description,
    images: [BRAND_CONFIG.assets.logoBackground],
  },
  icons: {
    icon: BRAND_CONFIG.assets.logoTransparent,
    shortcut: BRAND_CONFIG.assets.logoTransparent,
    apple: BRAND_CONFIG.assets.logoTransparent,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${BRAND_CONFIG.name} AI Studios`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    description: BRAND_CONFIG.description,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: BRAND_CONFIG.name,
      url: BRAND_CONFIG.url,
      logo: `${BRAND_CONFIG.url}${BRAND_CONFIG.assets.logoTransparent}`
    }
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
