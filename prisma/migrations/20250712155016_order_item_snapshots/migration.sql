/*
  Warnings:

  - You are about to drop the column `type` on the `Coupon` table. All the data in the column will be lost.
  - Added the required column `couponType` to the `Coupon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "type",
ADD COLUMN     "couponType" "CouponType" NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "couponCode" TEXT;

-- CreateTable
CREATE TABLE "OrderItemSnapshot" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER,
    "couponCode" TEXT,
    "courseId" INTEGER,
    "courseImage" TEXT,
    "courseTitle" TEXT,
    "coursePrice" INTEGER,
    "courseDiscount" INTEGER,
    "courseType" "CourseType",
    "couponDiscount" INTEGER,
    "couponType" "CouponType",
    "couponStartAt" TIMESTAMP(3),
    "couponEndAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItemSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderItemSnapshot_orderId_idx" ON "OrderItemSnapshot"("orderId");

-- CreateIndex
CREATE INDEX "OrderItemSnapshot_couponCode_idx" ON "OrderItemSnapshot"("couponCode");

-- CreateIndex
CREATE INDEX "OrderItemSnapshot_courseId_idx" ON "OrderItemSnapshot"("courseId");

-- CreateIndex
CREATE INDEX "OrderItemSnapshot_createdAt_idx" ON "OrderItemSnapshot"("createdAt");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_couponCode_fkey" FOREIGN KEY ("couponCode") REFERENCES "Coupon"("code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrderItemSnapshot" ADD CONSTRAINT "OrderItemSnapshot_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrderItemSnapshot" ADD CONSTRAINT "OrderItemSnapshot_couponCode_fkey" FOREIGN KEY ("couponCode") REFERENCES "Coupon"("code") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrderItemSnapshot" ADD CONSTRAINT "OrderItemSnapshot_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
