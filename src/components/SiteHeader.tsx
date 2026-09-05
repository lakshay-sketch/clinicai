"use client";

import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

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
    <Link href="/dashboard" className="text-sm text-ink hover:underline">
      Dashboard
    </Link>
  );
}

export default function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-serif text-lg text-ink">
          ClinicAI
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/find" className="text-sm text-ink-60 hover:text-ink">
            Find a Doctor
          </Link>
          <Show when="signed-out">
            <Link href="/sign-in" className="text-sm text-ink-60 hover:text-ink">
              Sign In
            </Link>
          </Show>
          <Show when="signed-in">
            <StaffDashboardLink />
            <UserButton />
          </Show>
        </nav>
      </div>
    </header>
  );
}
