-- Create table for research report leads
CREATE TABLE public.research_report_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_verified_user BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.research_report_leads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin can manage all research report leads"
ON public.research_report_leads
FOR ALL
USING (is_admin_authenticated())
WITH CHECK (is_admin_authenticated());

-- Create trigger for timestamps
CREATE TRIGGER update_research_report_leads_updated_at
BEFORE UPDATE ON public.research_report_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();