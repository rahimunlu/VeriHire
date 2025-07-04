
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, X, Clock, ChevronsRight, QrCode, Linkedin, CheckCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { Pie, Cell, Tooltip } from 'recharts';
import { motion } from "framer-motion";

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });

// Mock data
const verifier = {
  name: "John Doe",
  profile_image: "https://placehold.co/100x100.png",
  accuracy: 97,
  rewards: 1850,
};

const accuracyData = [
  { name: 'Accurate', value: 97, color: 'hsl(var(--primary))' },
  { name: 'Remaining', value: 3, color: 'hsl(var(--muted))' },
];

const requests = [
  { name: "Ayşe Yılmaz", position: "Software Engineer at Google", date: "2h ago" },
  { name: "Berk Can", position: "Product Manager at OpenAI", date: "1d ago" },
];

const referrals = [
    { name: "Ali Veli", status: "3 verifications done!" },
    { name: "Ceyda Naz", status: "Joined" },
];

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

export default function VerifyHomePage() {
  const [linkedInConnected, setLinkedInConnected] = useState(false);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12 border-2 border-primary/50">
          <AvatarImage src={verifier.profile_image} alt={verifier.name} data-ai-hint="profile photo" />
          <AvatarFallback>{verifier.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold font-headline">Welcome, {verifier.name}!</h1>
          <p className="text-sm text-muted-foreground">Your Verifier Dashboard</p>
        </div>
      </div>

      {/* LinkedIn Connect Card */}
      <Card>
        <CardContent className="p-3">
          {linkedInConnected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-semibold text-sm">LinkedIn Connected</p>
                  <p className="text-xs text-muted-foreground">Your account is ready.</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setLinkedInConnected(false)}>Disconnect</Button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
              <div>
                <p className="font-bold text-primary">Connect LinkedIn</p>
                <p className="text-xs text-primary/80">Boost your verifier score.</p>
              </div>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setLinkedInConnected(true)}>
                <Linkedin className="w-4 h-4 mr-1.5" />
                Connect
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center justify-center p-2">
            <CardHeader className="p-1 pb-0">
                <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex items-center justify-center">
                <div className="w-20 h-20 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={accuracyData} dataKey="value" cx="50%" cy="50%" innerRadius={25} outerRadius={35} startAngle={90} endAngle={450}>
                                {accuracyData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color}/>)}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">{verifier.accuracy}%</span>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="text-center flex flex-col justify-center items-center p-4 bg-primary/10">
            <CardTitle className="text-sm font-medium">Rewards Earned</CardTitle>
            <motion.p initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} className="text-4xl font-bold text-primary">{verifier.rewards.toLocaleString()}</motion.p>
            <CardDescription className="text-xs">TRUST Tokens</CardDescription>
        </Card>
      </div>

      <Card>
        <CardContent className="p-3">
          <p className="text-sm font-semibold mb-1">Monthly Accuracy Bonus</p>
          <Progress value={70} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1 text-right">30% to next bonus</p>
        </CardContent>
      </Card>
      
      {/* Incoming Requests */}
      <div className="space-y-2">
          <h3 className="text-base font-semibold px-1">Incoming Requests</h3>
          <motion.div className="space-y-3" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 }}}}>
            {requests.map((req, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <Card className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{req.name}</p>
                          <p className="text-sm text-muted-foreground">{req.position}</p>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1.5 border-yellow-400 bg-yellow-50 text-yellow-700">
                          <Clock className="w-3 h-3 animate-pulse" /> New
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                          <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white"><Check className="w-4 h-4 mr-1.5"/> Approve (+40)</Button>
                          <Button variant="destructive" className="flex-1"><X className="w-4 h-4 mr-1.5"/> Reject</Button>
                      </div>
                  </Card>
                </motion.div>
            ))}
          </motion.div>
      </div>
      
      {/* Referral Program */}
      <Card>
        <CardHeader className="p-3">
            <CardTitle className="text-sm font-medium">Refer New Verifiers</CardTitle>
            <CardDescription className="text-xs">Earn 200 TRUST for every 2 successful referrals.</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-3">
            <Button variant="secondary" className="w-full h-10"><QrCode className="mr-2" /> Show My Invite Code</Button>
            <div className="space-y-2">
                {referrals.map((ref, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-background rounded-lg border">
                        <p className="font-medium text-sm">{ref.name}</p>
                        <p className="text-xs text-primary">{ref.status}</p>
                    </div>
                ))}
            </div>
            <Progress value={50} className="h-1.5" />
        </CardContent>
      </Card>
    </div>
  )
}
