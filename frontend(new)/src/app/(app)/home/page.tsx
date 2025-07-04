"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Copy, Share2, Star, FilePenLine, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Line, Tooltip, Pie, Cell, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useState, useEffect } from 'react';

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });


// Mock data
const user = {
    name: "Ayse Yilmaz",
    profile_image: "https://placehold.co/100x100.png",
    trust_score: 92,
    cv_link: "verihire.app/cv/ayseyilmaz"
};

const tokenData = [
    { name: 'Day 1', value: 50 }, { name: 'Day 5', value: 80 }, { name: 'Day 10', value: 100 }, { name: 'Day 15', value: 175 }, { name: 'Day 20', value: 215 }, { name: 'Day 25', value: 290 }, { name: 'Day 30', value: 405 },
];

const applications = [
    { company: "Google", logo: "https://placehold.co/40x40.png", hint: "google logo", title: "Software Engineer", date: "2024-06-28", status: "Interview Scheduled", progress: 75 },
    { company: "OpenAI", logo: "https://placehold.co/40x40.png", hint: "openai logo", title: "Product Manager", date: "2024-06-25", status: "Awaiting Verification", progress: 25 },
    { company: "Stripe", logo: "https://placehold.co/40x40.png", hint: "stripe logo", title: "Frontend Developer", date: "2024-06-22", status: "Offer Received", progress: 100 },
];

// Mock data will be replaced with real data
const initialVerificationData = [
    { name: 'Verified', value: 0, color: '#4ade80' },
    { name: 'Pending', value: 0, color: '#facc15' },
    { name: 'Rejected', value: 0, color: '#f87171' },
];

const trustScoreData = [
    { name: 'Jan', score: 65 }, { name: 'Feb', score: 70 }, { name: 'Mar', score: 72 }, { name: 'Apr', score: 80 }, { name: 'May', score: 85 }, { name: 'Jun', score: 92 },
];

const activityFeed = [
    { action: "Applied to Software Engineer at Google", date: "2 days ago", tokens: 0 },
    { action: "Employer 'Meta' verified your position", date: "3 days ago", tokens: 75 },
    { action: "Your AI Trust Score was calculated", date: "3 days ago", tokens: 40 },
    { action: "Uploaded your new CV", date: "4 days ago", tokens: 30 },
];

