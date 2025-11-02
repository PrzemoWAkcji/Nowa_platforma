import { ConditionalHeader } from "@/components/layout/ConditionalHeader";
import { ToastProvider } from "@/components/ui/toast";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Athletics Platform",
  description: "Platforma do zarządzania zawodami lekkoatletycznymi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ToastProvider>
            <ConditionalHeader />
            <main className="min-h-screen">{children}</main>
            <Toaster position="top-right" />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
