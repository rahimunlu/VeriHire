"use client";

import { useMiniKit } from "@/components/minikit-provider";
import { useCallback, useState } from "react";
import { toast } from "@/hooks/use-toast";

export interface TransactionParams {
  to: string;
  value: string;
  data?: string;
}

export interface WorldAppShare {
  text: string;
  url?: string;
}

export function useWorldMiniApp() {
  const { miniKit, isConnected, worldAppVersion, deviceOS, safeAreaInsets } =
    useMiniKit();
  const [isLoading, setIsLoading] = useState(false);

  const sendTransaction = useCallback(
    async (params: TransactionParams) => {
      if (!isConnected || !miniKit) {
        toast({
          title: "Not connected",
          description: "Please open this app in World App to send transactions",
          variant: "destructive",
        });
        return null;
      }

      setIsLoading(true);
      try {
        const result = await miniKit.sendTransaction({
          to: params.to,
          value: params.value,
          data: params.data || "0x",
        });

        toast({
          title: "Transaction sent",
          description: "Your transaction has been submitted successfully",
        });

        return result;
      } catch (error) {
        console.error("Transaction failed:", error);
        toast({
          title: "Transaction failed",
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, miniKit],
  );

  const share = useCallback(
    async (params: WorldAppShare) => {
      if (!isConnected || !miniKit) {
        // Fallback to Web Share API
        if (navigator.share) {
          try {
            await navigator.share({
              title: "VeriHire",
              text: params.text,
              url: params.url || window.location.href,
            });
          } catch (error) {
            console.error("Share failed:", error);
          }
        } else {
          // Fallback to clipboard
          await navigator.clipboard.writeText(params.text);
          toast({
            title: "Copied to clipboard",
            description: "Content has been copied to your clipboard",
          });
        }
        return;
      }

      try {
        await miniKit.share({
          text: params.text,
          url: params.url || window.location.href,
        });
      } catch (error) {
        console.error("Share failed:", error);
        toast({
          title: "Share failed",
          description: "Failed to share content",
          variant: "destructive",
        });
      }
    },
    [isConnected, miniKit],
  );

  const openLink = useCallback(
    (url: string) => {
      if (!isConnected || !miniKit) {
        // Fallback to window.open
        window.open(url, "_blank");
        return;
      }

      try {
        miniKit.openLink(url);
      } catch (error) {
        console.error("Open link failed:", error);
        window.open(url, "_blank");
      }
    },
    [isConnected, miniKit],
  );

  const copyToClipboard = useCallback(
    async (text: string) => {
      if (!isConnected || !miniKit) {
        // Fallback to standard clipboard API
        try {
          await navigator.clipboard.writeText(text);
          toast({
            title: "Copied to clipboard",
            description: "Content has been copied to your clipboard",
          });
        } catch (error) {
          console.error("Copy failed:", error);
          toast({
            title: "Copy failed",
            description: "Failed to copy content",
            variant: "destructive",
          });
        }
        return;
      }

      try {
        await miniKit.copyToClipboard(text);
        toast({
          title: "Copied to clipboard",
          description: "Content has been copied to your clipboard",
        });
      } catch (error) {
        console.error("Copy failed:", error);
        toast({
          title: "Copy failed",
          description: "Failed to copy content",
          variant: "destructive",
        });
      }
    },
    [isConnected, miniKit],
  );

  return {
    // Connection state
    isConnected,
    isLoading,
    worldAppVersion,
    deviceOS,
    safeAreaInsets,

    // Actions
    sendTransaction,
    share,
    openLink,
    copyToClipboard,

    // Utilities
    canSendTransaction: isConnected && miniKit !== null,
    canShare: isConnected && miniKit !== null,
  };
}
