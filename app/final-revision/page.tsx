import { Accordion } from "@/components/accordion";
import { MiniList } from "@/components/mini-list";
import { PageHeader } from "@/components/page-header";
import { getContent } from "@/lib/content";

export default function FinalRevisionPage() {
  const content = getContent();
  const sections = [
    ["أهم التعريفات", content.finalRevision.definitions],
    ["أهم المفاهيم", content.finalRevision.concepts],
    ["أهم النقاط", content.finalRevision.points],
    ["أهم الأسئلة", content.finalRevision.questions],
  ] as const;

  return (
    <>
      <PageHeader title="المراجعة النهائية" eyebrow={content.courseName} description="مراجعة مركزة في قوائم قصيرة، بدون فقرات طويلة." />
      <div className="space-y-4">
        {sections.map(([title, items]) => (
          <Accordion key={title} title={title}>
            <MiniList items={items.slice(0, 12)} numbered />
          </Accordion>
        ))}
      </div>
    </>
  );
}
