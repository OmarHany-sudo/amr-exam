import { ChevronDown } from "lucide-react";

export function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group rounded-lg border soft-border bg-surface shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-black">
        <span>{title}</span>
        <ChevronDown className="h-5 w-5 text-[color:var(--brand)] transition group-open:rotate-180" />
      </summary>
      <div className="border-t soft-border p-4">{children}</div>
    </details>
  );
}
