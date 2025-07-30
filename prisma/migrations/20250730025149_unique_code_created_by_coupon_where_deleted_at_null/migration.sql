-- This is an empty migration.

ALTER TABLE "Coupon" DROP CONSTRAINT IF EXISTS "unique_code_coupon_where_deleted_at_null";

CREATE UNIQUE INDEX "unique_code_createdBy_coupon_where_deleted_at_null"
ON "Coupon" ("code", "createdById")
WHERE "deletedAt" IS NULL;
