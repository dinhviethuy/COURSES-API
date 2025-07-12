/*
  Warnings:

  - You are about to drop the column `paymentId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the `OrderCourses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentTransaction` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[orderId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountNumber` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gateway` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('PERCENT', 'FIXED');

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "OrderCourses" DROP CONSTRAINT "OrderCourses_courseId_fkey";

-- DropForeignKey
ALTER TABLE "OrderCourses" DROP CONSTRAINT "OrderCourses_orderId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentTransaction" DROP CONSTRAINT "PaymentTransaction_paymentId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "paymentId";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "status",
DROP COLUMN "updatedAt",
ADD COLUMN     "accountNumber" TEXT NOT NULL,
ADD COLUMN     "accumulated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "amountIn" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "amountOut" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "body" TEXT,
ADD COLUMN     "code" TEXT,
ADD COLUMN     "gateway" TEXT NOT NULL,
ADD COLUMN     "orderId" INTEGER NOT NULL,
ADD COLUMN     "referenceNumber" TEXT,
ADD COLUMN     "subAccount" TEXT,
ADD COLUMN     "transactionContent" TEXT,
ADD COLUMN     "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "OrderCourses";

-- DropTable
DROP TABLE "PaymentTransaction";

-- CreateTable
CREATE TABLE "CartItem" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "code" TEXT NOT NULL,
    "discount" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "type" "CouponType" NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "_CourseToOrder" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CourseToOrder_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "CartItem_userId_idx" ON "CartItem"("userId");

-- CreateIndex
CREATE INDEX "CartItem_courseId_idx" ON "CartItem"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_userId_courseId_key" ON "CartItem"("userId", "courseId");

-- CreateIndex
CREATE INDEX "Coupon_startAt_endAt_idx" ON "Coupon"("startAt", "endAt");

-- CreateIndex
CREATE INDEX "Coupon_isActive_idx" ON "Coupon"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "_CourseToOrder_B_index" ON "_CourseToOrder"("B");

-- CreateIndex
CREATE INDEX "Course_courseType_idx" ON "Course"("courseType");

-- CreateIndex
CREATE INDEX "Course_isDraft_idx" ON "Course"("isDraft");

-- CreateIndex
CREATE INDEX "CourseEnrollment_status_idx" ON "CourseEnrollment"("status");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_CourseToOrder" ADD CONSTRAINT "_CourseToOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToOrder" ADD CONSTRAINT "_CourseToOrder_B_fkey" FOREIGN KEY ("B") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