export default function HomePage() {
    const [verificationData, setVerificationData] = useState(initialVerificationData);
    const [verificationTotals, setVerificationTotals] = useState({ verified: 0, pending: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // For demo purposes, using a mock candidate ID
    // In a real app, this would come from authentication/session
    const candidateId = "demo-candidate-id";

    useEffect(() => {
        const fetchVerificationData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/verification/stats?candidate_id=${candidateId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch verification data');
                }

                const data = await response.json();

                if (data.verification_data) {
                    setVerificationData(data.verification_data);
                    setVerificationTotals(data.totals);
                }
            } catch (err) {
                console.error('Error fetching verification data:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch verification data');
            } finally {
                setLoading(false);
            }
        };

        fetchVerificationData();
    }, [candidateId]);

    return (
        <div className="p-4 space-y-4 bg-background">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="w-14 h-14 border-2 border-primary/50">
                        <AvatarImage src={user.profile_image} alt={user.name} data-ai-hint="profile photo" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-xl font-bold font-headline">Welcome!</h1>
                        <p className="text-sm text-muted-foreground">Your dashboard</p>
                    </div>
                </div>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 10 }}>
                    <Badge className="text-sm font-semibold border-2 bg-green-100 text-green-700 border-green-300 animate-pulse">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        {user.trust_score}
                    </Badge>
                </motion.div>
            </div>

            {/* Interview Invite */}
            <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-3 flex items-center justify-between gap-2">
                    <div>
                        <p className="font-bold text-primary">You have an interview! 🚀</p>
                        <p className="text-xs text-primary/80">Google has invited you for a live interview.</p>
                    </div>
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Video className="w-4 h-4 mr-1.5" />
                        Join
                    </Button>
                </CardContent>
            </Card>

            {/* Verified CV Link */}
            <Card>
                <CardContent className="p-3 flex items-center justify-between gap-2">
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs text-muted-foreground">Your Verified CV Link</p>
                        <p className="font-semibold truncate">{user.cv_link}</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost"><Copy className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost"><Share2 className="w-4 h-4" /></Button>
                    </div>
                </CardContent>
            </Card>

            {/* Analytics Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="p-3">
                        <CardTitle className="text-sm font-medium">TRUST Balance</CardTitle>
                        <p className="text-2xl font-bold text-primary">1,250</p>
                    </CardHeader>
                    <CardContent className="p-0 px-1 pb-1">
                        <div className="h-[50px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={tokenData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                    <Tooltip contentStyle={{ fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'hsl(var(--background))' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="p-3">
                        <CardTitle className="text-sm font-medium">Verifications</CardTitle>
                        <CardDescription className="text-xs">
                            {error ? 'Error loading data' : 'Employer status'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 flex items-center gap-2">
                        {error ? (
                            <div className="w-full text-center py-4">
                                <p className="text-xs text-red-500">{error}</p>
                            </div>
                        ) : (
                            <>
                                <div className="w-16 h-16 -ml-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={verificationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={30} innerRadius={20} paddingAngle={5}>
                                                {verificationData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'hsl(var(--background))' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center"><div className="w-1.5 h-1.5 mr-1.5 rounded-full bg-green-400" /> Verified</span>
                                        <strong>{loading ? '...' : verificationTotals.verified}</strong>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center"><div className="w-1.5 h-1.5 mr-1.5 rounded-full bg-yellow-400 animate-pulse" /> Pending</span>
                                        <strong>{loading ? '...' : verificationTotals.pending}</strong>
                                    </div>
                                    {verificationTotals.rejected > 0 && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="flex items-center"><div className="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-400" /> Rejected</span>
                                            <strong>{verificationTotals.rejected}</strong>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-2">
                <h3 className="text-base font-semibold px-1">Application Status</h3>
                <Carousel opts={{ align: "start" }} className="w-full">
                    <CarouselContent className="-ml-2">
                        {applications.map((app, i) => (
                            <CarouselItem key={i} className="basis-[85%] pl-2">
                                <Card className="p-3">
                                    <div className="flex items-start gap-3">
                                        <Image src={app.logo} width={36} height={36} alt={`${app.company} logo`} data-ai-hint={app.hint} className="rounded-md" />
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">{app.title}</p>
                                            <p className="text-xs text-muted-foreground">{app.company}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Progress value={app.progress} className="h-1.5 flex-1" />
                                                <Badge variant={app.status === 'Offer Received' ? 'default' : app.status === 'Interview Scheduled' ? 'secondary' : 'outline'} className="text-[10px] whitespace-nowrap">{app.status}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="p-3 pb-0">
                        <CardTitle className="text-sm font-medium">Trust Score Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="p-1">
                        <div className="h-[120px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trustScoreData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                                    <YAxis domain={[50, 100]} tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                                    <Tooltip contentStyle={{ fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'hsl(var(--background))' }} />
                                    <Line type="monotone" dataKey="score" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3, fill: 'hsl(var(--accent))' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="p-3 pb-2"><CardTitle className="text-sm font-medium">Recent Activity</CardTitle></CardHeader>
                    <CardContent className="p-3 pt-0">
                        <ul className="space-y-2 text-xs">
                            {activityFeed.slice(0, 3).map((item, i) => (
                                <li key={i} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{item.action}</p>
                                        <p className="text-muted-foreground">{item.date}</p>
                                    </div>
                                    {item.tokens > 0 && <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px]">+{item.tokens} TRUST</Badge>}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-3">
                <Link href="/my-cv" passHref>
                    <Button size="lg" className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90">
                        <FilePenLine className="w-5 h-5 mr-2" /> View or Edit My CV
                    </Button>
                </Link>
            </div>
        </div>
    )
}
