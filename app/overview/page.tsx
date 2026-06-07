import { PageHeader } from "@/components/page-header";
import { Accordion } from "@/components/accordion";
import { MiniList } from "@/components/mini-list";
import { getContent } from "@/lib/content";

export default function OverviewPage() {
  const content = getContent();
  const topDefinitions = content.definitions.slice(0, 8);
  const topTerms = content.dictionary.slice(0, 10);

  return (
    <>
      <PageHeader
        title="ملخص المادة بالكامل"
        eyebrow="مراجعة 15 دقيقة"
        description="اقرأ النقاط فقط، وافتح المصدر عند الحاجة للتحقق. لا توجد محاضرات كاملة هنا."
      />
      <div className="space-y-4">
        <Accordion title="المسار السريع: أهم نقطة من كل محاضرة" defaultOpen>
          <MiniList items={content.reviewLectures.map((lecture) => lecture.quickSummary[0]).filter(Boolean)} numbered />
        </Accordion>
        <Accordion title="أهم التعريفات للحفظ">
          <MiniList items={topDefinitions} numbered />
        </Accordion>
        <Accordion title="أهم المصطلحات التي تتكرر">
          <MiniList items={topTerms} numbered />
        </Accordion>
        <Accordion title="نقاط امتحانية سريعة">
          <MiniList items={content.reviewLectures.flatMap((lecture) => lecture.examPoints.slice(0, 2)).slice(0, 16)} numbered />
        </Accordion>
      </div>
    </>
  );
}
