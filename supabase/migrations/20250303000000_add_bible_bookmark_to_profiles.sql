-- Add Bible bookmark columns to profiles for "Continue Reading" feature.
-- Run in Supabase SQL Editor if the columns do not exist.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bible_bookmark_book text,
ADD COLUMN IF NOT EXISTS bible_bookmark_chapter integer;

COMMENT ON COLUMN public.profiles.bible_bookmark_book IS 'Book name for the user''s saved Bible reading position';
COMMENT ON COLUMN public.profiles.bible_bookmark_chapter IS 'Chapter number for the user''s saved Bible reading position';
