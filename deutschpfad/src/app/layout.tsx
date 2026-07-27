import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ServiceWorker } from "@/components/service-worker";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://deutschpfad.app"),
  title: {
    default: "DeutschPfad — Learn German from A1 to B2",
    template: "%s · DeutschPfad",
  },
  description:
    "A complete German learning platform: A1–B2 courses, grammar, vocabulary with spaced repetition, reading, listening, speaking, writing feedback, Goethe and telc mock exams, Ausbildung preparation and printable PDFs.",
  keywords: [
    "learn German",
    "Deutsch lernen",
    "A1 A2 B1 B2",
    "Goethe Zertifikat",
    "telc Deutsch",
    "German grammar",
    "German vocabulary",
    "Ausbildung Deutschland",
    "CEFR German course",
  ],
  authors: [{ name: "DeutschPfad" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    alternateLocale: ["de_DE"],
    title: "DeutschPfad — Learn German from A1 to B2",
    description:
      "Courses, grammar, flashcards, mock exams and printable PDFs — everything you need to reach B2 and pass Goethe or telc.",
    siteName: "DeutschPfad",
  },
  twitter: { card: "summary_large_image", title: "DeutschPfad", description: "Learn German from A1 to B2." },
  manifest: "/manifest.webmanifest",
  applicationName: "DeutschPfad",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "DeutschPfad" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f19" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <Providers>
          <div id="main">{children}</div>
          <ServiceWorker />
        </Providers>
      </body>
    </html>
  );
}
