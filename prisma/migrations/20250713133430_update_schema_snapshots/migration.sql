/*
  Warnings:

  - Made the column `orderId` on table `OrderItemSnapshot` required. This step will fail if there are existing NULL values in that column.
  - Made the column `courseId` on table `OrderItemSnapshot` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "OrderItemSnapshot" DROP CONSTRAINT "OrderItemSnapshot_courseId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItemSnapshot" DROP CONSTRAINT "OrderItemSnapshot_orderId_fkey";

-- AlterTable
ALTER TABLE "OrderItemSnapshot" ALTER COLUMN "orderId" SET NOT NULL,
ALTER COLUMN "courseId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderItemSnapshot" ADD CONSTRAINT "OrderItemSnapshot_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrderItemSnapshot" ADD CONSTRAINT "OrderItemSnapshot_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
