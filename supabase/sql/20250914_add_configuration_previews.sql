-- Add separate preview columns for light and dark modes
ALTER TABLE public.configurations
  ADD COLUMN IF NOT EXISTS preview_light text,
  ADD COLUMN IF NOT EXISTS preview_dark text;

-- Optional: backfill existing single preview into preview_light
UPDATE public.configurations
SET preview_light = COALESCE(preview_light, preview)
WHERE preview IS NOT NULL AND preview_light IS NULL;
