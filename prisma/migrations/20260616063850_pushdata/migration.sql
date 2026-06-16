/*
  Warnings:

  - Added the required column `departmentId` to the `positions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OvertimeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DayType" AS ENUM ('WEEKDAY', 'WEEKEND');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('PROCESSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('TAHUNAN', 'SAKIT', 'MELAHIRKAN', 'PENTING');

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "address" TEXT,
ADD COLUMN     "phone" VARCHAR(20);

-- AlterTable
ALTER TABLE "positions" ADD COLUMN     "departmentId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "overtimes" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "startTime" VARCHAR(5) NOT NULL,
    "endTime" VARCHAR(5) NOT NULL,
    "totalHours" DECIMAL(4,2) NOT NULL,
    "dayType" "DayType" NOT NULL DEFAULT 'WEEKDAY',
    "reason" VARCHAR(255) NOT NULL,
    "status" "OvertimeStatus" NOT NULL DEFAULT 'PENDING',
    "overtimePay" DECIMAL(10,2),
    "payrollId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "overtimes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" SERIAL NOT NULL,
    "period" VARCHAR(7) NOT NULL,
    "startPeriod" DATE NOT NULL,
    "endPeriod" DATE NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'PROCESSED',
    "processedBy" INTEGER NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslips" (
    "id" SERIAL NOT NULL,
    "payrollId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "basicSalary" DECIMAL(10,2) NOT NULL,
    "overtimePay" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "bpjsKesehatan" DECIMAL(10,2) NOT NULL,
    "bpjsKerja" DECIMAL(10,2) NOT NULL,
    "jht" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "pph21" DECIMAL(10,2) NOT NULL,
    "companyBpjsKesehatan" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "companyBpjsKerja" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "companyJht" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalCompanyContribution" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalEarnings" DECIMAL(10,2) NOT NULL,
    "totalDeductions" DECIMAL(10,2) NOT NULL,
    "netSalary" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payslips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaves" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "totalDays" INTEGER NOT NULL DEFAULT 12,
    "usedDays" INTEGER NOT NULL DEFAULT 0,
    "remainingDays" INTEGER NOT NULL DEFAULT 12,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "type" "LeaveType" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "reason" VARCHAR(255) NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "rejectedNote" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payrolls_period_key" ON "payrolls"("period");

-- CreateIndex
CREATE UNIQUE INDEX "payslips_payrollId_employeeId_key" ON "payslips"("payrollId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "leaves_employeeId_year_key" ON "leaves"("employeeId", "year");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtimes" ADD CONSTRAINT "overtimes_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtimes" ADD CONSTRAINT "overtimes_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "payrolls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "payrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
