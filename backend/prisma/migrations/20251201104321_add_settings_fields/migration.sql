-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "notifications" JSONB DEFAULT '{"email": true, "boards": true, "marketing": false}',
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'light';
