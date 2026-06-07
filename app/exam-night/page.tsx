import { Accordion } from "@/components/accordion";
import { MiniList } from "@/components/mini-list";
import { PageHeader } from "@/components/page-header";
import { getContent } from "@/lib/content";

export default function ExamNightPage() {
  const content = getContent();
  const sections = [
    ["أهم التعريفات", content.examNight.topDefinitions],
    ["أهم المفاهيم", content.examNight.topConcepts],
    ["أهم المصطلحات", content.examNight.repeatedTerms],
    ["أهم النقاط", content.examNight.mustMemorize],
  ] as const;

  return (
    <>
      <PageHeader title="مراجعة ليلة الامتحان" eyebrow="قراءة 3 إلى 5 دقائق" description="أقصر مسار قبل الامتحان: احفظ العناوين والنقاط فقط، وافتح المصدر عند الحاجة." />
      <div className="space-y-4">
        {sections.map(([title, items]) => (
          <Accordion key={title} title={title} defaultOpen={title === "أهم التعريفات"}>
            <MiniList items={items.slice(0, title === "أهم النقاط" ? 10 : 6)} numbered />
          </Accordion>
        ))}
      </div>
    </>
  );
}
