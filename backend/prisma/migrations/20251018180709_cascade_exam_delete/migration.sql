-- DropForeignKey
ALTER TABLE "public"."Exam" DROP CONSTRAINT "Exam_courseId_fkey";

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
