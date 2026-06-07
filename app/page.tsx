import Link from "next/link";
import { ArrowLeft, BookOpen, Brain, FileQuestion, GraduationCap, Library } from "lucide-react";
import { getContent } from "@/lib/content";
import { MotionItem, MotionList, MotionShell } from "@/components/motion-shell";
import { MiniList } from "@/components/mini-list";

export default function HomePage() {
  const content = getContent();
  const stats = [
    { label: "عدد المحاضرات", value: content.reviewLectures.length, icon: Library },
    { label: "عدد الأسئلة", value: content.stats.questionCount, icon: FileQuestion },
    { label: "عدد المصطلحات", value: content.dictionary.length, icon: Brain },
    { label: "عدد التعريفات", value: content.definitions.length, icon: BookOpen },
  ];

  return (
    <div className="space-y-10">
      <MotionShell>
        <section className="rounded-lg border soft-border bg-surface p-5 shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-bold text-[color:var(--brand-2)]">هدف المنصة: النجاح في الامتحان بأقل وقت مراجعة</p>
              <h1 className="text-4xl font-black leading-tight sm:text-6xl">مراجعة مادة الحاسوب والإذاعة</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
                ملخصات قصيرة، تعريفات مركزة، مصطلحات، أسئلة متوقعة، وQuiz سريع. النص الأصلي يظهر فقط عند الضغط على عرض المصدر.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/exam-night" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[color:var(--brand)] px-5 font-bold text-white">
                  ابدأ مراجعة ليلة الامتحان
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <Link href="/overview" className="inline-flex min-h-11 items-center gap-2 rounded-md border soft-border bg-surface-2 px-5 font-bold">
                  ملخص 15 دقيقة
                </Link>
              </div>
            </div>
            <div className="rounded-lg border soft-border bg-surface-2 p-4">
              <div className="mb-3 flex items-center gap-2 font-black">
                <GraduationCap className="h-5 w-5 text-[color:var(--brand)]" />
                خطة مراجعة سريعة
              </div>
              <MiniList items={content.examNight.mustMemorize.slice(0, 4)} numbered />
            </div>
          </div>
        </section>
      </MotionShell>

      <MotionList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <MotionItem key={stat.label}>
              <article className="rounded-lg border soft-border bg-surface p-5 shadow-sm">
                <Icon className="mb-4 h-6 w-6 text-[color:var(--brand)]" />
                <p className="text-3xl font-black">{stat.value}</p>
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </article>
            </MotionItem>
          );
        })}
      </MotionList>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          ["المحاضرات", "كل محاضرة في Tabs: ملخص، تعريفات، مصطلحات، نقاط امتحانية، أسئلة، Quiz.", "/lectures"],
          ["أسئلة متوقعة", "مبنية على التكرار والعناوين والنقاط المشروحة.", "/expected"],
          ["Flashcards", "بطاقات حفظ سريعة للمفاهيم والتعريفات.", "/flashcards"],
        ].map(([title, body, href]) => (
          <Link key={href} href={href} className="rounded-lg border soft-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--brand)]">
            <h2 className="text-xl font-black">{title}</h2>
            <p className="mt-2 leading-7 text-muted">{body}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
