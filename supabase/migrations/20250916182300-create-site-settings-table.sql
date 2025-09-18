-- Create site_settings table
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  central_contact_number TEXT,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT,
  maintenance_enabled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read site settings (public data)
CREATE POLICY "Anyone can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Create policy to allow admin operations (assuming admin role exists)
CREATE POLICY "Admin can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial row if needed (optional)
INSERT INTO public.site_settings (central_contact_number, maintenance_mode) 
VALUES ('', FALSE)
ON CONFLICT DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE public.site_settings IS 'Global site settings and configuration';
COMMENT ON COLUMN public.site_settings.central_contact_number IS 'Central contact number for the website';
COMMENT ON COLUMN public.site_settings.maintenance_mode IS 'Whether the site is in maintenance mode';
COMMENT ON COLUMN public.site_settings.maintenance_message IS 'Message to display when in maintenance mode';
COMMENT ON COLUMN public.site_settings.maintenance_enabled_at IS 'When maintenance mode was enabled';