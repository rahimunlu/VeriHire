
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Copy, Gift, Link as LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from '@/hooks/use-toast';

export default function RewardsStep() {
  const router = useRouter();
  const { toast } = useToast();
  const cvLink = "verihire.app/cv/zk-user-123";

  const copyLink = () => {
    navigator.clipboard.writeText(cvLink);
    toast({ title: "Link Copied!" });
  };
  
  const handleGoToDashboard = () => {
    // Set a flag in localStorage to indicate tunnel completion.
    localStorage.setItem('veriHireTunnelComplete', 'true');
    router.push('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
      <h2 className="text-3xl font-bold font-headline mb-2">Verification Complete!</h2>
      <p className="text-muted-foreground max-w-xs mb-8">
        You're all set! Share your verified CV and start applying for jobs.
      </p>

      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <LinkIcon className="w-5 h-5 text-primary" />
            Your Verified CV Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-background border">
            <p className="text-sm text-muted-foreground truncate">{cvLink}</p>
            <Button size="icon" variant="ghost" className="shrink-0" onClick={copyLink}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleGoToDashboard} className="w-full rounded-full h-12 text-base font-semibold bg-accent text-accent-foreground hover:bg-accent/90">
        Go to Dashboard
      </Button>
      <Button onClick={() => router.push('/referrals')} variant="outline" className="w-full mt-3 rounded-full h-12 text-base font-semibold">
        <Gift className="w-5 h-5 mr-2" />
        Refer a Friend (+100 TRUST)
      </Button>
    </div>
  );
}
