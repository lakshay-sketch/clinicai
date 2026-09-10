/*
  Warnings:

  - A unique constraint covering the columns `[razorpayOrderId]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "depositAmount" INTEGER,
ADD COLUMN     "depositStatus" "DepositStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_razorpayOrderId_key" ON "Appointment"("razorpayOrderId");
