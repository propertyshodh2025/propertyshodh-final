-- Enhanced trigger function to handle verification status notifications
CREATE OR REPLACE FUNCTION public.notify_verification_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Notify on verification status change
  IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
    INSERT INTO public.notifications (user_id, title, message, type, property_id)
    VALUES (
      NEW.user_id,
      CASE NEW.verification_status
        WHEN 'verified' THEN 'Property Verification Approved! ✅'
        WHEN 'rejected' THEN 'Property Verification Update'
        WHEN 'pending' THEN 'Verification Under Review'
        ELSE 'Verification Status Updated'
      END,
      CASE NEW.verification_status
        WHEN 'verified' THEN 'Congratulations! Your property "' || NEW.title || '" has been successfully verified. You now have a verification badge that builds trust with potential buyers and increases your property''s credibility.'
        WHEN 'rejected' THEN 'Your property "' || NEW.title || '" verification needs some updates. Please review the verification details and resubmit with the required information.'
        WHEN 'pending' THEN 'Your property "' || NEW.title || '" verification is currently being reviewed by our team. We''ll notify you once the review is complete.'
        ELSE 'Your property "' || NEW.title || '" verification status has been updated to ' || NEW.verification_status || '.'
      END,
      CASE NEW.verification_status
        WHEN 'verified' THEN 'success'
        WHEN 'rejected' THEN 'warning'
        WHEN 'pending' THEN 'info'
        ELSE 'info'
      END,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for verification status changes
DROP TRIGGER IF EXISTS verification_status_change_trigger ON public.properties;
CREATE TRIGGER verification_status_change_trigger
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_verification_status_change();

-- Function to notify admins when new verification requests are submitted
CREATE OR REPLACE FUNCTION public.notify_admin_verification_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  property_title TEXT;
BEGIN
  -- Get property title
  SELECT title INTO property_title
  FROM public.properties
  WHERE id = NEW.property_id;

  -- Create a system notification for admin review (this could be extended to notify specific admin users)
  -- For now, we'll just log this in admin activities if the admin activity system is available
  
  RETURN NEW;
END;
$$;

-- Create trigger for new verification submissions
DROP TRIGGER IF EXISTS verification_request_trigger ON public.property_verification_details;
CREATE TRIGGER verification_request_trigger
  AFTER INSERT ON public.property_verification_details
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_verification_request();

-- Update property verification status to pending when verification details are submitted
CREATE OR REPLACE FUNCTION public.update_verification_status_on_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update property verification status to pending when verification details are submitted
  UPDATE public.properties
  SET 
    verification_status = 'pending',
    verification_submitted_at = NOW()
  WHERE id = NEW.property_id
  AND verification_status = 'unverified';
  
  RETURN NEW;
END;
$$;

-- Create trigger to update property status when verification is submitted
DROP TRIGGER IF EXISTS update_verification_status_trigger ON public.property_verification_details;
CREATE TRIGGER update_verification_status_trigger
  AFTER INSERT ON public.property_verification_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_verification_status_on_submission();