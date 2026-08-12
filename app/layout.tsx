import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
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
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
