"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Brain,
  ClipboardList,
  FileQuestion,
  GraduationCap,
  Home,
  Library,
  Menu,
  Moon,
  PanelsTopLeft,
  Search,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";

const links = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/lectures", label: "المحاضرات", icon: Library },
  { href: "/overview", label: "ملخص 15 دقيقة", icon: BookOpen },
  { href: "/definitions", label: "التعريفات", icon: BookOpen },
  { href: "/dictionary", label: "المصطلحات", icon: Brain },
  { href: "/expected", label: "أسئلة متوقعة", icon: Sparkles },
  { href: "/exam-night", label: "ليلة الامتحان", icon: Moon },
  { href: "/quiz", label: "Quiz", icon: GraduationCap },
  { href: "/flashcards", label: "Flashcards", icon: PanelsTopLeft },
  { href: "/search", label: "البحث", icon: Search },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b soft-border bg-[color:var(--background)]/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[color:var(--brand)] text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="truncate font-black">الحاسوب والإذاعة</span>
        </Link>

        <nav className="mr-auto hidden items-center gap-1 lg:flex">
          {links.slice(0, 9).map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                  active ? "bg-surface-2 text-[color:var(--brand)]" : "text-muted hover:bg-surface-2"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/search" className="focus-ring hidden h-10 w-10 items-center justify-center rounded-md bg-surface-2 lg:inline-flex" title="البحث">
          <Search className="h-5 w-5" />
        </Link>
        <button type="button" onClick={toggle} className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md bg-surface-2" title="تبديل الوضع">
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button type="button" onClick={() => setOpen(true)} className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md bg-surface-2 lg:hidden" title="القائمة">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/45 lg:hidden">
          <div className="mr-auto h-full w-[min(88vw,360px)] overflow-y-auto border-l soft-border bg-surface p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-black">التنقل</span>
              <button type="button" onClick={() => setOpen(false)} className="focus-ring h-10 w-10 rounded-md bg-surface-2" title="إغلاق">
                <X className="mx-auto h-5 w-5" />
              </button>
            </div>
            <nav className="grid gap-2">
              {links.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex min-h-11 items-center gap-3 rounded-md px-3 font-semibold ${
                      active ? "bg-surface-2 text-[color:var(--brand)]" : "text-muted"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
