-- Enhance featured properties system with packages and analytics
-- This migration adds fields for featuring packages, analytics tracking, and activity logging

-- Add featuring package and analytics fields to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS featuring_package TEXT,
ADD COLUMN IF NOT EXISTS featuring_priority INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS featuring_views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featuring_clicks_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featuring_inquiries_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featuring_revenue DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS featuring_scheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS featuring_activated_by UUID REFERENCES public.admin_credentials(id);

-- Create featured properties activity log table
CREATE TABLE IF NOT EXISTS public.featured_properties_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.admin_credentials(id),
  action TEXT NOT NULL CHECK (action IN ('featured', 'unfeatured', 'extended', 'expired', 'scheduled')),
  package_type TEXT,
  duration_days INTEGER,
  revenue DECIMAL(10,2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Metadata for analytics
  featured_from TIMESTAMPTZ,
  featured_until TIMESTAMPTZ,
  previous_package TEXT,
  system_action BOOLEAN DEFAULT FALSE
);

-- Enable RLS on featured properties log
ALTER TABLE public.featured_properties_log ENABLE ROW LEVEL SECURITY;

-- Admin can manage featured properties log
CREATE POLICY "Admin can manage featured properties log"
ON public.featured_properties_log
FOR ALL
USING (public.is_admin_authenticated())
WITH CHECK (public.is_admin_authenticated());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_featured_properties_log_property_id ON public.featured_properties_log(property_id);
CREATE INDEX IF NOT EXISTS idx_featured_properties_log_admin_id ON public.featured_properties_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_featured_properties_log_created_at ON public.featured_properties_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_featured_properties_log_action ON public.featured_properties_log(action);

CREATE INDEX IF NOT EXISTS idx_properties_featuring_package ON public.properties(featuring_package);
CREATE INDEX IF NOT EXISTS idx_properties_featuring_priority ON public.properties(featuring_priority DESC);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured_priority ON public.properties(is_featured, featuring_priority DESC);

-- Create featured properties analytics view
CREATE OR REPLACE VIEW public.featured_properties_analytics AS
SELECT 
  p.id,
  p.title,
  p.property_type,
  p.price,
  p.location,
  p.city,
  p.is_featured,
  p.featured_at,
  p.featured_until,
  p.featuring_package,
  p.featuring_priority,
  p.featuring_views_count,
  p.featuring_clicks_count,
  p.featuring_inquiries_count,
  p.featuring_revenue,
  
  -- Calculate ROI metrics
  CASE 
    WHEN p.featuring_revenue > 0 AND p.featuring_views_count > 0 
    THEN p.featuring_inquiries_count::FLOAT / p.featuring_views_count * 100 
    ELSE 0 
  END as conversion_rate,
  
  CASE 
    WHEN p.featuring_revenue > 0 AND p.featuring_clicks_count > 0 
    THEN p.featuring_inquiries_count::FLOAT / p.featuring_clicks_count * 100 
    ELSE 0 
  END as inquiry_rate,
  
  -- Days remaining (if active)
  CASE 
    WHEN p.is_featured = TRUE AND p.featured_until IS NOT NULL AND p.featured_until > NOW()
    THEN EXTRACT(DAYS FROM (p.featured_until - NOW()))::INTEGER
    ELSE 0
  END as days_remaining,
  
  -- Status
  CASE 
    WHEN p.is_featured = TRUE AND (p.featured_until IS NULL OR p.featured_until > NOW())
    THEN 'active'
    WHEN p.is_featured = TRUE AND p.featured_until < NOW()
    THEN 'expired'
    ELSE 'not_featured'
  END as featuring_status,
  
  -- Recent activity
  (SELECT COUNT(*) FROM public.featured_properties_log fpl WHERE fpl.property_id = p.id AND fpl.created_at >= NOW() - INTERVAL '30 days') as activity_count_30_days
  
FROM public.properties p
WHERE p.approval_status = 'approved';

-- Grant access to the view
GRANT SELECT ON public.featured_properties_analytics TO authenticated;

-- Create function to automatically log featuring activities
CREATE OR REPLACE FUNCTION public.log_featuring_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_id_val UUID;
  action_type TEXT;
  duration_val INTEGER;
