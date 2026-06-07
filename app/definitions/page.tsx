import { ContentGrid } from "@/components/content-grid";
import { PageHeader } from "@/components/page-header";
import { getContent } from "@/lib/content";

export default function DefinitionsPage() {
  const content = getContent();
  return (
    <>
      <PageHeader title="أهم التعريفات" eyebrow={content.courseName} description="تعريفات قصيرة للحفظ، وكل Card يحتوي اسم الملف ورقم الصفحة وزر عرض المصدر." />
      <ContentGrid items={content.definitions} tone="accent" />
    </>
  );
}
