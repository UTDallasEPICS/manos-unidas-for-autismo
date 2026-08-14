/*
  Warnings:

  - You are about to drop the `_parent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "_parent_B_index";

-- DropIndex
DROP INDEX "_parent_AB_unique";

-- AlterTable
ALTER TABLE "NonEmployee" ADD COLUMN "nationality" TEXT;
ALTER TABLE "NonEmployee" ADD COLUMN "nss" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_parent";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PatientGuardian" (
    "patientId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "primaryGuardian" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("patientId", "guardianId"),
    CONSTRAINT "PatientGuardian_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PatientGuardian_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "NonEmployee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Diagnosis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "date" DATETIME,
    "patientId" TEXT NOT NULL,
    CONSTRAINT "Diagnosis_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sponsorship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sponsorName" TEXT NOT NULL,
    "amount" REAL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "newDate" DATETIME,
    "patientId" TEXT NOT NULL,
    CONSTRAINT "Sponsorship_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PatientSupport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    CONSTRAINT "PatientSupport_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntakeDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IntakeDraft_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identification" TEXT NOT NULL,
    "ageAtRegistration" INTEGER,
    "diagnosed" BOOLEAN NOT NULL,
    "sponsorId" TEXT,
    "initialInterviewDate" DATETIME,
    "programEvalDate" DATETIME,
    "therapyStartDate" DATETIME,
    "insurance" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "Patient_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Patient_id_fkey" FOREIGN KEY ("id") REFERENCES "NonEmployee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Patient" ("ageAtRegistration", "diagnosed", "id", "identification", "sponsorId") SELECT "ageAtRegistration", "diagnosed", "id", "identification", "sponsorId" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE UNIQUE INDEX "Patient_id_key" ON "Patient"("id");
CREATE UNIQUE INDEX "Patient_identification_key" ON "Patient"("identification");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "IntakeDraft_requestId_key" ON "IntakeDraft"("requestId");
