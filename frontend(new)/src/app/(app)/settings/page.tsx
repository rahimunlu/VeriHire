
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Briefcase, HelpCircle, Info, Linkedin, Lock, Shield, Star, User, UserPlus, ArrowRightLeft } from "lucide-react";
import Link from "next/link";

const user = {
  name: "Ayşe Yılmaz",
  email: "ayse.yilmaz@email.com",
  profile_image: "https://placehold.co/100x100.png",
  trust_score: 92,
  bio: "Passionate product manager with a knack for building user-centric applications."
};

const faqItems = [
    { q: "What is a TRUST score?", a: "Your TRUST score is an AI-calculated metric from 0-100 that represents the strength and verifiability of your professional credentials. A higher score means more trust from recruiters." },
    { q: "How is my data protected?", a: "We use Zero-Knowledge proofs and store only verified credentials on-chain. Your personal data and raw CV are never shared without your explicit consent." },
    { q: "Can I use my TRUST tokens?", a: "TRUST tokens are currently used to track your progress and reputation within the VeriHire ecosystem. Future features will allow you to redeem them for premium services." },
]

export default function SettingsPage() {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar className="w-14 h-14 border-2 border-primary">
          <AvatarImage src={user.profile_image} alt={user.name} data-ai-hint="profile photo" />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold">{user.name}</h1>
          <Badge className="mt-1 font-semibold bg-green-100 text-green-700 border-green-300">
            <Star className="w-4 h-4 mr-1 fill-current" />
            Trust Score: {user.trust_score}
          </Badge>
        </div>
      </div>
      
      {/* Profile Settings */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-base"><User className="w-4 h-4" /> Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs">Full Name</Label>
            <Input id="name" defaultValue={user.name} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bio" className="text-xs">Bio</Label>
            <Textarea id="bio" defaultValue={user.bio} rows={3} />
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-background border">
            <div className="flex items-center gap-3">
                <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                <div>
                    <p className="font-semibold text-sm">LinkedIn</p>
                    <p className="text-xs text-green-600">Connected</p>
                </div>
            </div>
            <Button variant="destructive" size="sm">Disconnect</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-base"><Info className="w-4 h-4" /> Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-2">
          <Button><Briefcase className="w-4 h-4 mr-2" /> Apply to Jobs</Button>
          <Button variant="outline"><UserPlus className="w-4 h-4 mr-2" /> Invite Friend</Button>
        </CardContent>
      </Card>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Notifications */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="flex items-center gap-2 text-base"><Bell className="w-4 h-4" /> Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
              <div className="flex items-center justify-between">
                  <Label htmlFor="job-alerts" className="font-medium text-sm">Job Alerts</Label>
                  <Switch id="job-alerts" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                  <Label htmlFor="interview-req" className="font-medium text-sm">Interview Requests</Label>
                  <Switch id="interview-req" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                  <Label htmlFor="app-updates" className="font-medium text-sm">App Updates</Label>
                  <Switch id="app-updates" />
              </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="flex items-center gap-2 text-base"><Shield className="w-4 h-4" /> Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2"><Lock className="w-4 h-4"/> Change Password</Button>
              <div className="flex items-center justify-between">
                  <Label htmlFor="2fa" className="font-medium text-sm">Enable 2FA</Label>
                  <Switch id="2fa" />
              </div>
              <a href="#" className="text-sm text-primary hover:underline">View Privacy Policy</a>
          </CardContent>
        </Card>
      </div>

      {/* Support */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-base"><HelpCircle className="w-4 h-4" /> Support</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-sm">{item.q}</AccordionTrigger>
                    <AccordionContent className="text-xs">{item.a}</AccordionContent>
                </AccordionItem>
            ))}
          </Accordion>
           <Button variant="secondary" className="w-full mt-4">Contact Support</Button>
        </CardContent>
      </Card>
      
      {/* Switch Modules */}
      <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><ArrowRightLeft className="w-4 h-4" /> Switch Module</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 grid grid-cols-1 gap-3">
              <Link href="/verify-home" passHref>
                  <Button variant="outline" className="w-full h-12">
                      <Shield className="w-4 h-4 mr-2" />
                      Switch to Verifier Section
                  </Button>
              </Link>
              <Link href="/recruiter-auth" passHref>
                  <Button variant="outline" className="w-full h-12">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Switch to Recruiter Section
                  </Button>
              </Link>
          </CardContent>
      </Card>

      {/* App Info */}
       <div className="text-center text-xs text-muted-foreground space-y-1 pb-4">
            <p>Version: 1.0.0 (Beta)</p>
            <p><a href="#" className="text-primary hover:underline">Terms of Service</a> &bull; <a href="#" className="text-primary hover:underline">Privacy Policy</a></p>
            <p>Built with ❤️ in Firebase Studio</p>
       </div>
    </div>
  );
}
