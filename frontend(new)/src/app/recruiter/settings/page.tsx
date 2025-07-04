
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowRightLeft, Bell, HelpCircle, Linkedin, Lock, Shield, User, Building } from "lucide-react";
import Link from "next/link";

const recruiter = {
  name: "Emily Carter",
  company: "Innovate Inc.",
  company_logo: "https://placehold.co/100x100.png",
};

export default function RecruiterSettingsPage() {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar className="w-14 h-14 border-2 border-primary">
          <AvatarImage src={recruiter.company_logo} alt={recruiter.company} data-ai-hint="company logo" />
          <AvatarFallback>{recruiter.company.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold">{recruiter.name}</h1>
          <p className="text-sm text-muted-foreground">{recruiter.company}</p>
        </div>
      </div>
      
      {/* Profile Settings */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-base"><Building className="w-4 h-4" /> Company Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0">
          <div className="flex justify-between items-center p-3 rounded-lg bg-background border">
            <div className="flex items-center gap-3">
                <Linkedin className="w-6 h-6 text-[#0A66C2]" />
                <div>
                    <p className="font-semibold text-sm">Company LinkedIn</p>
                    <p className="text-xs text-green-600">Connected</p>
                </div>
            </div>
            <Button variant="destructive" size="sm">Disconnect</Button>
          </div>
           <div className="flex justify-between items-center p-3 rounded-lg bg-background border">
            <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-muted-foreground" />
                <div>
                    <p className="font-semibold text-sm">Company Email</p>
                    <p className="text-xs text-green-600">Verified</p>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-base"><Bell className="w-4 h-4" /> Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
            <div className="flex items-center justify-between">
                <Label htmlFor="new-apps" className="font-medium text-sm">New Applications</Label>
                <Switch id="new-apps" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="interview-reminders" className="font-medium text-sm">Interview Reminders</Label>
                <Switch id="interview-reminders" defaultChecked />
            </div>
        </CardContent>
      </Card>

      <Card>
          <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-base"><HelpCircle className="w-4 h-4" /> Support</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
              <Button variant="secondary" className="w-full">Contact Support</Button>
          </CardContent>
      </Card>
      
      {/* Switch Modules */}
      <Card>
          <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-base"><ArrowRightLeft className="w-4 h-4" /> Switch Module</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 grid grid-cols-1 gap-3">
              <Link href="/home" passHref>
                  <Button variant="outline" className="w-full h-12">
                      <User className="w-4 h-4 mr-2" />
                      Switch to User Section
                  </Button>
              </Link>
               <Link href="/verify-home" passHref>
                  <Button variant="outline" className="w-full h-12">
                      <Shield className="w-4 h-4 mr-2" />
                      Switch to Verifier Section
                  </Button>
              </Link>
          </CardContent>
      </Card>
      
    </div>
  );
}
