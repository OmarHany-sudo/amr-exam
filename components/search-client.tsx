"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import { SourceViewer } from "@/components/source-viewer";
import type { ContentItem } from "@/lib/content";

type SearchEntry = ContentItem & {
  section: string;
};

export function SearchClient({ entries }: { entries: SearchEntry[] }) {
  const [query, setQuery] = useState("");
  const fuse = useMemo(
    () =>
      new Fuse(entries, {
        keys: ["title", "body", "section", "sources.text", "sources.fileName"],
        threshold: 0.36,
        ignoreLocation: true,
      }),
    [entries],
  );

  const results = query.trim() ? fuse.search(query.trim()).map((result) => result.item).slice(0, 60) : entries.slice(0, 24);

  return (
    <div className="space-y-5">
      <label className="flex min-h-14 items-center gap-3 rounded-lg border soft-border bg-surface px-4 shadow-sm">
        <Search className="h-5 w-5 text-[color:var(--brand)]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ابحث في الملخصات، الأسئلة، المصطلحات، التعريفات، الامتحانات"
          className="w-full bg-transparent outline-none"
        />
      </label>

      <div className="grid gap-4 lg:grid-cols-2">
        {results.map((entry) => (
          <article key={entry.id} className="rounded-lg border soft-border bg-surface p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[color:var(--brand-2)]">{entry.section}</p>
                <h2 className="mt-1 font-black leading-7">{entry.title}</h2>
              </div>
              <SourceViewer sources={entry.sources || []} compact />
            </div>
            <p className="source-text line-clamp-5 leading-8 text-muted">{entry.body}</p>
            {entry.sources?.[0] ? (
              <p className="mt-3 text-sm text-muted">
                {entry.sources[0].fileName} - صفحة {entry.sources[0].page}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
