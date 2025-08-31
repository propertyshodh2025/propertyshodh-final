-- Fix search_path for function created in previous migration
CREATE OR REPLACE FUNCTION public.create_lead_from_inquiry(_source_type TEXT, _source_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_id UUID;
BEGIN
  -- allow only admins
  IF NOT public.is_admin_authenticated() THEN
    RAISE EXCEPTION 'Only admins can create leads from inquiries';
  END IF;

  IF _source_type = 'user_inquiry' THEN
    INSERT INTO public.leads (
      source_type, source_id, name, phone, purpose, property_type, budget_range, location, status, priority, tags
    )
    SELECT 'user_inquiry', ui.id, ui.name, ui.phone, ui.purpose, ui.property_type, ui.budget_range, ui.location,
           'new', 'medium', ARRAY['user_inquiry']
    FROM public.user_inquiries ui WHERE ui.id = _source_id
    RETURNING id INTO new_id;
  ELSIF _source_type = 'property_inquiry' THEN
    INSERT INTO public.leads (
      source_type, source_id, name, phone, purpose, property_id, property_title, status, priority, tags
    )
    SELECT 'property_inquiry', pi.id, pi.user_name, pi.user_phone, pi.inquiry_type, pi.property_id,
           (SELECT title FROM public.properties p WHERE p.id = pi.property_id),
           'new', 'medium', ARRAY['property_inquiry']
    FROM public.property_inquiries pi WHERE pi.id = _source_id
    RETURNING id INTO new_id;
  ELSE
    RAISE EXCEPTION 'Unsupported source_type %', _source_type;
  END IF;

  RETURN new_id;
END;
$$;