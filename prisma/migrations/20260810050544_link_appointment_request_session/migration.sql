-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppointmentRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsApp" TEXT NOT NULL,
    "domRepId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "scheduledDate" DATETIME NOT NULL,
    "patientId" TEXT NOT NULL,
    "evaluatorId" TEXT,
    "sessionId" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AppointmentRequest_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AppointmentRequest_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AppointmentRequest_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AppointmentRequest" ("createdAt", "domRepId", "email", "evaluatorId", "firstName", "id", "ipAddress", "lastName", "middleName", "patientId", "phone", "scheduledDate", "serviceType", "whatsApp") SELECT "createdAt", "domRepId", "email", "evaluatorId", "firstName", "id", "ipAddress", "lastName", "middleName", "patientId", "phone", "scheduledDate", "serviceType", "whatsApp" FROM "AppointmentRequest";
DROP TABLE "AppointmentRequest";
ALTER TABLE "new_AppointmentRequest" RENAME TO "AppointmentRequest";
CREATE UNIQUE INDEX "AppointmentRequest_sessionId_key" ON "AppointmentRequest"("sessionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
