-- CreateEnum
CREATE TYPE "AccountSource" AS ENUM ('MANUAL', 'SETU');

-- AlterTable
ALTER TABLE "bank_accounts" ADD COLUMN "source" "AccountSource" NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "bank_accounts" ALTER COLUMN "consentId" DROP NOT NULL;

-- DropIndex (if exists from old schema - may not exist)
-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_userId_setuAccountId_key" ON "bank_accounts"("userId", "setuAccountId");

-- DropForeignKey
ALTER TABLE "bank_accounts" DROP CONSTRAINT "bank_accounts_consentId_fkey";

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_consentId_fkey" FOREIGN KEY ("consentId") REFERENCES "consents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
