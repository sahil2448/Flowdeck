-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "fileKey" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "fileType" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "dueDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "card_members" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "card_members_cardId_idx" ON "card_members"("cardId");

-- CreateIndex
CREATE INDEX "card_members_userId_idx" ON "card_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "card_members_cardId_userId_key" ON "card_members"("cardId", "userId");

-- CreateIndex
CREATE INDEX "attachments_userId_idx" ON "attachments"("userId");

-- AddForeignKey
ALTER TABLE "card_members" ADD CONSTRAINT "card_members_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_members" ADD CONSTRAINT "card_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
