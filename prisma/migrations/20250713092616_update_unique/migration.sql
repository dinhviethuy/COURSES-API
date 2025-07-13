-- DropIndex
DROP INDEX "CartItem_userId_courseId_key";

-- DropIndex
DROP INDEX "Permission_path_method_key";

CREATE UNIQUE INDEX "Permission_path_method_unique" ON "Permission"("path", "method") WHERE "deletedAt" IS NULL;