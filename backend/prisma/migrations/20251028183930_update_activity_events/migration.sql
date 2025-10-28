/*
  Warnings:

  - You are about to drop the column `action` on the `activity_events` table. All the data in the column will be lost.
  - Added the required column `type` to the `activity_events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "activity_events" DROP COLUMN "action",
ADD COLUMN     "listId" TEXT,
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "metadata" SET DEFAULT '{}';

-- CreateIndex
CREATE INDEX "activity_events_cardId_idx" ON "activity_events"("cardId");

-- CreateIndex
CREATE INDEX "activity_events_userId_idx" ON "activity_events"("userId");

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_listId_fkey" FOREIGN KEY ("listId") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
