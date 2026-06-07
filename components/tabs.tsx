"use client";

import { useState } from "react";

export function Tabs({
  tabs,
}: {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
}) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto rounded-lg border soft-border bg-surface p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`focus-ring min-h-10 shrink-0 rounded-md px-4 text-sm font-bold transition ${
              active === tab.id ? "bg-[color:var(--brand)] text-white" : "bg-surface-2 text-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.find((tab) => tab.id === active)?.content}
    </div>
  );
}
