/*
  Warnings:

  - Added the required column `size` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductSize" AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "size" "ProductSize" NOT NULL;

-- CreateIndex
CREATE INDEX "Product_size_idx" ON "Product"("size");
