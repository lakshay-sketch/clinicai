"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Stethoscope,
  ListOrdered,
  BarChart3,
  Users,
  Settings2,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/dashboard/queue", label: "Live Queue", icon: ListOrdered },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/staff", label: "Staff", icon: Users },
  { href: "/dashboard/settings", label: "Clinic Settings", icon: Settings2 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Exact match for the root overview route; startsWith for everything else
  // so a nested route (e.g. a future /dashboard/doctors/[id]) still highlights.
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const currentLabel = navItems.find((item) => isActive(item.href))?.label ?? "Dashboard";

  return (
    <div className="min-h-screen bg-paper">
      {/* Top header */}
      <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-paper/95 backdrop-blur-sm border-b border-line flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-serif text-lg tracking-tight text-ink hover:text-ink/80">
            ClinicAI
          </Link>
          <span className="w-px h-5 bg-line" />
          <span className="text-sm text-ink-70">{currentLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-50 uppercase tracking-wide hidden sm:inline">
            Staff account
          </span>
          <UserButton />
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 bottom-0 w-64 shrink-0 bg-ink text-paper flex flex-col">
          <nav className="flex-1 px-3 py-5 space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 pl-3 pr-3 py-2.5 text-sm border-l-2 transition-colors ${
                    active
                      ? "border-teal bg-paper/10 text-paper font-medium"
                      : "border-transparent text-paper/70 hover:text-paper hover:bg-paper/5"
                  }`}
                >
                  <Icon size={17} strokeWidth={1.75} className={active ? "text-teal" : "text-paper/60"} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 ml-64 px-10 py-10 animate-in">{children}</main>
      </div>
    </div>
  );
}
