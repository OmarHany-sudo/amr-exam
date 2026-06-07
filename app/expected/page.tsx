import { ItemCard } from "@/components/item-card";
import { PageHeader } from "@/components/page-header";
import { getContent } from "@/lib/content";

export default function ExpectedPage() {
  const content = getContent();
  return (
    <>
      <PageHeader title="أسئلة متوقعة للامتحان" eyebrow={content.courseName} description="مبنية على تكرار المفاهيم والمصطلحات والعناوين الرئيسية والنقاط المشروحة بتفصيل." />
      <div className="grid gap-4 lg:grid-cols-2">
        {content.expectedQuestions.map((question) => (
          <ItemCard key={question.id} item={question} tone="accent" />
        ))}
      </div>
    </>
  );
}
