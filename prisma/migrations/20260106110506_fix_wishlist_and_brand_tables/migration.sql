/*
  Warnings:

  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `rawData` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sizeOptions` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sourceSite` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "category",
DROP COLUMN "color",
DROP COLUMN "price",
DROP COLUMN "rawData",
DROP COLUMN "sizeOptions",
DROP COLUMN "sourceSite",
ADD COLUMN     "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "AegisProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "url" TEXT,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AegisProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TomazProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "url" TEXT,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TomazProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmartMasterProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "url" TEXT,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmartMasterProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AegisProduct_url_key" ON "AegisProduct"("url");

-- CreateIndex
CREATE UNIQUE INDEX "TomazProduct_url_key" ON "TomazProduct"("url");

-- CreateIndex
CREATE UNIQUE INDEX "SmartMasterProduct_url_key" ON "SmartMasterProduct"("url");
