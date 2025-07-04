
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Image from "next/image";
import { Filter, MapPin, Search, Star, DollarSign } from "lucide-react";
import dynamic from "next/dynamic";
import { Bar, Pie, Cell, XAxis, YAxis, Tooltip, Legend } from 'recharts';


const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });


// Mock data
const user = {
  name: "Ayşe Yılmaz",
  profile_image: "https://placehold.co/100x100.png",
  trust_score: 92,
};

const featuredJobs = [
  { company: "Figma", logo: "https://placehold.co/50x50.png", hint: "figma logo", title: "UX Designer", salary: "120k-150k", score: 85 },
  { company: "Vercel", logo: "https://placehold.co/50x50.png", hint: "vercel logo", title: "DevRel Engineer", salary: "140k-170k", score: 90 },
  { company: "Notion", logo: "https://placehold.co/50x50.png", hint: "notion logo", title: "Community Manager", salary: "90k-110k", score: 80 },
  { company: "Apple", logo: "https://placehold.co/50x50.png", hint: "apple logo", title: "iOS Engineer", salary: "160k-200k", score: 95 },
];

const jobListings = [
    { company: "Amazon", logo: "https://placehold.co/40x40.png", hint: "amazon logo", title: "Cloud Architect", location: "Remote", salary: "150k", posted: "2d ago", status: "None" },
    { company: "Google", logo: "https://placehold.co/40x40.png", hint: "google logo", title: "Software Engineer", location: "Mountain View, CA", salary: "180k", posted: "4d ago", status: "Interview Scheduled" },
    { company: "Microsoft", logo: "https://placehold.co/40x40.png", hint: "microsoft logo", title: "Data Scientist", location: "Redmond, WA", salary: "165k", posted: "1w ago", status: "Applied" },
];

const industryData = [
  { name: 'FinTech', value: 5 }, { name: 'SaaS', value: 8 }, { name: 'AI/ML', value: 6 }, { name: 'Web3', value: 3 },
];

const outcomeData = [
  { name: 'Interviews', value: 4, color: '#60a5fa' },
  { name: 'Offers', value: 1, color: '#4ade80' },
  { name: 'No Resp.', value: 7, color: '#9ca3af' },
];

export default function JobsPage() {
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
            <p className="text-sm text-muted-foreground">Let's find your next role!</p>
          </div>
        </div>
        <Badge className="text-sm font-semibold bg-green-100 text-green-700 border-green-300">
            <Star className="w-4 h-4 mr-1 fill-current" />
            {user.trust_score}
        </Badge>
      </div>

      {/* Featured Jobs */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold px-1">Featured Jobs</h3>
        <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-2">
                {featuredJobs.map((job, i) => (
                    <CarouselItem key={i} className="basis-[75%] md:basis-1/2 lg:basis-1/3 pl-2">
                        <Card className="p-3">
                            <div className="flex items-center gap-3 mb-2">
                              <Image src={job.logo} width={36} height={36} alt={`${job.company} logo`} data-ai-hint={job.hint} className="rounded-full" />
                              <div>
                                <p className="font-bold text-sm">{job.company}</p>
                                <p className="text-xs text-muted-foreground">{job.title}</p>
                              </div>
                            </div>
                            <div className="space-y-1 text-xs">
                                <p className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-green-500" /> {job.salary}</p>
                                <p className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> Trust Score > {job.score}</p>
                            </div>
                            <Button size="sm" className="w-full mt-3 h-8">View Job</Button>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
      </div>


      {/* Job Listings */}
      <div className="space-y-2">
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search jobs, companies..." className="pl-9 h-10" />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 shrink-0"><Filter className="w-4 h-4" /></Button>
        </div>
        <div className="space-y-2">
            {jobListings.map((job, i) => (
                <Card key={i} className="p-3">
                    <div className="flex items-center gap-3">
                        <Image src={job.logo} width={40} height={40} alt={`${job.company} logo`} data-ai-hint={job.hint} className="rounded-lg" />
                        <div className="flex-1">
                             <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold">{job.title}</p>
                                    <p className="text-sm text-muted-foreground">{job.company}</p>
                                </div>
                                {job.status !== 'None' && <Badge variant={job.status === "Interview Scheduled" ? "default" : "secondary"} className="text-xs whitespace-nowrap">{job.status}</Badge>}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1.5">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {job.salary}</span>
                                <span>{job.posted}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
      </div>
      
      {/* Job Analytics */}
      <Card>
        <CardHeader className="p-3"><CardTitle className="text-sm font-medium">Your Job Analytics</CardTitle></CardHeader>
        <CardContent className="p-3 pt-0 grid grid-cols-2 gap-4">
            <div>
                <h3 className="font-semibold text-xs mb-2 text-center">By Industry</h3>
                <div className="h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={industryData} layout="vertical" margin={{ left: 10, right: 10, top: 0, bottom: 0 }}>
                           <XAxis type="number" hide />
                           <YAxis type="category" dataKey="name" width={50} tickLine={false} axisLine={false} fontSize={10} />
                           <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{ fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'hsl(var(--background))' }}/>
                           <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={12} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div>
                <h3 className="font-semibold text-xs mb-2 text-center">Outcomes</h3>
                 <div className="h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={outcomeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={5} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                                {outcomeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                             <Tooltip contentStyle={{ fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'hsl(var(--background))' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
