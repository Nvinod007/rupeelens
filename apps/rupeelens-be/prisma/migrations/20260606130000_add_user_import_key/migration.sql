-- AlterTable
ALTER TABLE "users" ADD COLUMN "importKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_importKey_key" ON "users"("importKey");
