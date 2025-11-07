/*
  Warnings:

  - You are about to drop the column `examId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the `Exam` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Exam" DROP CONSTRAINT "Exam_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Question" DROP CONSTRAINT "Question_examId_fkey";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "examId",
ADD COLUMN     "examType" TEXT,
ALTER COLUMN "options" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."Exam";
