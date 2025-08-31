-- Create table for tracking user activities
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- 'property_interest', 'property_search', 'property_listed'
  property_id UUID,
  search_query TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for secondary contact numbers
CREATE TABLE public.user_secondary_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_number TEXT NOT NULL,
  contact_type TEXT DEFAULT 'secondary', -- 'secondary', 'work', 'home', etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_activities
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for user_activities
CREATE POLICY "Admin can view all user activities" 
ON public.user_activities 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Users can create their own activities" 
ON public.user_activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Enable RLS on user_secondary_contacts
ALTER TABLE public.user_secondary_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for user_secondary_contacts
CREATE POLICY "Users can manage their own secondary contacts" 
ON public.user_secondary_contacts 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all secondary contacts" 
ON public.user_secondary_contacts 
FOR SELECT 
USING (is_admin());

-- Create index for better performance
CREATE INDEX idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX idx_user_activities_type ON public.user_activities(activity_type);
CREATE INDEX idx_user_secondary_contacts_user_id ON public.user_secondary_contacts(user_id);