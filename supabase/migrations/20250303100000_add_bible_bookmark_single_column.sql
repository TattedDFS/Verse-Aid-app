-- Single Bible bookmark column: "BookName:ChapterNumber" (e.g. "John:3").
-- Run in Supabase SQL Editor if the column does not exist.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bible_bookmark text;

COMMENT ON COLUMN public.profiles.bible_bookmark IS 'Saved reading position: "BookName:ChapterNumber" (e.g. John:3)';
