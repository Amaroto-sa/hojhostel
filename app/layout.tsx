import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "HOJ Hostel | Safe, Clean & Comfortable Accommodation in Ajah, Lagos",
  description:
    "House of Jesse Hostel provides comfortable, affordable, and well-located accommodation with flexible payments for students, NYSC members, young professionals, and travelers in Ajah, Lagos.",
  keywords: [
    "hostel in Ajah",
    "Lagos hostel",
    "bed space Ajah",
    "affordable accommodation Lagos",
    "House of Jesse",
    "HOJ Hostel",
    "NYSC accommodation",
    "student hostel Lagos",
  ],
  openGraph: {
    title: "HOJ Hostel | House of Jesse — Comfortable Accommodation in Ajah",
    description:
      "Safe, clean, and affordable bed spaces and rooms in Ajah, Lagos. Daily, weekly, and monthly stays available.",
    type: "website",
  },
};

import SiteLayoutWrapper from "@/components/SiteLayoutWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Clash Display from Fontshare CDN (free) */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <Providers>
          <SiteLayoutWrapper>
            {children}
          </SiteLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
