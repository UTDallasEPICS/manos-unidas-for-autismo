/*
  Warnings:

  - You are about to drop the column `therapyType` on the `TherapyNote` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "TherapyNoteType" (
    "therapyNoteId" INTEGER NOT NULL,
    "therapyType" TEXT NOT NULL,

    PRIMARY KEY ("therapyNoteId", "therapyType"),
    CONSTRAINT "TherapyNoteType_therapyNoteId_fkey" FOREIGN KEY ("therapyNoteId") REFERENCES "TherapyNote" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Backfill: migrate the old single therapyType value into the new join
-- table before the column is dropped below. The former combined
-- "BEHAVIORAL_EARLY" value is split into both of its replacement types,
-- since existing notes didn't distinguish which one they meant.
INSERT INTO "TherapyNoteType" ("therapyNoteId", "therapyType")
SELECT "id", 'BEHAVIORAL_THERAPY' FROM "TherapyNote"
WHERE "therapyType" = 'BEHAVIORAL_EARLY';
INSERT INTO "TherapyNoteType" ("therapyNoteId", "therapyType")
SELECT "id", 'EARLY_INTERVENTION' FROM "TherapyNote"
WHERE "therapyType" = 'BEHAVIORAL_EARLY';
INSERT INTO "TherapyNoteType" ("therapyNoteId", "therapyType")
SELECT "id", "therapyType" FROM "TherapyNote"
WHERE "therapyType" IS NOT NULL AND "therapyType" != '' AND "therapyType" != 'BEHAVIORAL_EARLY';

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TherapyNote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" TEXT NOT NULL,
    "otherTherapies" TEXT,
    "objectivesDate" DATETIME,
    "reinforcersUsed" TEXT,
    "reinforcersDate" DATETIME,
    "familyRecommendations" TEXT,
    "familyRecommendationsDate" DATETIME,
    "goalsAchieved" TEXT NOT NULL,
    "goalsAchievedDate" DATETIME,
    "progressNotes" TEXT NOT NULL,
    "progressNotesDate" DATETIME,
    "nextSessionObjectives" TEXT NOT NULL,
    "nextSessionObjectivesDate" DATETIME,
    "incidents" TEXT,
    "incidentsDate" DATETIME,
    "generalObservations" TEXT NOT NULL,
    "generalObservationsDate" DATETIME,
    "groupRecommendationParents" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "submitterId" INTEGER,
    "sessionId" TEXT,
    CONSTRAINT "TherapyNote_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TherapyNote_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TherapyNote" ("createdAt", "familyRecommendations", "familyRecommendationsDate", "generalObservations", "generalObservationsDate", "goalsAchieved", "goalsAchievedDate", "groupRecommendationParents", "id", "incidents", "incidentsDate", "nextSessionObjectives", "nextSessionObjectivesDate", "objectivesDate", "otherTherapies", "patientId", "progressNotes", "progressNotesDate", "reinforcersDate", "reinforcersUsed", "sessionId", "submitterId", "updatedAt") SELECT "createdAt", "familyRecommendations", "familyRecommendationsDate", "generalObservations", "generalObservationsDate", "goalsAchieved", "goalsAchievedDate", "groupRecommendationParents", "id", "incidents", "incidentsDate", "nextSessionObjectives", "nextSessionObjectivesDate", "objectivesDate", "otherTherapies", "patientId", "progressNotes", "progressNotesDate", "reinforcersDate", "reinforcersUsed", "sessionId", "submitterId", "updatedAt" FROM "TherapyNote";
DROP TABLE "TherapyNote";
ALTER TABLE "new_TherapyNote" RENAME TO "TherapyNote";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
