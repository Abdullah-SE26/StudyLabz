-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
