
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Copy, Gift, Star, UserPlus } from "lucide-react";
import dynamic from "next/dynamic";
import { Pie, Cell, Tooltip, Legend } from 'recharts';

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });


// Mock data
const user = {
  name: "Ayşe Yılmaz",
  profile_image: "https://placehold.co/100x100.png",
  total_trust: 1250,
};

const breakdownData = [
  { name: 'Referrals', value: 300, color: '#a78bfa' },
  { name: 'Verifications', value: 600, color: '#60a5fa' },
  { name: 'Interviews', value: 150, color: '#34d399' },
  { name: 'Sign Up', value: 200, color: '#facc15' },
];

const recentRewards = [
    { title: "Employer Verification", company: "Google", tokens: 75, date: "2 days ago" },
    { title: "Interview Participation", company: "OpenAI", tokens: 40, date: "5 days ago" },
    { title: "Successful Referral", friend: "Ali Veli", tokens: 100, date: "1 week ago" },
];

const referrals = [
    { name: "Ali Veli", status: "Verified!", progress: 100, image: "https://placehold.co/40x40.png" },
    { name: "Berk Can", status: "Pending", progress: 50, image: "https://placehold.co/40x40.png" },
    { name: "Ceyda Naz", status: "Invited", progress: 10, image: "https://placehold.co/40x40.png" },
];


export default function RewardsPage() {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-primary/50">
              <AvatarImage src={user.profile_image} alt={user.name} data-ai-hint="profile photo" />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{user.name}</p>
              <p className="text-sm text-muted-foreground">Your rewards hub</p>
            </div>
          </div>
        </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 gap-4">
          <Card className="text-center flex flex-col justify-center items-center p-4">
              <CardTitle className="text-sm font-medium">Total TRUST</CardTitle>
              <p className="text-4xl font-bold text-primary animate-bounce">{user.total_trust.toLocaleString()}</p>
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
        <CardHeader className="p-3"><CardTitle className="text-sm font-medium">Recent Rewards</CardTitle></CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
            {recentRewards.map((reward, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-background rounded-lg border">
                    <div>
                        <p className="font-semibold text-sm">{reward.title}</p>
                        <p className="text-xs text-muted-foreground">{reward.company || reward.friend}</p>
                    </div>
                    <Badge className="text-sm bg-green-100 text-green-700">+{reward.tokens}</Badge>
                </div>
            ))}
        </CardContent>
      </Card>

      {/* Referral Program */}
      <Card>
        <CardHeader className="p-3">
            <CardTitle className="text-sm font-medium">Refer a Friend</CardTitle>
            <CardDescription className="text-xs">Earn 100 TRUST per verified friend.</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-3">
            <Button className="w-full h-10"><UserPlus className="mr-2" /> Invite & Earn 100 TRUST</Button>
            <div>
                <h4 className="font-semibold mb-2 text-xs">Your Referrals</h4>
                <div className="space-y-2">
                    {referrals.map((ref, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={ref.image} alt={ref.name} data-ai-hint="profile photo" />
                                <AvatarFallback>{ref.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="font-medium text-sm">{ref.name}</p>
                                    <p className="text-xs font-semibold text-primary">{ref.status}</p>
                                </div>
                                <Progress value={ref.progress} className="h-1 mt-1" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
      </Card>

      <Button size="lg" className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90">
        <Gift className="w-5 h-5 mr-2" />
        Claim Rewards (Mock)
      </Button>
    </div>
  );
}
