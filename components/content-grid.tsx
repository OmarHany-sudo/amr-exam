import { ItemCard } from "@/components/item-card";
import { MotionItem, MotionList } from "@/components/motion-shell";
import type { ContentItem } from "@/lib/content";

export function ContentGrid({ items, tone = "default" }: { items: ContentItem[]; tone?: "default" | "accent" | "slate" }) {
  return (
    <MotionList className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((entry) => (
        <MotionItem key={entry.id}>
          <ItemCard item={entry} tone={tone} />
        </MotionItem>
      ))}
    </MotionList>
  );
}
