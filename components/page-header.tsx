import { MotionShell } from "@/components/motion-shell";

export function PageHeader({ title, eyebrow, description }: { title: string; eyebrow?: string; description?: string }) {
  return (
    <MotionShell className="mb-8">
      <div className="border-b soft-border pb-6">
        {eyebrow ? <p className="mb-2 text-sm font-bold text-[color:var(--brand-2)]">{eyebrow}</p> : null}
        <h1 className="text-3xl font-black leading-tight sm:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-3xl text-base leading-8 text-muted">{description}</p> : null}
      </div>
    </MotionShell>
  );
}
