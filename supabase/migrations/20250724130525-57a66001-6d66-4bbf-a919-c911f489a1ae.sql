-- Add user_id column to properties table for proper user association
ALTER TABLE public.properties 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX idx_properties_user_id ON public.properties(user_id);

-- Update RLS policies to allow users to see their own properties
DROP POLICY IF EXISTS "Authenticated users can submit properties" ON public.properties;
DROP POLICY IF EXISTS "Admin can insert properties" ON public.properties;

-- Create new policies with user_id association
CREATE POLICY "Users can insert their own properties" 
ON public.properties FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own properties" 
ON public.properties FOR SELECT 
USING (auth.uid() = user_id OR true); -- Allow viewing all properties but users can only insert their own

CREATE POLICY "Admin can manage all properties" 
ON public.properties FOR ALL 
USING (is_admin_authenticated());

-- Create notifications table for property status updates
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  property_id UUID REFERENCES public.properties(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger to send notifications on property status changes
CREATE OR REPLACE FUNCTION public.notify_property_status_change()
RETURNS TRIGGER AS $$
BEGIN
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for property status notifications
CREATE TRIGGER trigger_property_status_notifications
  AFTER UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_property_status_change();