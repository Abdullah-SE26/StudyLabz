-- AlterTable
ALTER TABLE "User" ADD COLUMN     "blockedUntil" TIMESTAMP(3),
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "sessionVersion" INTEGER NOT NULL DEFAULT 0;
