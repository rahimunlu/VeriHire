
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bell, Briefcase, PlusCircle, Search, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Line, Pie, Cell, Tooltip } from 'recharts';

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });

const recruiter = {
  name: "Emily Carter",
  company_logo: "https://placehold.co/100x100.png",
  trust_balance: 4500,
};

const tokenData = [
  { name: 'Day 1', value: 500 }, { name: 'Day 5', value: 800 }, { name: 'Day 10', value: 1200 }, { name: 'Day 15', value: 2100 }, { name: 'Day 20', value: 3500 }, { name: 'Day 30', value: 4500 },
];

const applicationStatusData = [
  { name: 'Interviewing', value: 12, color: '#60a5fa' },
  { name: 'Offer Sent', value: 3, color: '#4ade80' },
  { name: 'New', value: 25, color: '#facc15' },
  { name: 'Rejected', value: 8, color: '#f87171' },
];

const activeJobs = [
    { title: "Senior Frontend Engineer", applicants: 48, progress: 60, status: "Interviewing" },
    { title: "Product Marketing Manager", applicants: 72, progress: 30, status: "Screening" },
];

const notifications = [
    { text: "New application for Senior Frontend Engineer from Ayşe Yılmaz (Trust Score: 92)", time: "5m ago" },
    { text: "Your job post 'Product Marketing Manager' is live!", time: "2h ago" },
];

export default function RecruiterHomePage() {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-primary/50">
            <AvatarImage src={recruiter.company_logo} alt="Company Logo" data-ai-hint="company logo" />
            <AvatarFallback>{recruiter.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold font-headline">Welcome!</h1>
            <p className="text-sm text-muted-foreground">Recruiter Dashboard</p>
          </div>
        </div>
        <Button variant="ghost" size="icon"><Bell className="w-5 h-5" /></Button>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/recruiter/post-job" passHref><Button size="lg" className="w-full h-14"><PlusCircle className="mr-2"/> Post New Job</Button></Link>
        <Link href="/recruiter/candidates" passHref><Button size="lg" className="w-full h-14" variant="secondary"><Search className="mr-2"/> Find Candidates</Button></Link>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 gap-4">
          <Card>
              <CardHeader className="p-3">
                  <CardTitle className="text-sm font-medium">TRUST Balance</CardTitle>
                  <motion.p initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} className="text-2xl font-bold text-primary">{recruiter.trust_balance.toLocaleString()}</motion.p>
              </CardHeader>
              <CardContent className="p-0 px-1 pb-1">
                  <div className="h-[50px]">
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={tokenData}>
                              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                              <Tooltip contentStyle={{ fontSize: '10px', padding: '2px 8px' }}/>
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="p-3">
                  <CardTitle className="text-sm font-medium">Applications</CardTitle>
                  <CardDescription className="text-xs">Live status</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 flex items-center justify-center">
                  <div className="w-24 h-24 -ml-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie data={applicationStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} innerRadius={25} paddingAngle={5}>
                                  {applicationStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                              </Pie>
                              <Tooltip contentStyle={{ fontSize: '10px', padding: '2px 8px' }}/>
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
              </CardContent>
          </Card>
      </div>

      {/* Active Job Posts */}
      <Card>
        <CardHeader className="p-3 pb-2"><CardTitle className="text-sm font-medium">Active Job Posts</CardTitle></CardHeader>
        <CardContent className="p-3 pt-0 space-y-3">
            {activeJobs.map((job, i) => (
                <div key={i} className="p-3 bg-background rounded-lg border">
                    <p className="font-semibold text-sm">{job.title}</p>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">{job.applicants} Applicants</p>
                        <Badge variant="secondary" className="text-xs">{job.status}</Badge>
                    </div>
                    <Progress value={job.progress} className="h-1.5 mt-2"/>
                </div>
            ))}
        </CardContent>
      </Card>
      
      {/* Notifications */}
      <Card>
        <CardHeader className="p-3 pb-2"><CardTitle className="text-sm font-medium">Notifications</CardTitle></CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
            {notifications.map((note, i) => (
                <div key={i} className="flex items-start gap-3 text-xs border-b pb-2 last:border-b-0">
                    <Bell className="w-4 h-4 text-primary mt-0.5"/>
                    <div className="flex-1">
                        <p>{note.text}</p>
                        <p className="text-muted-foreground">{note.time}</p>
                    </div>
                </div>
            ))}
        </CardContent>
      </Card>

    </div>
  );
}
