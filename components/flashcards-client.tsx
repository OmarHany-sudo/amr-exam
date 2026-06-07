"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCw } from "lucide-react";
import { SourceViewer } from "@/components/source-viewer";
import type { ContentItem } from "@/lib/content";

export function FlashcardsClient({ cards }: { cards: ContentItem[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[index];

  function move(step: number) {
    setIndex((current) => (current + step + cards.length) % cards.length);
    setFlipped(false);
  }

  if (!card) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-bold text-muted">
          {index + 1} / {cards.length}
        </p>
        <SourceViewer sources={card.sources || []} />
      </div>

      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        className="focus-ring min-h-[320px] w-full rounded-lg border soft-border bg-surface p-7 text-right shadow-sm transition hover:border-[color:var(--brand)]"
      >
        <p className="mb-4 text-sm font-bold text-[color:var(--brand-2)]">{flipped ? "الخلف" : "الوجه الأمامي"}</p>
        <h2 className="source-text text-2xl font-black leading-10">{flipped ? card.body : card.title}</h2>
      </button>

      <div className="flex items-center justify-center gap-3">
        <button type="button" onClick={() => move(-1)} className="focus-ring inline-flex h-12 w-12 items-center justify-center rounded-md bg-surface-2" title="السابق">
          <ArrowRight className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => setFlipped((value) => !value)} className="focus-ring inline-flex h-12 w-12 items-center justify-center rounded-md bg-[color:var(--brand)] text-white" title="قلب البطاقة">
          <RotateCw className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => move(1)} className="focus-ring inline-flex h-12 w-12 items-center justify-center rounded-md bg-surface-2" title="التالي">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
