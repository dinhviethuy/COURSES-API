/*
  Warnings:

  - You are about to drop the `_CourseToOrder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CourseToOrder" DROP CONSTRAINT "_CourseToOrder_A_fkey";

-- DropForeignKey
ALTER TABLE "_CourseToOrder" DROP CONSTRAINT "_CourseToOrder_B_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "courseId" INTEGER NOT NULL DEFAULT 17;

-- DropTable
DROP TABLE "_CourseToOrder";

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
