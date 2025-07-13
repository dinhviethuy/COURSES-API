-- This is an empty migration.

CREATE UNIQUE INDEX "CartItem_userId_courseId_unique" ON "CartItem"("userId", "courseId") WHERE "deletedAt" IS NULL;