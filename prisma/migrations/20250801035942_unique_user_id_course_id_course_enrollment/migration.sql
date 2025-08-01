-- DropIndex
DROP INDEX "CourseEnrollment_courseId_userId_key";

CREATE UNIQUE INDEX "CourseEnrollment_courseId_userId_key" ON "CourseEnrollment" ("courseId", "userId") WHERE "deletedAt" IS NULL;