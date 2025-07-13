/*
  Warnings:

  - The primary key for the `Coupon` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `couponCode` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `couponCode` on the `OrderItemSnapshot` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_couponCode_fkey";

-- DropForeignKey
ALTER TABLE "OrderItemSnapshot" DROP CONSTRAINT "OrderItemSnapshot_couponCode_fkey";

-- DropIndex
DROP INDEX "OrderItemSnapshot_couponCode_idx";

-- AlterTable
ALTER TABLE "Coupon" DROP CONSTRAINT "Coupon_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "couponCode",
ADD COLUMN     "couponId" INTEGER;

-- AlterTable
ALTER TABLE "OrderItemSnapshot" DROP COLUMN "couponCode",
ADD COLUMN     "couponId" INTEGER;

-- CreateIndex
CREATE INDEX "OrderItemSnapshot_couponId_idx" ON "OrderItemSnapshot"("couponId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrderItemSnapshot" ADD CONSTRAINT "OrderItemSnapshot_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

CREATE UNIQUE INDEX unique_code_coupon_where_deleted_at_not_null
ON "Coupon"("code")
WHERE "deletedAt" IS NOT NULL;