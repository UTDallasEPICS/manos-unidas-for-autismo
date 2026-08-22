-- CreateTable
CREATE TABLE "TherapyModality" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "labelEs" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TherapyObjective" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "therapyModalityId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'objective',
    "labelEn" TEXT NOT NULL,
    "labelEs" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "TherapyObjective_therapyModalityId_fkey" FOREIGN KEY ("therapyModalityId") REFERENCES "TherapyModality" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TherapyModality_key_key" ON "TherapyModality"("key");
