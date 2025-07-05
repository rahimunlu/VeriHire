import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google'
import { MiniKitProvider } from '@/components/minikit-provider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: "VeriHire - World Mini App",
  description: "Your Verified Career on World Chain - World Mini App",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-body antialiased`}>
        <MiniKitProvider>
          <div className="relative w-full max-w-md mx-auto min-h-dvh bg-background shadow-2xl">
            {children}
          </div>
          <Toaster />
        </MiniKitProvider>
      </body>
    </html>
  );
}
