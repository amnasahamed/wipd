-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "baselineMetrics" TEXT;
ALTER TABLE "Profile" ADD COLUMN "bio" TEXT;
ALTER TABLE "Profile" ADD COLUMN "education" TEXT;
ALTER TABLE "Profile" ADD COLUMN "experience" TEXT;
ALTER TABLE "Profile" ADD COLUMN "phone" TEXT;
ALTER TABLE "Profile" ADD COLUMN "timezone" TEXT;

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL DEFAULT 'general',
    "description" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);

-- CreateTable
CREATE TABLE "ApiUsageLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "requestSize" INTEGER NOT NULL,
    "responseSize" INTEGER,
    "statusCode" INTEGER,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "duration" INTEGER NOT NULL,
    "submissionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Assignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "writerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "wordCount" INTEGER,
    "citationStyle" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "deadline" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assignment_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Assignment" ("createdAt", "deadline", "description", "id", "status", "title", "updatedAt", "writerId") SELECT "createdAt", "deadline", "description", "id", "status", "title", "updatedAt", "writerId" FROM "Assignment";
DROP TABLE "Assignment";
ALTER TABLE "new_Assignment" RENAME TO "Assignment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");