BEGIN
  -- Get current admin ID (if available)
  admin_id_val := current_setting('app.current_admin_id', TRUE)::UUID;
  
  -- Determine action type
  IF OLD.is_featured = FALSE AND NEW.is_featured = TRUE THEN
    action_type := 'featured';
    
    -- Calculate duration if featured_until is set
    IF NEW.featured_until IS NOT NULL THEN
      duration_val := EXTRACT(DAYS FROM (NEW.featured_until - COALESCE(NEW.featured_at, NOW())))::INTEGER;
    END IF;
    
  ELSIF OLD.is_featured = TRUE AND NEW.is_featured = FALSE THEN
    action_type := 'unfeatured';
    
  ELSIF OLD.is_featured = TRUE AND NEW.is_featured = TRUE THEN
    -- Check if duration was extended
    IF OLD.featured_until IS DISTINCT FROM NEW.featured_until AND NEW.featured_until > COALESCE(OLD.featured_until, NOW()) THEN
      action_type := 'extended';
      duration_val := EXTRACT(DAYS FROM (NEW.featured_until - COALESCE(OLD.featured_until, NOW())))::INTEGER;
    END IF;
  END IF;
  
  -- Log the activity if there's an action
  IF action_type IS NOT NULL THEN
    INSERT INTO public.featured_properties_log (
      property_id,
      admin_id,
      action,
      package_type,
      duration_days,
      revenue,
      featured_from,
      featured_until,
      previous_package,
      system_action
    ) VALUES (
      NEW.id,
      admin_id_val,
      action_type,
      NEW.featuring_package,
      duration_val,
      NEW.featuring_revenue - COALESCE(OLD.featuring_revenue, 0),
      NEW.featured_at,
      NEW.featured_until,
      OLD.featuring_package,
      admin_id_val IS NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic activity logging
DROP TRIGGER IF EXISTS trigger_log_featuring_activity ON public.properties;
CREATE TRIGGER trigger_log_featuring_activity
  AFTER UPDATE OF is_featured, featured_at, featured_until, featuring_package
  ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.log_featuring_activity();

-- Create function to automatically expire featured properties
CREATE OR REPLACE FUNCTION public.expire_featured_properties()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Update expired properties
  WITH expired_properties AS (
    UPDATE public.properties 
    SET 
      is_featured = FALSE,
      listing_status = CASE 
        WHEN listing_status = 'Featured' THEN 'Active' 
        ELSE listing_status 
      END
    WHERE is_featured = TRUE 
      AND featured_until IS NOT NULL 
      AND featured_until < NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO expired_count FROM expired_properties;
  
  -- Log the expiration activities
  INSERT INTO public.featured_properties_log (
    property_id,
    action,
    system_action,
    notes
  )
  SELECT 
    id,
    'expired',
    TRUE,
    'Automatically expired by system'
  FROM public.properties
  WHERE is_featured = FALSE 
    AND featured_until IS NOT NULL 
    AND featured_until < NOW()
    AND updated_at >= NOW() - INTERVAL '5 minutes'; -- Only recently updated ones
  
  RETURN expired_count;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.expire_featured_properties() TO authenticated;

-- Create function to get featuring analytics summary
CREATE OR REPLACE FUNCTION public.get_featuring_analytics_summary()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_featured', (SELECT COUNT(*) FROM public.properties WHERE is_featured = TRUE),
    'active_featured', (SELECT COUNT(*) FROM public.properties WHERE is_featured = TRUE AND (featured_until IS NULL OR featured_until > NOW())),
    'expired_featured', (SELECT COUNT(*) FROM public.properties WHERE is_featured = TRUE AND featured_until IS NOT NULL AND featured_until < NOW()),
    'total_revenue', (SELECT COALESCE(SUM(featuring_revenue), 0) FROM public.properties WHERE featuring_revenue > 0),
    'avg_conversion_rate', (
      SELECT COALESCE(AVG(
        CASE 
          WHEN featuring_views_count > 0 
          THEN featuring_inquiries_count::FLOAT / featuring_views_count * 100 
          ELSE 0 
        END
      ), 0) 
      FROM public.properties 
      WHERE featuring_views_count > 0
    ),
    'package_distribution', (
      SELECT json_object_agg(
        COALESCE(featuring_package, 'custom'), 
        package_count
      )
      FROM (
        SELECT 
          COALESCE(featuring_package, 'custom') as featuring_package,
          COUNT(*) as package_count
        FROM public.properties 
        WHERE is_featured = TRUE
        GROUP BY featuring_package
      ) pkg_dist
    ),
    'monthly_activities', (
      SELECT json_agg(
        json_build_object(
          'date', activity_date,
          'featured_count', featured_count,
          'unfeatured_count', unfeatured_count
        ) ORDER BY activity_date DESC
      )
      FROM (
        SELECT 
          DATE(created_at) as activity_date,
          COUNT(CASE WHEN action = 'featured' THEN 1 END) as featured_count,
          COUNT(CASE WHEN action = 'unfeatured' THEN 1 END) as unfeatured_count
        FROM public.featured_properties_log 
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY activity_date DESC
        LIMIT 30
      ) daily_stats
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.get_featuring_analytics_summary() TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.featured_properties_log IS 'Activity log for all featuring/unfeaturing actions on properties';
COMMENT ON VIEW public.featured_properties_analytics IS 'Comprehensive analytics view for featured properties performance';
COMMENT ON FUNCTION public.expire_featured_properties() IS 'System function to automatically expire featured properties past their end date';
COMMENT ON FUNCTION public.get_featuring_analytics_summary() IS 'Returns comprehensive analytics summary for featured properties dashboard';