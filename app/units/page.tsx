import { PageHeader } from "@/components/page-header";
import { Accordion } from "@/components/accordion";
import { MiniList } from "@/components/mini-list";
import { getContent } from "@/lib/content";

export default function UnitsPage() {
  const content = getContent();

  return (
    <>
      <PageHeader title="خريطة المحاضرات" eyebrow={content.courseName} description="خريطة مختصرة للعناوين الرئيسية دون عرض نص المحاضرات." />
      <div className="space-y-8">
        {content.reviewLectures.map((lecture) => (
          <Accordion key={lecture.id} title={lecture.title}>
            <MiniList items={[...lecture.concepts, ...lecture.examPoints].slice(0, 10)} numbered />
          </Accordion>
        ))}
      </div>
    </>
  );
}
