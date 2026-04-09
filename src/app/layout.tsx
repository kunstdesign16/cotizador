import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

import { Toaster } from 'sonner'

const oswald = localFont({
  src: "../../public/fonts/Oswald-VariableFont_wght.ttf",
  variable: "--font-oswald",
});

const moga = localFont({
  src: "../../public/fonts/moga.otf",
  variable: "--font-moga",
});

export const metadata: Metadata = {
  title: "Kunst & Design",
  description: "Sistema de cotización y gestión",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192-v2.png",
    apple: "/icons/icon-512-v2.png"
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
        className={`${moga.variable} ${oswald.variable} font-sans antialiased bg-muted/5`}
      >
        <DashboardLayout>
          {children}
        </DashboardLayout>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
