import { ContentGrid } from "@/components/content-grid";
import { PageHeader } from "@/components/page-header";
import { getContent } from "@/lib/content";

export default function DictionaryPage() {
  const content = getContent();
  return (
    <>
      <PageHeader title="أهم المصطلحات" eyebrow={content.courseName} description="المصطلح ومعناه المختصر فقط. النص الأصلي لا يظهر إلا من زر عرض المصدر." />
      <ContentGrid items={content.dictionary} tone="slate" />
    </>
  );
}
