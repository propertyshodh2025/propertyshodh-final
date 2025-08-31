-- Create translations cache table for Marathi localization via Gemini
CREATE TABLE IF NOT EXISTS public.translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  source_lang text NOT NULL DEFAULT 'en',
  target_lang text NOT NULL DEFAULT 'mr',
  context text,
  translated text NOT NULL,
  provider text NOT NULL DEFAULT 'gemini',
  usage jsonb,
  hit_count integer NOT NULL DEFAULT 0,
  last_accessed timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_translations_lookup 
  ON public.translations (source_lang, target_lang, context);
CREATE UNIQUE INDEX IF NOT EXISTS idx_translations_unique 
  ON public.translations (source, source_lang, target_lang, context);

-- Enable RLS
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- Public read access (translations are non-sensitive display content)
CREATE POLICY IF NOT EXISTS "Public can view translations"
ON public.translations
FOR SELECT
USING (true);

-- Allow inserts from the web app and edge function (anonymous)
CREATE POLICY IF NOT EXISTS "Anyone can insert translations"
ON public.translations
FOR INSERT
WITH CHECK (true);

-- Allow updates (used for upserts and usage counters)
CREATE POLICY IF NOT EXISTS "Anyone can update translations"
ON public.translations
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Timestamps trigger
CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON public.translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Validation trigger to prevent abuse (prefer triggers over CHECK for flexibility)
CREATE OR REPLACE FUNCTION public.validate_translation_row()
RETURNS trigger AS $$
BEGIN
  IF char_length(COALESCE(NEW.source, '')) > 8000 THEN
    RAISE EXCEPTION 'source text too long (max 8000 chars)';
  END IF;
  IF char_length(COALESCE(NEW.translated, '')) > 8000 THEN
    RAISE EXCEPTION 'translated text too long (max 8000 chars)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_translation_row
BEFORE INSERT OR UPDATE ON public.translations
FOR EACH ROW
EXECUTE FUNCTION public.validate_translation_row();