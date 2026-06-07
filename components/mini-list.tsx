import { SourceViewer } from "@/components/source-viewer";
import type { ContentItem } from "@/lib/content";

export function MiniList({ items, numbered = false }: { items: ContentItem[]; numbered?: boolean }) {
  return (
    <div className="grid gap-3">
      {items.map((entry, index) => (
        <article key={entry.id} className="flex gap-3 rounded-lg border soft-border bg-surface p-3">
          {numbered ? (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[color:var(--brand)] text-sm font-black text-white">
              {index + 1}
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-bold leading-7">{entry.title}</h3>
              <SourceViewer sources={entry.sources || []} compact />
            </div>
            {entry.body ? <p className="source-text mt-1 leading-7 text-muted">{entry.body}</p> : null}
            {entry.sources?.[0] ? (
              <p className="mt-2 text-xs font-semibold text-muted">
                {entry.sources[0].fileName} - صفحة {entry.sources[0].page}
              </p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
