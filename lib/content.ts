import contentJson from "@/data/content.json";

export type Source = {
  id: string;
  fileName: string;
  page: number;
  text: string;
};

export type ContentItem = {
  id: string;
  title: string;
  body: string;
  sources: Source[];
  type?: string;
  kind?: string;
  answer?: string;
  options?: string[];
  reason?: string;
  count?: number;
  category?: string;
  files?: string[];
  pages?: number[];
};

export type CourseContent = typeof contentJson;

export function getContent(): CourseContent {
  return contentJson;
}

export function flattenSummaryItems() {
  const content = getContent();
  return content.summaries.flatMap((summary) => [
    ...summary.mainIdeas,
    ...summary.importantPoints,
    ...summary.basics,
    ...summary.examNotes,
  ]);
}

export function byType(items: ContentItem[]) {
  return items.reduce<Record<string, ContentItem[]>>((groups, item) => {
    const key = item.type || item.kind || item.category || "عام";
    groups[key] ||= [];
    groups[key].push(item);
    return groups;
  }, {});
}
