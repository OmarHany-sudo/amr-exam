import type { ContentItem } from "@/lib/content";
import { SourceViewer } from "@/components/source-viewer";

export function ItemCard({ item, tone = "default" }: { item: ContentItem; tone?: "default" | "accent" | "slate" }) {
  const toneClass =
    tone === "accent"
      ? "border-r-[color:var(--brand-2)]"
      : tone === "slate"
        ? "border-r-[color:var(--brand-3)]"
        : "border-r-[color:var(--brand)]";

  return (
    <article className={`rounded-lg border border-r-4 soft-border bg-surface p-4 shadow-sm ${toneClass}`}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {(item.type || item.kind || item.category) && (
            <p className="mb-1 text-xs font-bold uppercase tracking-normal text-[color:var(--brand-2)]">
              {item.type || item.kind || item.category}
            </p>
          )}
          <h3 className="text-base font-bold leading-7 sm:text-lg">{item.title}</h3>
        </div>
        <SourceViewer sources={item.sources || []} compact />
      </div>
      {item.sources?.[0] ? (
        <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold text-muted">
          <span className="rounded-md bg-surface-2 px-2 py-1">{item.sources[0].fileName}</span>
          <span className="rounded-md bg-surface-2 px-2 py-1">صفحة {item.sources[0].page}</span>
        </div>
      ) : null}
      {item.reason ? <p className="mb-3 rounded-md bg-surface-2 p-3 text-sm leading-7 text-muted">{item.reason}</p> : null}
      {item.body ? <p className="source-text leading-7 text-muted">{item.body}</p> : null}
      {item.answer ? (
        <div className="mt-3 rounded-md bg-surface-2 p-3">
          <p className="text-xs font-bold text-[color:var(--brand)]">الإجابة</p>
          <p className="source-text mt-1 leading-7 text-muted">{item.answer}</p>
        </div>
      ) : null}
      {item.options?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.options.map((option) => (
            <span key={option} className="rounded-md border soft-border bg-surface-2 px-3 py-1 text-sm">
              {option}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
