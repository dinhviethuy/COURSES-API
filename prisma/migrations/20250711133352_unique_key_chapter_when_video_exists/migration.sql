-- This is an empty migration.

DROP INDEX IF EXISTS unique_key_when_video_exists;

CREATE UNIQUE INDEX unique_key_chapter_when_video_exists
ON "Lesson"("key", "chapterId")
WHERE "videoUrl" IS NOT NULL;
