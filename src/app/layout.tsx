import type { Metadata } from "next";
import { Fira_Sans, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

import { Toaster } from 'sonner'

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Kunst & Design",
  description: "Sistema de cotización y gestión",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-512.png"
  }
};

export const viewport = {
  themeColor: "#0B3C4D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${firaSans.variable} ${bebasNeue.variable} font-sans antialiased bg-muted/5`}
      >
        <DashboardLayout>
          {children}
        </DashboardLayout>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
