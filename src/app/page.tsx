import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">ClinicAI — Setup Verification</h1>

      <Show when="signed-out">
        <p className="text-zinc-600 dark:text-zinc-400">
          You are not signed in.
        </p>

        <div className="flex gap-4">
          <Link href="/sign-in" className="underline">
            Sign In
          </Link>

          <Link href="/sign-up" className="underline">
            Sign Up
          </Link>
        </div>
      </Show>

      <Show when="signed-in">
        <p className="text-zinc-600 dark:text-zinc-400">
          You are signed in.
        </p>

        <UserButton />
      </Show>
    </div>
  );
}
  