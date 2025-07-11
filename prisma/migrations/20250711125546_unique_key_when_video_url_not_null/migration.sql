-- DropIndex
DROP INDEX "Lesson_key_idx";

CREATE UNIQUE INDEX unique_key_when_video_exists
ON "Lesson"("key")
WHERE "videoUrl" IS NOT NULL;
