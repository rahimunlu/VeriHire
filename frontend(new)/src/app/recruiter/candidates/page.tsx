
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Filter, Search, Star, ShieldCheck } from "lucide-react";
import Image from "next/image";

const candidates = [
  { name: "Ayşe Yılmaz", avatar: "https://placehold.co/50x50.png", title: "Software Engineer", trust_score: 92, has_nft: true, skills: ["React", "TypeScript", "Next.js"] },
  { name: "David Chen", avatar: "https://placehold.co/50x50.png", title: "Product Manager", trust_score: 88, has_nft: true, skills: ["Agile", "Roadmapping", "JIRA"] },
  { name: "Maria Garcia", avatar: "https://placehold.co/50x50.png", title: "UX Designer", trust_score: 85, has_nft: false, skills: ["Figma", "User Research", "Prototyping"] },
  { name: "Ali Veli", avatar: "https://placehold.co/50x50.png", title: "DevOps Engineer", trust_score: 95, has_nft: true, skills: ["AWS", "Kubernetes", "Terraform"] },
];

export default function CandidatesPage() {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Briefcase className="w-8 h-8 text-primary"/>
        <div>
          <h1 className="text-xl font-bold font-headline">Candidate Discovery</h1>
          <p className="text-sm text-muted-foreground">Find your next great hire</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 space-y-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search skills, titles..." className="pl-9 h-10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Select>
                    <SelectTrigger className="h-10 text-xs">
                        <SelectValue placeholder="Trust Score" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="90">90+</SelectItem>
                        <SelectItem value="80">80+</SelectItem>
                        <SelectItem value="70">70+</SelectItem>
                    </SelectContent>
                </Select>
                 <Select>
                    <SelectTrigger className="h-10 text-xs">
                        <SelectValue placeholder="Experience" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1-3">1-3 Years</SelectItem>
                        <SelectItem value="3-5">3-5 Years</SelectItem>
                        <SelectItem value="5+">5+ Years</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <Button variant="secondary" className="w-full"><Filter className="w-4 h-4 mr-2"/>Apply Filters</Button>
        </CardContent>
      </Card>
      
      {/* Candidate List */}
      <div className="space-y-3">
        {candidates.map((candidate, i) => (
            <Card key={i} className="p-3">
                <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={candidate.avatar} alt={candidate.name} data-ai-hint="profile photo" />
                        <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <p className="font-bold">{candidate.name}</p>
                            <Badge className="text-sm bg-green-100 text-green-700 border-green-300">
                                <Star className="w-3 h-3 mr-1 fill-current" /> {candidate.trust_score}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{candidate.title}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {candidate.skills.map(skill => <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>)}
                            {candidate.has_nft && <Badge className="bg-primary/20 text-primary hover:bg-primary/20"><ShieldCheck className="w-3 h-3 mr-1"/> ZK Credential</Badge>}
                        </div>
                    </div>
                </div>
                 <div className="flex gap-2 mt-3">
                    <Button className="flex-1 h-9">View Profile</Button>
                    <Button variant="secondary" className="flex-1 h-9">Shortlist</Button>
                </div>
            </Card>
        ))}
      </div>

    </div>
  );
}
