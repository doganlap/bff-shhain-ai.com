-- AlterTable
ALTER TABLE "Regulator" ADD COLUMN     "address" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "jurisdictions" TEXT[],
ADD COLUMN     "sectors" TEXT[];
