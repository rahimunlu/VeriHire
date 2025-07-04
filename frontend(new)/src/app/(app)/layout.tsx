
'use client';

import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { ClipboardList, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // This check ensures the user has completed the tunnel.
    const tunnelComplete = localStorage.getItem('veriHireTunnelComplete');
    if (tunnelComplete !== 'true') {
      // If not complete, redirect to the start of the flow.
      router.push('/');
    } else {
      setIsVerified(true);
    }
  }, [router]);

  // Show a loader while we check the user's status to prevent layout flashing.
  if (!isVerified) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <main className="flex-1 pb-24">{children}</main>
      <div className="fixed z-50 bottom-8 left-1/2 -translate-x-1/2">
        <Link href="/verifications" passHref>
          <Button
            className="rounded-full h-14 w-14 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
            aria-label="Pending Verifications"
          >
            <ClipboardList className="h-6 w-6" />
          </Button>
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}
