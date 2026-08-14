-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TherapyNote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" TEXT NOT NULL,
    "therapyType" TEXT NOT NULL,
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
INSERT INTO "new_TherapyNote" ("createdAt", "familyRecommendations", "familyRecommendationsDate", "generalObservations", "generalObservationsDate", "goalsAchieved", "goalsAchievedDate", "groupRecommendationParents", "id", "incidents", "incidentsDate", "nextSessionObjectives", "nextSessionObjectivesDate", "objectivesDate", "otherTherapies", "patientId", "progressNotes", "progressNotesDate", "reinforcersDate", "reinforcersUsed", "submitterId", "therapyType", "updatedAt") SELECT "createdAt", "familyRecommendations", "familyRecommendationsDate", "generalObservations", "generalObservationsDate", "goalsAchieved", "goalsAchievedDate", "groupRecommendationParents", "id", "incidents", "incidentsDate", "nextSessionObjectives", "nextSessionObjectivesDate", "objectivesDate", "otherTherapies", "patientId", "progressNotes", "progressNotesDate", "reinforcersDate", "reinforcersUsed", "submitterId", "therapyType", "updatedAt" FROM "TherapyNote";
DROP TABLE "TherapyNote";
ALTER TABLE "new_TherapyNote" RENAME TO "TherapyNote";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
