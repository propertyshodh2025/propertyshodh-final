-- Fix notification triggers to handle null user_id
CREATE OR REPLACE FUNCTION public.notify_property_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create notifications if the property has a user_id
  IF NEW.user_id IS NOT NULL THEN
    -- Notify on approval status change
    IF OLD.approval_status IS DISTINCT FROM NEW.approval_status THEN
      INSERT INTO public.notifications (user_id, title, message, type, property_id)
      VALUES (
        NEW.user_id,
        CASE NEW.approval_status
          WHEN 'approved' THEN 'Property Approved!'
          WHEN 'rejected' THEN 'Property Rejected'
          ELSE 'Property Status Updated'
        END,
        CASE NEW.approval_status
          WHEN 'approved' THEN 'Your property "' || NEW.title || '" has been approved and is now live.'
          WHEN 'rejected' THEN 'Your property "' || NEW.title || '" was rejected. Please review and resubmit.'
          ELSE 'Your property "' || NEW.title || '" status has been updated to ' || NEW.approval_status || '.'
        END,
        CASE NEW.approval_status
          WHEN 'approved' THEN 'success'
          WHEN 'rejected' THEN 'error'
          ELSE 'info'
        END,
        NEW.id
      );
    END IF;

    -- Notify on verification status change
    IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
      INSERT INTO public.notifications (user_id, title, message, type, property_id)
      VALUES (
        NEW.user_id,
        CASE NEW.verification_status
          WHEN 'verified' THEN 'Property Verified!'
          WHEN 'rejected' THEN 'Verification Rejected'
          ELSE 'Verification Status Updated'
        END,
        CASE NEW.verification_status
          WHEN 'verified' THEN 'Your property "' || NEW.title || '" has been verified! You now have a verification badge.'
          WHEN 'rejected' THEN 'Your property "' || NEW.title || '" verification was rejected. Please review verification details.'
          ELSE 'Your property "' || NEW.title || '" verification status has been updated.'
        END,
        CASE NEW.verification_status
          WHEN 'verified' THEN 'success'
          WHEN 'rejected' THEN 'error'
          ELSE 'info'
        END,
        NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Also fix the verification notification trigger
CREATE OR REPLACE FUNCTION public.notify_verification_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create notifications if the property has a user_id
  IF NEW.user_id IS NOT NULL THEN
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
  END IF;

  RETURN NEW;
END;
$function$;