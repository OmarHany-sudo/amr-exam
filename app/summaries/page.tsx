import { PageHeader } from "@/components/page-header";
import { MiniList } from "@/components/mini-list";
import { getContent } from "@/lib/content";

export default function SummariesPage() {
  const content = getContent();

  return (
    <>
      <PageHeader title="ملخصات سريعة" eyebrow={content.courseName} description="نسخة مختصرة فقط، لا تعرض المحاضرات كاملة." />
      <div className="space-y-8">
        {content.reviewLectures.map((lecture) => (
          <section key={lecture.id} className="space-y-3 border-b soft-border pb-6">
            <h2 className="text-2xl font-black leading-9">{lecture.title}</h2>
            <MiniList items={lecture.quickSummary} numbered />
          </section>
        ))}
      </div>
    </>
  );
}
