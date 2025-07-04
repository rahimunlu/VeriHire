
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });

const verifier = {
  name: "John Doe",
  profile_image: "https://placehold.co/100x100.png",
};

const history = [
  { name: "Ayşe Yılmaz", status: "Approved", date: "2024-07-04", accuracy: "+1.0%" },
  { name: "Mehmet Öztürk", status: "Rejected", date: "2024-07-03", accuracy: "No change" },
  { name: "Zeynep Kaya", status: "Approved", date: "2024-07-01", accuracy: "+1.0%" },
  { name: "Mustafa Demir", status: "Approved", date: "2024-06-28", accuracy: "+1.0%" },
];

const monthlyData = [
  { month: 'Apr', approved: 25, rejected: 2 },
  { month: 'May', approved: 38, rejected: 1 },
  { month: 'Jun', approved: 45, rejected: 4 },
  { month: 'Jul', approved: 15, rejected: 1 },
];

export default function VerifyHistoryPage() {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12 border-2 border-primary/50">
          <AvatarImage src={verifier.profile_image} alt={verifier.name} data-ai-hint="profile photo" />
          <AvatarFallback>{verifier.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold font-headline">Verification History</h1>
          <p className="text-sm text-muted-foreground">Your past activity</p>
        </div>
      </div>

      <Card>
        <CardHeader className="p-3">
            <CardTitle className="text-sm font-medium">Monthly Activity</CardTitle>
            <CardDescription className="text-xs">Approved vs. Rejected requests</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
            <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                       <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} />
                       <YAxis tickLine={false} axisLine={false} fontSize={10}/>
                       <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{ fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'hsl(var(--background))' }}/>
                       <Legend wrapperStyle={{fontSize: '10px'}} iconSize={8} />
                       <Bar dataKey="approved" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Approved" />
                       <Bar dataKey="rejected" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Rejected" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-base font-semibold px-1">Completed Verifications</h3>
        <div className="space-y-3">
          {history.map((item, i) => (
            <Card key={i} className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <div className="flex items-center gap-2">
                   <p className="text-xs font-semibold text-muted-foreground">{item.accuracy}</p>
                   {item.status === 'Approved' ? (
                       <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>
                   ) : (
                       <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>
                   )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}
