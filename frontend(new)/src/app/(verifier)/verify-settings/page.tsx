
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowRightLeft, Bell, HelpCircle, Linkedin, Lock, Shield, User, Briefcase } from "lucide-react";
import Link from "next/link";

const verifier = {
  name: "John Doe",
  profile_image: "https://placehold.co/100x100.png",
};

export default function VerifySettingsPage() {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar className="w-14 h-14 border-2 border-primary">
          <AvatarImage src={verifier.profile_image} alt={verifier.name} data-ai-hint="profile photo" />
          <AvatarFallback>{verifier.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold">{verifier.name}</h1>
          <p className="text-sm text-muted-foreground">Verifier Profile</p>
        </div>
      </div>
      
      {/* Profile Settings */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-base"><User className="w-4 h-4" /> Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0">
          <div className="flex justify-between items-center p-3 rounded-lg bg-background border">
            <div className="flex items-center gap-3">
                <Linkedin className="w-6 h-6 text-[#0A66C2]" />
                <div>
                    <p className="font-semibold text-sm">LinkedIn</p>
                    <p className="text-xs text-green-600">Connected as John Doe</p>
                </div>
            </div>
            <Button variant="destructive" size="sm">Disconnect</Button>
          </div>
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
                  <Label htmlFor="new-requests" className="font-medium text-sm">New Requests</Label>
                  <Switch id="new-requests" defaultChecked />
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
          </CardContent>
        </Card>
      </div>

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
          <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center gap-2 text-base"><ArrowRightLeft className="w-4 h-4" /> Switch Module</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 grid grid-cols-1 gap-3">
              <Link href="/home" passHref>
                  <Button variant="outline" className="w-full h-12">
                      <User className="w-4 h-4 mr-2" />
                      Switch to User Section
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
      
       <div className="text-center text-xs text-muted-foreground space-y-1 pb-4">
            <p>Verifier Module v1.0.0 (Beta)</p>
       </div>
    </div>
  );
}
