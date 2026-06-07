import { ItemCard } from "@/components/item-card";
import { PageHeader } from "@/components/page-header";
import { byType, getContent } from "@/lib/content";

const order = ["صح أو خطأ", "اختر من متعدد", "أكمل", "أسئلة قصيرة", "أسئلة مقالية"];

export default function QuestionsPage() {
  const content = getContent();
  const grouped = byType(content.questions);

  return (
    <>
      <PageHeader title="أسئلة مراجعة" eyebrow={content.courseName} description="أسئلة قصيرة ومصنفة للمذاكرة، مع المصدر لكل سؤال." />
      <div className="space-y-10">
        {order
          .filter((type) => grouped[type]?.length)
          .map((type) => (
            <section key={type} className="space-y-4">
              <h2 className="text-2xl font-black">{type}</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {grouped[type].map((question) => (
                  <ItemCard key={question.id} item={question} tone={type === "اختر من متعدد" ? "accent" : "default"} />
                ))}
              </div>
            </section>
          ))}
      </div>
    </>
  );
}
