"use client";

import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const DEFAULT_CLINIC_ID = "clinic_01";

function StaffDashboardLink() {
  const [isStaff, setIsStaff] = useState(false);

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
    <Link href="/dashboard" className="text-sm text-ink-70 hover:text-ink">
      Dashboard
    </Link>
  );
}

export default function SiteHeader() {
  return (
    <header className="border-b border-line sticky top-0 bg-paper/90 backdrop-blur-sm z-10">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-lg text-ink tracking-tight">
          ClinicAI
        </Link>
        <nav className="flex items-center gap-7">
          <Link href="/find" className="text-sm text-ink-70 hover:text-ink">
            Find a Doctor
          </Link>
          <Link href={`/chat/${DEFAULT_CLINIC_ID}`} className="text-sm text-teal hover:underline underline-offset-2">
            Ask ClinicAI
          </Link>
          <Show when="signed-out">
            <Link href="/sign-in" className="text-sm text-ink-70 hover:text-ink">
              Sign In
            </Link>
          </Show>
          <Show when="signed-in">
            <Link href="/my-appointments" className="text-sm text-ink-70 hover:text-ink">
              My Appointments
            </Link>
            <StaffDashboardLink />
            <UserButton />
          </Show>
        </nav>
      </div>
    </header>
  );
}
