/*
  Warnings:

  - The primary key for the `Comment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Exam` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_CommentLikes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_CommentReports` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_QuestionLikes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_QuestionReports` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_UserBookmarks` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_parentCommentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Course" DROP CONSTRAINT "Course_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Exam" DROP CONSTRAINT "Exam_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Question" DROP CONSTRAINT "Question_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Question" DROP CONSTRAINT "Question_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Question" DROP CONSTRAINT "Question_examId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CommentLikes" DROP CONSTRAINT "_CommentLikes_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CommentLikes" DROP CONSTRAINT "_CommentLikes_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CommentReports" DROP CONSTRAINT "_CommentReports_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CommentReports" DROP CONSTRAINT "_CommentReports_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_QuestionLikes" DROP CONSTRAINT "_QuestionLikes_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_QuestionLikes" DROP CONSTRAINT "_QuestionLikes_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_QuestionReports" DROP CONSTRAINT "_QuestionReports_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_QuestionReports" DROP CONSTRAINT "_QuestionReports_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_UserBookmarks" DROP CONSTRAINT "_UserBookmarks_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_UserBookmarks" DROP CONSTRAINT "_UserBookmarks_B_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGSERIAL,
ALTER COLUMN "questionId" SET DATA TYPE BIGINT,
ALTER COLUMN "userId" SET DATA TYPE BIGINT,
ALTER COLUMN "parentCommentId" SET DATA TYPE BIGINT,
ADD CONSTRAINT "Comment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Course" DROP CONSTRAINT "Course_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGSERIAL,
ALTER COLUMN "createdById" SET DATA TYPE BIGINT,
ADD CONSTRAINT "Course_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGSERIAL,
ALTER COLUMN "courseId" SET DATA TYPE BIGINT,
ADD CONSTRAINT "Exam_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Question" DROP CONSTRAINT "Question_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGSERIAL,
ALTER COLUMN "createdById" SET DATA TYPE BIGINT,
ALTER COLUMN "courseId" SET DATA TYPE BIGINT,
ALTER COLUMN "examId" SET DATA TYPE BIGINT,
ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGSERIAL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_CommentLikes" DROP CONSTRAINT "_CommentLikes_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE BIGINT,
ALTER COLUMN "B" SET DATA TYPE BIGINT,
ADD CONSTRAINT "_CommentLikes_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_CommentReports" DROP CONSTRAINT "_CommentReports_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE BIGINT,
ALTER COLUMN "B" SET DATA TYPE BIGINT,
ADD CONSTRAINT "_CommentReports_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_QuestionLikes" DROP CONSTRAINT "_QuestionLikes_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE BIGINT,
ALTER COLUMN "B" SET DATA TYPE BIGINT,
ADD CONSTRAINT "_QuestionLikes_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_QuestionReports" DROP CONSTRAINT "_QuestionReports_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE BIGINT,
ALTER COLUMN "B" SET DATA TYPE BIGINT,
ADD CONSTRAINT "_QuestionReports_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_UserBookmarks" DROP CONSTRAINT "_UserBookmarks_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE BIGINT,
ALTER COLUMN "B" SET DATA TYPE BIGINT,
ADD CONSTRAINT "_UserBookmarks_AB_pkey" PRIMARY KEY ("A", "B");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionLikes" ADD CONSTRAINT "_QuestionLikes_A_fkey" FOREIGN KEY ("A") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionLikes" ADD CONSTRAINT "_QuestionLikes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionReports" ADD CONSTRAINT "_QuestionReports_A_fkey" FOREIGN KEY ("A") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionReports" ADD CONSTRAINT "_QuestionReports_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserBookmarks" ADD CONSTRAINT "_UserBookmarks_A_fkey" FOREIGN KEY ("A") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserBookmarks" ADD CONSTRAINT "_UserBookmarks_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommentLikes" ADD CONSTRAINT "_CommentLikes_A_fkey" FOREIGN KEY ("A") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommentLikes" ADD CONSTRAINT "_CommentLikes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommentReports" ADD CONSTRAINT "_CommentReports_A_fkey" FOREIGN KEY ("A") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommentReports" ADD CONSTRAINT "_CommentReports_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
