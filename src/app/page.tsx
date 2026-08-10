"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-2xl font-semibold">ClinicAI — Setup Verification</h1>

      {!isSignedIn && (
        <>
          <p className="text-zinc-600 dark:text-zinc-400">You are not signed in.</p>
          <div className="flex gap-4">
            <Link href="/sign-in" className="underline">Sign In</Link>
            <Link href="/sign-up" className="underline">Sign Up</Link>
          </div>
        </>
      )}

      {isSignedIn && (
        <>
          <p className="text-zinc-600 dark:text-zinc-400">You are signed in.</p>
          <UserButton />
        </>
      )}
    </div>
  );
}
