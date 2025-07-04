
'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import { motion } from "framer-motion";

export default function RecruiterAuthPage() {
  const router = useRouter();

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

  const handleAuth = () => {
    // In a real app, this would involve OAuth and company verification flows.
    // For this prototype, we'll just navigate to the dashboard.
    router.push('/recruiter/home');
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-dvh text-center p-4 overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="relative mb-8" variants={itemVariants}>
        <div className="absolute -inset-4 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <Briefcase className="relative w-24 h-24 text-primary" />
      </motion.div>
      <motion.h1 
        className="text-4xl font-bold font-headline mb-2 text-foreground"
        variants={itemVariants}
      >
        Recruiter Portal
      </motion.h1>
      <motion.p 
        className="text-lg text-muted-foreground mb-10 max-w-md"
        variants={itemVariants}
      >
        Find top, verified talent and build your team with confidence.
      </motion.p>
      <motion.div 
        className="space-y-4 w-full max-w-xs"
        variants={itemVariants}
      >
        <Button onClick={handleAuth} size="lg" className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90 h-14 px-8 text-lg font-semibold shadow-lg shadow-accent/20">
          Sign in with World ID
        </Button>
      </motion.div>
    </motion.div>
  );
}
