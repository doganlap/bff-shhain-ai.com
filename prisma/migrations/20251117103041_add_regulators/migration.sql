-- CreateTable
CREATE TABLE "Regulator" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "website" TEXT,
    "contactEmail" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Regulator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" SERIAL NOT NULL,
    "regulatorId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Regulator_name_key" ON "Regulator"("name");

-- CreateIndex
CREATE INDEX "Publication_regulatorId_idx" ON "Publication"("regulatorId");

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_regulatorId_fkey" FOREIGN KEY ("regulatorId") REFERENCES "Regulator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
