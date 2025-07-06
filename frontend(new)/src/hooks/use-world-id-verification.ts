"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMiniKit } from "@/components/minikit-provider";
import { toast } from "@/hooks/use-toast";

interface UseWorldIdVerificationOptions {
  redirectTo?: string;
  showToast?: boolean;
  required?: boolean;
}

export function useWorldIdVerification(
  options: UseWorldIdVerificationOptions = {},
) {
  const {
    redirectTo = "/tunnel/step1-world-id",
    showToast = true,
    required = true,
  } = options;

  const router = useRouter();
  const {
    isWorldIdVerified,
    worldIdNullifier,
    isConnected,
    isLoading,
    setWorldIdVerified,
    clearWorldIdVerification,
  } = useMiniKit();

  useEffect(() => {
    // If user is inside World App, they're already verified - no need to redirect
    if (isConnected) {
      // For World Mini Apps, the user is automatically verified
      if (!isWorldIdVerified) {
        setWorldIdVerified(true, "world_app_verified");
      }
      return;
    }

    // Only require verification for non-World App users
    if (!isLoading && required && !isWorldIdVerified) {
      if (showToast) {
        toast({
          title: "World ID Required",
          description: "Please verify your identity with World ID to continue.",
          variant: "destructive",
        });
      }
      router.push(redirectTo);
    }
  }, [
    isLoading,
    isWorldIdVerified,
    required,
    router,
    redirectTo,
    showToast,
    isConnected,
    setWorldIdVerified,
  ]);

  const verifyWorldId = (nullifier: string) => {
    setWorldIdVerified(true, nullifier);
    if (showToast) {
      toast({
        title: "World ID Verified",
        description: isConnected
          ? "Successfully verified in World App"
          : "Successfully verified with World ID",
      });
    }
  };

  const logout = () => {
    // Can't logout when inside World App
    if (isConnected) {
      if (showToast) {
        toast({
          title: "Cannot logout",
          description: "You're using World App - logout from the app instead",
          variant: "destructive",
        });
      }
      return;
    }

    clearWorldIdVerification();
    if (showToast) {
      toast({
        title: "Logged out",
        description: "World ID verification cleared",
      });
    }
    router.push("/");
  };

  return {
    // Verification state
    isVerified: isWorldIdVerified,
    nullifier: worldIdNullifier,
    isLoading,

    // World App state
    isConnectedToWorldApp: isConnected,

    // Actions
    verifyWorldId,
    logout,

    // Utilities
    requiresVerification: required && !isWorldIdVerified && !isConnected,
    isReady: !isLoading && (!required || isWorldIdVerified || isConnected),
  };
}
