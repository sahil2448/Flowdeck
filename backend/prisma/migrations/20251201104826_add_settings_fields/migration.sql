/*
  Warnings:

  - You are about to drop the column `notifications` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `tenants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "notifications",
DROP COLUMN "theme";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notifications" JSONB DEFAULT '{"email": true, "boards": true, "marketing": false}',
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'light';
