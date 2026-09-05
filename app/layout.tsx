import type { Metadata } from "next";
import { Suspense } from "react";
import { Onest } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ReadingPositionRestorer } from "@/components/navigation/reading-position-restorer";
import { siteConfig } from "@/config/site";

const egebaseTypeface = Onest({
  subsets: ["cyrillic", "latin"],
  variable: "--font-egebase",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "EgeBase — теория ЕГЭ по обществознанию",
    template: "%s | EgeBase"
  },
  description: siteConfig.description,
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png"
  },
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "EgeBase — теория ЕГЭ по обществознанию",
    description: siteConfig.description,
    url: "/",
    siteName: "EgeBase",
    locale: "ru_RU",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={egebaseTypeface.variable}>
      <body>
        <Suspense fallback={null}>
          <ReadingPositionRestorer />
        </Suspense>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
