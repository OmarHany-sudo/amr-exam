import { ContentGrid } from "@/components/content-grid";
import { PageHeader } from "@/components/page-header";
import { getContent } from "@/lib/content";

export default function ConceptsPage() {
  const content = getContent();
  return (
    <>
      <PageHeader title="أهم المفاهيم" eyebrow={content.courseName} description="مفاهيم قصيرة للمراجعة السريعة، بدون عرض نص المحاضرات." />
      <ContentGrid items={content.concepts} />
    </>
  );
}
