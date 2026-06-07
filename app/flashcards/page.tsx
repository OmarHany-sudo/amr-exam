import { FlashcardsClient } from "@/components/flashcards-client";
import { PageHeader } from "@/components/page-header";
import { getContent } from "@/lib/content";

export default function FlashcardsPage() {
  const content = getContent();
  return (
    <>
      <PageHeader title="Flashcards" eyebrow={content.courseName} description="بطاقات حفظ قصيرة للمفاهيم والتعريفات والأسئلة، مع المصدر في كل بطاقة." />
      <FlashcardsClient cards={content.flashCards} />
    </>
  );
}
