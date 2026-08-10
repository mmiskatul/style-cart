import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import type { ReactNode } from "react";

import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Terrahaus — Natural Materials, Everyday Essentials",
  description:
    "Terrahaus makes footwear, apparel and home goods from merino wool, organic cotton and other natural materials.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    siteName: "Terrahaus",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
