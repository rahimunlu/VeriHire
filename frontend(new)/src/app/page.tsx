'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldCheck, Shield, Users, Zap, Lock, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { WorldAppLayout } from "@/components/world-app-layout";
import { useMiniKit } from "@/components/minikit-provider";

export default function WelcomePage() {
  const { isConnected, worldAppVersion, deviceOS } = useMiniKit();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <WorldAppLayout>
      <motion.div
        className="flex flex-col items-center justify-center min-h-dvh text-center p-4 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="relative mb-8" variants={itemVariants}>
          <div className="absolute -inset-4 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <ShieldCheck className="relative w-24 h-24 text-primary" />
        </motion.div>

        <motion.h1
          className="text-4xl font-bold font-headline mb-2 text-foreground"
          variants={itemVariants}
        >
          Welcome to VeriHire
        </motion.h1>

        <motion.p
          className="text-lg text-muted-foreground mb-8 max-w-md"
          variants={itemVariants}
        >
          Your Verified Career on World Chain. Build trust, get hired faster.
        </motion.p>

        {/* World ID Features */}
        <motion.div
          className="grid grid-cols-2 gap-4 mb-8 max-w-sm"
          variants={itemVariants}
        >
          <div className="bg-primary/5 rounded-lg p-3 text-center">
            <Shield className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-xs font-medium">World ID</div>
            <div className="text-xs text-muted-foreground">Biometric Proof</div>
          </div>
          <div className="bg-primary/5 rounded-lg p-3 text-center">
            <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-xs font-medium">Sybil-Proof</div>
            <div className="text-xs text-muted-foreground">One Person, One ID</div>
          </div>
          <div className="bg-primary/5 rounded-lg p-3 text-center">
            <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-xs font-medium">Instant</div>
            <div className="text-xs text-muted-foreground">No Waiting</div>
          </div>
          <div className="bg-primary/5 rounded-lg p-3 text-center">
            <Smartphone className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <div className="text-xs font-medium">Mini App</div>
            <div className="text-xs text-muted-foreground">
              {isConnected ? 'Connected' : 'Standalone'}
            </div>
          </div>
        </motion.div>

        <motion.div className="space-y-4" variants={itemVariants}>
          <Link href="/tunnel/step2-upload-cv" passHref>
            <Button size="lg" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 h-14 px-8 text-lg font-semibold shadow-lg shadow-accent/20">
              <Shield className="w-5 h-5 mr-2" />
              Verify with World ID
            </Button>
          </Link>

          <p className="text-xs text-muted-foreground max-w-xs">
            Secure biometric verification powered by World ID. No personal data is stored.
          </p>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="mt-8 flex items-center gap-6 text-xs text-muted-foreground"
          variants={itemVariants}
        >
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>22M+ Users</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>World Chain</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`}></div>
            <span>Mini App</span>
          </div>
        </motion.div>

        {/* World App Status */}
        {isConnected && (worldAppVersion || deviceOS) && (
          <motion.div
            className="mt-4 text-xs text-muted-foreground"
            variants={itemVariants}
          >
            {worldAppVersion && <div>World App v{worldAppVersion}</div>}
            {deviceOS && <div>Running on {deviceOS}</div>}
          </motion.div>
        )}
      </motion.div>
    </WorldAppLayout>
  );
}
