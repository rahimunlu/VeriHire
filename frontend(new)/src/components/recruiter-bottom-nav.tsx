
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, PlusCircle, Award, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/recruiter/home", icon: Home, label: "Home" },
  { href: "/recruiter/candidates", icon: Users, label: "Candidates" },
  { href: "/recruiter/post-job", icon: PlusCircle, label: "Post Job" },
  { href: "/recruiter/rewards", icon: Award, label: "Rewards" },
  { href: "/recruiter/settings", icon: Settings, label: "Settings" },
];

export function RecruiterBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background/80 backdrop-blur-sm border-t z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 text-muted-foreground transition-all duration-200 ease-in-out",
                "hover:text-primary",
                isActive ? "text-primary scale-110" : "scale-100"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
