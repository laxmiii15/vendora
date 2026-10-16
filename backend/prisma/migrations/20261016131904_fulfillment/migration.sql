-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Fulfillment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "status" "FulfillmentStatus" NOT NULL DEFAULT 'PENDING',
    "trackingNumber" TEXT,
    "shippedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fulfillment_pkey" PRIMARY KEY ("id")
);

-- Backfill: one fulfillment per (order, seller) for existing orders. Its
-- status mirrors the order's (PAID means not shipped yet, so PENDING).
-- Existing rows get uuids; new rows get cuids from Prisma, both are TEXT.
INSERT INTO "Fulfillment" ("id", "orderId", "sellerId", "status", "shippedAt", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    o."id",
    p."sellerId",
    CASE o."status"::text
        WHEN 'SHIPPED' THEN 'SHIPPED'
        WHEN 'DELIVERED' THEN 'DELIVERED'
        WHEN 'CANCELLED' THEN 'CANCELLED'
        ELSE 'PENDING'
    END::"FulfillmentStatus",
    CASE WHEN o."status"::text IN ('SHIPPED', 'DELIVERED') THEN o."updatedAt" END,
    o."createdAt",
    o."updatedAt"
FROM "Order" o
JOIN "OrderItem" oi ON oi."orderId" = o."id"
JOIN "Product" p ON p."id" = oi."productId"
GROUP BY o."id", p."sellerId";

-- AlterTable: add nullable, link existing items, then require it.
ALTER TABLE "OrderItem" ADD COLUMN "fulfillmentId" TEXT;

UPDATE "OrderItem" oi
SET "fulfillmentId" = f."id"
FROM "Product" p, "Fulfillment" f
WHERE p."id" = oi."productId"
  AND f."orderId" = oi."orderId"
  AND f."sellerId" = p."sellerId";

ALTER TABLE "OrderItem" ALTER COLUMN "fulfillmentId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Fulfillment_sellerId_status_idx" ON "Fulfillment"("sellerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Fulfillment_orderId_sellerId_key" ON "Fulfillment"("orderId", "sellerId");

-- CreateIndex
CREATE INDEX "OrderItem_fulfillmentId_idx" ON "OrderItem"("fulfillmentId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_fulfillmentId_fkey" FOREIGN KEY ("fulfillmentId") REFERENCES "Fulfillment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fulfillment" ADD CONSTRAINT "Fulfillment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fulfillment" ADD CONSTRAINT "Fulfillment_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
