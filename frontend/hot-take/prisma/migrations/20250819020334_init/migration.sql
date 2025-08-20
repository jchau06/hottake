/*
  Warnings:

  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vote` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `interactions` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `votes` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Vote" DROP CONSTRAINT "Vote_postId_fkey";

-- DropIndex
DROP INDEX "public"."Post_date_idx";

-- DropIndex
DROP INDEX "public"."Post_title_idx";

-- AlterTable
ALTER TABLE "public"."Post" ADD COLUMN     "agree" TEXT[],
ADD COLUMN     "disagree" TEXT[],
ADD COLUMN     "interactions" INTEGER NOT NULL,
ADD COLUMN     "reports" TEXT[],
ADD COLUMN     "votes" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."Report";

-- DropTable
DROP TABLE "public"."Vote";

-- DropEnum
DROP TYPE "public"."VoteType";
