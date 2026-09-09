import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/doctors", label: "Doctors" },
  { href: "/dashboard/queue", label: "Live Queue" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/staff", label: "Staff" },
  { href: "/dashboard/settings", label: "Clinic Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r border-line bg-ink text-paper flex flex-col">
        <div className="px-6 h-16 flex items-center border-b border-paper/10">
          <Link href="/" className="font-serif text-lg tracking-tight hover:text-paper/80">
            ClinicAI
          </Link>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 text-sm text-paper/75 hover:text-paper hover:bg-paper/10 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-5 border-t border-paper/10 flex items-center gap-3">
          <UserButton />
          <span className="text-xs text-paper/50">Staff account</span>
        </div>
      </aside>
      <main className="flex-1 px-12 py-10 animate-in">{children}</main>
    </div>
  );
}
