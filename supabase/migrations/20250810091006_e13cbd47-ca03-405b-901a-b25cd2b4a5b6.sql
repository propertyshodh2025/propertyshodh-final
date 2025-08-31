-- Harden validation function: set stable search_path
CREATE OR REPLACE FUNCTION public.validate_translation_row()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF char_length(COALESCE(NEW.source, '')) > 8000 THEN
    RAISE EXCEPTION 'source text too long (max 8000 chars)';
  END IF;
  IF char_length(COALESCE(NEW.translated, '')) > 8000 THEN
    RAISE EXCEPTION 'translated text too long (max 8000 chars)';
  END IF;
  RETURN NEW;
END;
$$;