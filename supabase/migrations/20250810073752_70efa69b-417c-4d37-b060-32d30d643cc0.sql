-- Add featured flags (idempotent)
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS featured_at timestamp with time zone;

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS featured_until timestamp with time zone;

-- Optimize queries for active featured listings (idempotent)
CREATE INDEX IF NOT EXISTS properties_featured_active_idx
ON public.properties (is_featured, approval_status, listing_status, featured_until)
WHERE is_featured = true AND approval_status = 'approved' AND listing_status = 'active';