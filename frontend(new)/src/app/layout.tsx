import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: "VeriHire",
  description: "Your Verified Career on World Chain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-body antialiased`}>
        <div className="relative w-full max-w-md mx-auto min-h-dvh bg-background shadow-2xl">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
