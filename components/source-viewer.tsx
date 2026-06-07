"use client";

import { useState } from "react";
import { FileText, X } from "lucide-react";
import type { Source } from "@/lib/content";

export function SourceViewer({ sources, compact = false }: { sources: Source[]; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const visible = sources.filter(Boolean);
  if (!visible.length) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-md border soft-border bg-surface-2 px-3 text-sm font-semibold text-[color:var(--brand)] transition hover:border-[color:var(--brand)]"
        title="عرض الملف والصفحة والنص الأصلي"
      >
        <FileText className="h-4 w-4" />
        {compact ? "عرض المصدر" : `عرض المصدر (${visible.length})`}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 sm:items-center">
          <div className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-lg border soft-border bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b soft-border px-4 py-3">
              <div>
                <p className="text-sm text-muted">Source Verification</p>
                <h2 className="font-bold">النص الأصلي المستخرج</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md bg-surface-2"
                title="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[72vh] space-y-3 overflow-y-auto p-4">
              {visible.map((source, index) => (
                <article key={`${source.id}-${index}`} className="rounded-md border soft-border bg-surface-2 p-4">
                  <div className="mb-3 flex flex-wrap gap-2 text-sm font-semibold">
                    <span className="rounded bg-white/50 px-2 py-1 dark:bg-black/20">{source.fileName}</span>
                    <span className="rounded bg-white/50 px-2 py-1 dark:bg-black/20">صفحة {source.page}</span>
                  </div>
                  <p className="source-text text-sm leading-7 text-muted">{source.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
