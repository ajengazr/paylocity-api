/*
  Warnings:

  - You are about to drop the column `department` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `employees` table. All the data in the column will be lost.
  - Added the required column `departmentId` to the `employees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `positionId` to the `employees` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "employees" DROP COLUMN "department",
DROP COLUMN "position",
ADD COLUMN     "departmentId" INTEGER NOT NULL,
ADD COLUMN     "positionId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "positions_name_key" ON "positions"("name");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
