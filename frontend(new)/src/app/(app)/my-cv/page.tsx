
'use client';

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, PlusCircle, Copy, Share2, Save, UploadCloud, Link as LinkIcon, ShieldCheck, Briefcase, GraduationCap, Star, ExternalLink } from "lucide-react";

const userCV = {
  personalInfo: {
    name: "Ayşe Yılmaz",
    email: "ayse.yilmaz@email.com",
    phone: "+90 555 123 4567",
    location: "Istanbul, Turkey",
    linkedin: "linkedin.com/in/ayseyilmaz",
    github: "github.com/ayseyilmaz",
    profile_image: "https://placehold.co/100x100.png"
  },
  workExperience: [
    {
      id: 1,
      title: "Software Engineer",
      company: "Google",
      location: "Remote",
      dates: "Jan 2022 - Present",
      description: "Developed and maintained features for Google's core search products, improving latency by 15%.",
      isVerified: true,
    },
    {
      id: 2,
      title: "Intern",
      company: "Facebook",
      location: "Menlo Park, CA",
      dates: "May 2021 - Aug 2021",
      description: "Worked on the News Feed team, implementing new UI components with React and GraphQL.",
      isVerified: true,
    },
  ],
  education: [
    {
      id: 1,
      institution: "Boğaziçi University",
      degree: "B.S. in Computer Engineering",
      dates: "2018 - 2022",
      gpa: "3.8/4.0",
    },
  ],
  skills: ["React", "TypeScript", "Node.js", "GraphQL", "Next.js", "Firebase", "Tailwind CSS"],
  portfolio: [
    { id: 1, name: "Personal Website", url: "ayse.dev" },
    { id: 2, name: "Project VeriHire", url: "github.com/ayseyilmaz/verihire" },
  ],
  cv_link: "verihire.app/cv/ayseyilmaz"
};


