-- DropIndex
DROP INDEX "Course_slug_key";

-- DropIndex
DROP INDEX "Role_name_key";

-- DropIndex
DROP INDEX "User_email_key";

CREATE UNIQUE INDEX "Course_slug_unique" ON "Course"("slug") WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "Role_name_unique" ON "Role"("name") WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "User_email_unique" ON "User"("email") WHERE "deletedAt" IS NULL;