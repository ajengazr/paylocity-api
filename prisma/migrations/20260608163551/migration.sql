-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nik" VARCHAR(100) NOT NULL,
    "department" VARCHAR(100) NOT NULL,
    "position" VARCHAR(100) NOT NULL,
    "basicSalary" DECIMAL(10,2) NOT NULL,
    "taxStatus" VARCHAR(100) NOT NULL,
    "joinDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_nik_key" ON "employees"("nik");
