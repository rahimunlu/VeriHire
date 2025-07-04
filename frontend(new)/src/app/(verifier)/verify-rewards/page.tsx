
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gift, CheckSquare, UserPlus } from "lucide-react";
import dynamic from "next/dynamic";
import { Pie, Cell, Tooltip, Legend } from 'recharts';

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });

const verifier = {
  name: "John Doe",
  profile_image: "https://placehold.co/100x100.png",
  total_trust: 1850,
};

const breakdownData = [
  { name: 'Approvals', value: 1250, color: '#a78bfa' },
  { name: 'Referrals', value: 400, color: '#60a5fa' },
  { name: 'Bonuses', value: 200, color: '#34d399' },
];

const recentRewards = [
    { title: "Approved Verification", user: "Ayşe Yılmaz", tokens: 40, date: "2h ago", icon: CheckSquare },
    { title: "Approved Verification", user: "Berk Can", tokens: 40, date: "1d ago", icon: CheckSquare },
    { title: "Referral Bonus", user: "Ceyda Naz", tokens: 200, date: "3d ago", icon: UserPlus },
    { title: "Monthly Accuracy Bonus", user: "", tokens: 200, date: "5d ago", icon: Gift },
];

export default function VerifyRewardsPage() {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
       <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12 border-2 border-primary/50">
          <AvatarImage src={verifier.profile_image} alt={verifier.name} data-ai-hint="profile photo" />
          <AvatarFallback>{verifier.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold font-headline">Rewards Hub</h1>
          <p className="text-sm text-muted-foreground">Your TRUST earnings</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <Card className="text-center flex flex-col justify-center items-center p-4">
              <CardTitle className="text-sm font-medium">Total TRUST</CardTitle>
              <p className="text-4xl font-bold text-primary animate-bounce">{verifier.total_trust.toLocaleString()}</p>
          </Card>
          
          <Card>
              <CardHeader className="p-3">
                  <CardTitle className="text-sm font-medium">Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                  <div className="h-[100px]">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie data={breakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} innerRadius={25} paddingAngle={5}>
                                  {breakdownData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                              </Pie>
                              <Tooltip contentStyle={{ fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'hsl(var(--background))' }}/>
                              <Legend layout="vertical" align="right" verticalAlign="middle" height={80} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
              </CardContent>
          </Card>
      </div>

      {/* Recent Rewards */}
      <Card>
        <CardHeader className="p-3"><CardTitle className="text-sm font-medium">Earning History</CardTitle></CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
            {recentRewards.map((reward, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-background rounded-lg border">
                    <div className="flex items-center gap-3">
                        <reward.icon className="w-5 h-5 text-primary"/>
                        <div>
                            <p className="font-semibold text-sm">{reward.title}</p>
                            <p className="text-xs text-muted-foreground">{reward.user || reward.date}</p>
                        </div>
                    </div>
                    <Badge className="text-sm bg-green-100 text-green-700">+{reward.tokens}</Badge>
                </div>
            ))}
        </CardContent>
      </Card>

      <Button size="lg" className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90">
        <Gift className="w-5 h-5 mr-2" />
        Redeem Rewards (Coming Soon)
      </Button>
    </div>
  );
}
