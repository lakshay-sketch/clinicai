import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/doctors", label: "Doctors" },
  { href: "/dashboard/queue", label: "Live Queue" },
  { href: "/dashboard/staff", label: "Staff" },
  { href: "/dashboard/settings", label: "Clinic Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r border-line bg-ink text-paper flex flex-col">
        <div className="px-6 py-6 border-b border-paper/10">
          <span className="font-serif text-lg tracking-tight">ClinicAI</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-sm text-sm text-paper/80 hover:text-paper hover:bg-paper/10 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-paper/10 flex items-center gap-3">
          <UserButton />
          <span className="text-xs text-paper/60">Staff account</span>
        </div>
      </aside>
      <main className="flex-1 px-10 py-8">{children}</main>
    </div>
  );
}
