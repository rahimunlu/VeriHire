'use client';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const steps = [
  'step2-upload-cv',
  'step3-parse-cv',
  'step3a-collect-email',
  'step4-add-employers',
  'step5-verification-tracker',
  'step5a-add-links',
  'step6-ai-score',
  'step8-rewards',
];
const totalSteps = steps.length;

export default function TunnelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentPathSegment = pathname.split('/').pop() || '';
  const currentStepIndex = steps.indexOf(currentPathSegment);
  const currentStep = currentStepIndex + 1;

  const handleBack = () => {
    router.back();
  };

  const isFinalStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-20 border-b">
        <div>
          {!isFirstStep ? (
            <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Go back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : <div className="w-10 h-10" />
          }
        </div>
        <h1 className="text-sm font-semibold text-muted-foreground">
          {isFinalStep ? "Verification Complete" : `Step ${currentStep} of ${totalSteps - 1}`}
        </h1>
        <div className="w-10 h-10" />
      </header>

      {!isFinalStep && (
        <Progress value={(currentStep / (totalSteps - 1)) * 100} className="h-1 w-full rounded-none" />
      )}

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
