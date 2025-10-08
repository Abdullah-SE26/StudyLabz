/*
  Warnings:

  - A unique constraint covering the columns `[courseId,title]` on the table `Exam` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Exam_courseId_title_key" ON "Exam"("courseId", "title");
