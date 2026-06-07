import { LectureReview } from "@/components/lecture-review";
import { PageHeader } from "@/components/page-header";
import { getContent } from "@/lib/content";

export default function LecturesPage() {
  const content = getContent();

  return (
    <>
      <PageHeader
        title="مراجعة المحاضرات"
        eyebrow={content.courseName}
        description="كل محاضرة مختصرة في بطاقات وTabs: ملخص سريع، تعريفات، مصطلحات، نقاط امتحانية، أسئلة، وQuiz."
      />
      <div className="space-y-6">
        {content.reviewLectures.map((lecture) => (
          <LectureReview key={lecture.id} lecture={lecture} />
        ))}
      </div>
    </>
  );
}
