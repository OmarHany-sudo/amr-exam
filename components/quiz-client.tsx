"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { SourceViewer } from "@/components/source-viewer";
import type { ContentItem } from "@/lib/content";

function normalize(value = "") {
  return value.trim().replace(/\s+/g, " ");
}

export function QuizClient({ questions, compact = false }: { questions: ContentItem[]; compact?: boolean }) {
  const quizQuestions = useMemo(
    () => questions.filter((question) => ["اختر من متعدد", "صح أو خطأ", "أكمل"].includes(question.type || "") && question.answer).slice(0, 45),
    [questions],
  );
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const current = quizQuestions[index];
  const correct = normalize(answer) === normalize(current?.answer || "");

  if (!current) return null;

  const options =
    current.type === "صح أو خطأ"
      ? ["صح", "خطأ"]
      : current.type === "اختر من متعدد"
        ? current.options || []
        : [];

  function next() {
    setIndex((value) => (value + 1) % quizQuestions.length);
    setAnswer("");
    setChecked(false);
  }

  return (
    <div className={compact ? "" : "mx-auto max-w-4xl"}>
      <article className="rounded-lg border soft-border bg-surface p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="font-bold text-[color:var(--brand-2)]">
            {current.type} - {index + 1} / {quizQuestions.length}
          </p>
          <SourceViewer sources={current.sources || []} compact />
        </div>

        <h2 className={`source-text font-black ${compact ? "text-lg leading-8" : "text-xl leading-10"}`}>{current.title}</h2>

        {options.length ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setAnswer(option)}
                className={`focus-ring min-h-12 rounded-md border px-4 text-right font-semibold transition ${
                  answer === option ? "border-[color:var(--brand)] bg-surface-2 text-[color:var(--brand)]" : "soft-border bg-surface"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <input
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            className="mt-6 min-h-12 w-full rounded-md border soft-border bg-surface-2 px-4 outline-none focus:border-[color:var(--brand)]"
            placeholder="اكتب الإجابة"
          />
        )}

        {checked ? (
          <div className={`mt-5 rounded-md p-4 ${correct ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/14 text-amber-800 dark:text-amber-200"}`}>
            <p className="font-black">{correct ? "إجابة صحيحة" : "راجع الإجابة من المصدر"}</p>
            <p className="source-text mt-2 leading-7">الإجابة: {current.answer}</p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => setChecked(true)} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[color:var(--brand)] px-5 font-bold text-white">
            <CheckCircle2 className="h-5 w-5" />
            تحقق
          </button>
          <button type="button" onClick={next} className="inline-flex min-h-11 items-center gap-2 rounded-md border soft-border bg-surface-2 px-5 font-bold">
            <RotateCcw className="h-5 w-5" />
            التالي
          </button>
        </div>
      </article>
    </div>
  );
}
