
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, CreditCard, DollarSign, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";

type Step = "form" | "payment" | "success";

export default function PostJobPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("form");

  const handlePostJob = () => {
    // Basic validation could go here
    setStep("payment");
  };

  const handlePayment = () => {
    // Mock payment processing
    toast({ title: "Processing Payment..." });
    setTimeout(() => {
        toast({ title: "Payment Successful!", description: "+50 TRUST has been added to your balance.", className: "bg-green-100 text-green-700" });
        setStep("success");
    }, 2000);
  };
  
  const renderStep = () => {
    switch (step) {
      case "form":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="job-title">Job Title</Label>
              <Input id="job-title" placeholder="e.g., Senior Frontend Engineer" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="job-description">Job Description</Label>
              <Textarea id="job-description" placeholder="Describe the role and responsibilities..." rows={5} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="salary-range">Salary Range</Label>
                    <Input id="salary-range" placeholder="e.g., $120k - $150k"/>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="job-type">Job Type</Label>
                    <Select>
                        <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="full-time">Full-Time</SelectItem>
                            <SelectItem value="part-time">Part-Time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Button onClick={handlePostJob} size="lg" className="w-full h-12">Proceed to Payment</Button>
          </motion.div>
        );
      case "payment":
        return (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 text-center">
            <CardTitle>Complete Your Purchase</CardTitle>
            <CardDescription>A one-time fee is required to post a job.</CardDescription>
            <Card className="p-6 bg-primary/10 border-primary/20">
                <p className="text-sm font-semibold">Standard Job Post</p>
                <p className="text-4xl font-bold text-primary">$199</p>
                <p className="text-xs text-muted-foreground">or equivalent in WLD/USDC</p>
            </Card>
            <Button onClick={handlePayment} size="lg" className="w-full h-12"><CreditCard className="mr-2"/> Pay with Card</Button>
            <Button onClick={handlePayment} size="lg" className="w-full h-12" variant="secondary"><DollarSign className="mr-2"/> Pay with Crypto</Button>
            <Button onClick={handlePayment} size="lg" className="w-full h-12" variant="outline"><Star className="mr-2 text-yellow-500 fill-yellow-500"/> Pay with your TRUST coin</Button>
            <Button onClick={() => setStep("form")} variant="ghost">Go Back</Button>
          </motion.div>
        );
      case "success":
        return (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ type: 'spring' }}>
                    <PlusCircle className="w-20 h-20 text-green-500 mx-auto" />
                </motion.div>
                <CardTitle>Job Posted Successfully!</CardTitle>
                <CardDescription>Your job is now live. You will be notified when new applications arrive.</CardDescription>
                <Button onClick={() => router.push('/recruiter/home')} size="lg" className="w-full h-12">Back to Dashboard</Button>
            </motion.div>
        )
    }
  }

  return (
    <div className="p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
           {step === "form" && <CardTitle className="text-center text-2xl font-headline">Post a New Job</CardTitle>}
        </CardHeader>
        <CardContent>
            <AnimatePresence mode="wait">
                {renderStep()}
            </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