export default function MyCvPage() {
  const { toast } = useToast();

  const copyLink = () => {
    navigator.clipboard.writeText(userCV.cv_link);
    toast({ title: "Link Copied!", description: "Your verified CV link is in your clipboard." });
  };
  
  const handleSaveChanges = () => {
    toast({ title: "Changes Saved!", description: "Your CV has been successfully updated.", className: "bg-green-100 text-green-700" });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12 border-2 border-primary/50">
          <AvatarImage src={userCV.personalInfo.profile_image} alt={userCV.personalInfo.name} data-ai-hint="profile photo" />
          <AvatarFallback>{userCV.personalInfo.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold font-headline">{userCV.personalInfo.name}'s CV</h1>
          <p className="text-sm text-muted-foreground">Manage your professional profile</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><LinkIcon className="w-4 h-4" /> Your Verified CV Link</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-2">
            <p className="font-semibold truncate text-sm text-primary">{userCV.cv_link}</p>
            <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={copyLink}><Copy className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost"><Share2 className="w-4 h-4" /></Button>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-14 h-14">
              <AvatarImage src={userCV.personalInfo.profile_image} alt={userCV.personalInfo.name} data-ai-hint="profile photo" />
              <AvatarFallback>{userCV.personalInfo.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{userCV.personalInfo.name}</CardTitle>
              <CardDescription>{userCV.personalInfo.email}</CardDescription>
            </div>
          </div>
           <Button size="icon" variant="ghost"><Edit className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <p><strong>Phone:</strong> {userCV.personalInfo.phone}</p>
          <p><strong>Location:</strong> {userCV.personalInfo.location}</p>
          <p className="col-span-2"><strong>LinkedIn:</strong> <a href="#" className="text-primary">{userCV.personalInfo.linkedin}</a></p>
          <p className="col-span-2"><strong>GitHub:</strong> <a href="#" className="text-primary">{userCV.personalInfo.github}</a></p>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 text-base"><Briefcase className="w-4 h-4" /> Work Experience</CardTitle>
                  <Button size="sm" variant="ghost"><PlusCircle className="w-4 h-4 mr-1" /> Add</Button>
              </div>
          </CardHeader>
          <CardContent>
              <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                  {userCV.workExperience.map(exp => (
                      <AccordionItem key={exp.id} value={`item-${exp.id}`}>
                          <AccordionTrigger>
                            <div className="flex-1 text-left">
                              <p className="font-bold">{exp.title}</p>
                              <p className="text-sm text-muted-foreground">{exp.company}</p>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-2">
                              <div className="flex justify-between items-center text-xs text-muted-foreground">
                                <span>{exp.dates}</span>
                                {exp.isVerified && <Badge variant="outline" className="border-green-400 bg-green-50 text-green-700"><ShieldCheck className="w-3 h-3 mr-1"/>Verified</Badge>}
                              </div>
                              <p className="text-sm">{exp.description}</p>
                              <div className="flex gap-2 pt-2">
                                  <Button size="sm" variant="outline"><Edit className="w-3 h-3 mr-1.5"/> Edit</Button>
                                  <Button size="sm" variant="destructive" className="bg-red-100 text-red-600 hover:bg-red-200"><Trash2 className="w-3 h-3 mr-1.5"/> Remove</Button>
                              </div>
                          </AccordionContent>
                      </AccordionItem>
                  ))}
              </Accordion>
          </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 text-base"><GraduationCap className="w-4 h-4" /> Education</CardTitle>
                  <Button size="sm" variant="ghost"><PlusCircle className="w-4 h-4 mr-1" /> Add</Button>
              </div>
          </CardHeader>
          <CardContent>
             <Accordion type="single" collapsible className="w-full">
                  {userCV.education.map(edu => (
                      <AccordionItem key={edu.id} value={`item-${edu.id}`}>
                          <AccordionTrigger>
                            <div className="flex-1 text-left">
                              <p className="font-bold">{edu.institution}</p>
                              <p className="text-sm text-muted-foreground">{edu.degree}</p>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-2">
                              <p className="text-xs text-muted-foreground">{edu.dates}</p>
                              <p className="text-sm">GPA: {edu.gpa}</p>
                              <div className="flex gap-2 pt-2">
                                  <Button size="sm" variant="outline"><Edit className="w-3 h-3 mr-1.5"/> Edit</Button>
                                  <Button size="sm" variant="destructive" className="bg-red-100 text-red-600 hover:bg-red-200"><Trash2 className="w-3 h-3 mr-1.5"/> Remove</Button>
                              </div>
                          </AccordionContent>
                      </AccordionItem>
                  ))}
              </Accordion>
          </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <div className="flex justify-between items-center">
                 <CardTitle className="flex items-center gap-2 text-base"><Star className="w-4 h-4" /> Skills</CardTitle>
                 <Button size="sm" variant="ghost"><Edit className="w-4 h-4 mr-1"/> Edit</Button>
              </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
              {userCV.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
          </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-base"><ExternalLink className="w-4 h-4" /> Portfolio</CardTitle>
                <Button size="sm" variant="ghost"><PlusCircle className="w-4 h-4 mr-1" /> Add</Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {userCV.portfolio.map(item => (
            <div key={item.id} className="flex items-center justify-between p-2 bg-background rounded-lg border">
              <div>
                <p className="font-semibold text-sm">{item.name}</p>
                <a href={`https://${item.url}`} target="_blank" className="text-xs text-primary hover:underline">{item.url}</a>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost"><Edit className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost"><Trash2 className="w-4 h-4 text-red-500" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
       <div className="space-y-3 pt-2">
        <label htmlFor="cv-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-primary/30 border-dashed rounded-2xl cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                <UploadCloud className="w-8 h-8 mb-2 text-primary" />
                <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Upload a new CV</span></p>
                <p className="text-xs text-muted-foreground">Re-parse to update your profile automatically</p>
            </div>
            <input id="cv-upload" type="file" className="hidden" accept=".pdf" />
        </label>
        <Button onClick={handleSaveChanges} size="lg" className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90">
            <Save className="w-5 h-5 mr-2" />
            Save All Changes
        </Button>
       </div>
    </div>
  );
}
