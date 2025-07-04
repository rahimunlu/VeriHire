
'use client';

import { VerifierBottomNav } from "@/components/verifier-bottom-nav";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function VerifierAppLayout({ children }: { children: React.ReactNode }) {
  // Simple check for demo purposes
  const [isVerified, setIsVerified] = useState(true);

  if (!isVerified) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <main className="flex-1 pb-20">{children}</main>
      <VerifierBottomNav />
    </div>
  );
}
