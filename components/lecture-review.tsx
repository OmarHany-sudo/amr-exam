import { Accordion } from "@/components/accordion";
import { ContentGrid } from "@/components/content-grid";
import { MiniList } from "@/components/mini-list";
import { Tabs } from "@/components/tabs";
import { QuizClient } from "@/components/quiz-client";
import { SourceViewer } from "@/components/source-viewer";
import type { ContentItem, Source } from "@/lib/content";

type Lecture = {
  id: string;
  title: string;
  fileName: string;
  pageCount: number;
  sources: Source[];
  quickSummary: ContentItem[];
  definitions: ContentItem[];
  terms: ContentItem[];
  concepts: ContentItem[];
  examPoints: ContentItem[];
  questions: ContentItem[];
  quickQuiz: ContentItem[];
};

export function LectureReview({ lecture }: { lecture: Lecture }) {
  return (
    <article className="rounded-lg border soft-border bg-surface-2 p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[color:var(--brand-2)]">{lecture.fileName}</p>
          <h2 className="mt-1 text-2xl font-black leading-9">{lecture.title}</h2>
          <p className="mt-1 text-sm text-muted">{lecture.pageCount} صفحة، مختصرة للمراجعة السريعة</p>
        </div>
        <SourceViewer sources={lecture.sources || []} />
      </div>

      <Tabs
        tabs={[
          {
            id: "summary",
            label: "ملخص سريع",
            content: <MiniList items={lecture.quickSummary.slice(0, 15)} numbered />,
          },
          {
            id: "definitions",
            label: "تعريفات",
            content: <ContentGrid items={lecture.definitions} tone="accent" />,
          },
          {
            id: "terms",
            label: "مصطلحات",
            content: <ContentGrid items={lecture.terms} tone="slate" />,
          },
          {
            id: "exam",
            label: "نقاط امتحانية",
            content: <MiniList items={lecture.examPoints} numbered />,
          },
          {
            id: "questions",
            label: "أسئلة",
            content: <ContentGrid items={lecture.questions} />,
          },
          {
            id: "quiz",
            label: "Quiz سريع",
            content: lecture.quickQuiz.length ? <QuizClient questions={lecture.quickQuiz} compact /> : <MiniList items={lecture.questions.slice(0, 5)} />,
          },
        ]}
      />

      <div className="mt-4">
        <Accordion title="Flashcards سريعة من هذه المحاضرة">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...lecture.definitions, ...lecture.terms, ...lecture.examPoints].slice(0, 9).map((entry) => (
              <div key={`flash-${lecture.id}-${entry.id}`} className="rounded-lg border soft-border bg-surface p-4">
                <p className="mb-2 text-xs font-bold text-[color:var(--brand-2)]">Flashcard</p>
                <h3 className="font-black leading-7">{entry.title}</h3>
                <p className="source-text mt-2 text-sm leading-7 text-muted">{entry.body}</p>
                <div className="mt-3">
                  <SourceViewer sources={entry.sources || []} compact />
                </div>
              </div>
            ))}
          </div>
        </Accordion>
      </div>
    </article>
  );
}
