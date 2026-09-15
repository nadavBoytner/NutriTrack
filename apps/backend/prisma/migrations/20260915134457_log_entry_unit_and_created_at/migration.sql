-- CreateEnum
CREATE TYPE "LogEntryUnit" AS ENUM ('g', 'portion');

-- AlterTable
ALTER TABLE "LogEntry" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "quantityUnit" "LogEntryUnit" NOT NULL DEFAULT 'g';
