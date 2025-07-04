
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Clock } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Pie, Cell, Tooltip, Legend } from 'recharts';

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });


// Mock data
const user = {
  name: "Ayşe Yılmaz",
  profile_image: "https://placehold.co/100x100.png",
};

const pendingVerifications = [
  { company: "Google", logo: "https://placehold.co/40x40.png", hint: "google logo", title: "Software Engineer", verifier: "manager@google.com", status: "Pending", requested: "2 days ago" },
  { company: "Facebook", logo: "https://placehold.co/40x40.png", hint: "facebook logo", title: "Intern", verifier: "hr@meta.com", status: "Pending", requested: "2 days ago" },
];

const completedVerifications = [
   { company: "Stripe", logo: "https://placehold.co/40x40.png", hint: "stripe logo", title: "Frontend Developer", verifier: "lead@stripe.com", status: "Verified", requested: "1 week ago" },
];

const verificationData = [
  { name: 'Verified', value: 1, color: '#4ade80' },
  { name: 'Pending', value: 2, color: '#facc15' },
  { name: 'Rejected', value: 0, color: '#f87171' },
];

export default function VerificationsPage() {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12 border-2 border-primary/50">
          <AvatarImage src={user.profile_image} alt={user.name} data-ai-hint="profile photo" />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold font-headline">Verification Center</h1>
          <p className="text-sm text-muted-foreground">Track your credential status</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center justify-center text-center p-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <p className="text-4xl font-bold text-primary">{pendingVerifications.length}</p>
            <CardDescription className="text-xs mt-1">requests awaiting response</CardDescription>
        </Card>
        <Card>
            <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm font-medium">Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex justify-center items-center">
                <div className="h-[100px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={verificationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={35} innerRadius={25} paddingAngle={5}>
                                {verificationData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'hsl(var(--background))' }}/>
                            <Legend layout="vertical" align="right" verticalAlign="middle" height={80} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-semibold px-1">Action Required</h3>
        <div className="space-y-3">
          {pendingVerifications.map((verification, i) => (
            <Card key={i} className="p-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Image src={verification.logo} width={36} height={36} alt={`${verification.company} logo`} data-ai-hint={verification.hint} className="rounded-lg" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{verification.title} at {verification.company}</p>
                  <p className="text-xs text-muted-foreground">To: {verification.verifier}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                   <Badge variant="outline" className="flex items-center gap-1.5 capitalize border-yellow-400 bg-yellow-50 text-yellow-700">
                     <Clock className="w-3 h-3 animate-pulse" />
                     {verification.status}
                   </Badge>
                   <Button size="sm" variant="secondary" className="h-7 text-xs">
                     <Send className="w-3 h-3 mr-1.5" />
                     Resend
                   </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

       <div className="space-y-2">
        <h3 className="text-base font-semibold px-1">Completed</h3>
        <div className="space-y-3">
          {completedVerifications.map((verification, i) => (
            <Card key={i} className="p-3 bg-card/50">
              <div className="flex items-center gap-3">
                <Image src={verification.logo} width={36} height={36} alt={`${verification.company} logo`} data-ai-hint={verification.hint} className="rounded-lg" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{verification.title} at {verification.company}</p>
                  <p className="text-xs text-muted-foreground">From: {verification.verifier}</p>
                </div>
                <Badge variant="outline" className="capitalize bg-green-100 text-green-700 border-green-300">
                    {verification.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground pt-2">
        Verification requests are sent via magic links to the provided email and LinkedIn accounts.
      </p>
    </div>
  );
}
