"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const DEFAULT_CLINIC_ID = "clinic_01";

function navClass(active: boolean, transparent: boolean) {
  const base = "text-xs uppercase tracking-widest pb-1 border-b transition-colors";
  if (transparent) {
    return `${base} ${active ? "text-paper border-paper/70" : "text-paper/80 hover:text-paper border-transparent"}`;
  }
  return `${base} ${active ? "text-ink border-teal" : "text-ink-70 hover:text-ink border-transparent"}`;
}

function StaffDashboardLink({ dark }: { dark?: boolean }) {
  const [isStaff, setIsStaff] = useState(false);
  const pathname = usePathname() ?? "";

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data.type === "STAFF") setIsStaff(true);
      })
      .catch(() => {});
  }, []);

  if (!isStaff) return null;

  return (
    <Link href="/dashboard" className={navClass(pathname.startsWith("/dashboard"), !!dark)}>
      Dashboard
    </Link>
  );
}

export default function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname() ?? "";

  return (
    <header
      className={`sticky top-0 z-20 ${
        transparent ? "bg-transparent" : "border-b border-line bg-paper/90 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className={`font-serif text-lg tracking-tight ${transparent ? "text-paper" : "text-ink"}`}
        >
          ClinicAI
        </Link>
        <nav className="flex items-center gap-8">
          <Link
            href="/find"
            className={navClass(pathname.startsWith("/find") || pathname.startsWith("/doctors"), transparent)}
          >
            Find a Doctor
          </Link>
          <Link
            href={`/chat/${DEFAULT_CLINIC_ID}`}
            className={navClass(pathname.startsWith("/chat"), transparent)}
          >
            Ask ClinicAI
          </Link>
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className={`text-xs uppercase tracking-widest px-4 py-2 border ${
                transparent
                  ? "border-paper/40 text-paper hover:border-paper"
                  : "border-line-strong text-ink hover:border-ink"
              }`}
            >
              Sign In
            </Link>
          </Show>
          <Show when="signed-in">
            <Link href="/my-appointments" className={navClass(pathname.startsWith("/my-appointments"), transparent)}>
              My Appointments
            </Link>
            <StaffDashboardLink dark={transparent} />
            <UserButton />
          </Show>
        </nav>
      </div>
    </header>
  );
}
