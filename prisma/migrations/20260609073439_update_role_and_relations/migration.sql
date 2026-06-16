/*
  Warnings:

  - The values [ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `companyName` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `employees` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'HR_ADMIN', 'EMPLOYEE');
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "companyName",
ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE';

-- CreateIndex
CREATE UNIQUE INDEX "employees_userId_key" ON "employees"("userId");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
