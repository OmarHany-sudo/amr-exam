import { PageHeader } from "@/components/page-header";
import { QuizClient } from "@/components/quiz-client";
import { getContent } from "@/lib/content";

export default function QuizPage() {
  const content = getContent();
  return (
    <>
      <PageHeader title="Quiz سريع" eyebrow={content.courseName} description="اختبار سريع من أسئلة اختر من متعدد، صح أو خطأ، وأكمل." />
      <QuizClient questions={content.questions} />
    </>
  );
}
