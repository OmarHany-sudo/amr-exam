import { ItemCard } from "@/components/item-card";
import { PageHeader } from "@/components/page-header";
import { getContent } from "@/lib/content";

export default function ExamsPage() {
  const content = getContent();

  return (
    <>
      <PageHeader title="Past Exams" eyebrow={content.courseName} description="أي صفحات ظهر فيها مؤشر امتحاني أو أسئلة داخل الملفات." />
      {content.pastExams.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {content.pastExams.map((exam) => (
            <ItemCard key={exam.id} item={exam} tone="accent" />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border soft-border bg-surface p-5 text-muted">لم يتم العثور على امتحانات سابقة صريحة داخل الملفات المستخرجة.</p>
      )}
    </>
  );
}
