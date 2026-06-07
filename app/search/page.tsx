import { PageHeader } from "@/components/page-header";
import { SearchClient } from "@/components/search-client";
import { getContent } from "@/lib/content";

export default function SearchPage() {
  const content = getContent();
  return (
    <>
      <PageHeader title="Search Engine" eyebrow={content.courseName} description="بحث سريع في الملخصات والأسئلة والمصطلحات والتعريفات والامتحانات مع عرض المصدر والنص الأصلي." />
      <SearchClient entries={content.searchIndex} />
    </>
  );
}
