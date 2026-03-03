-- Add reading_progress column to profiles for Bible reading plan sync across devices.
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor) if the column does not exist.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS reading_progress text;

COMMENT ON COLUMN public.profiles.reading_progress IS 'JSON: { completed_readings, selected_plan_day, bible_book, bible_chapter }';
