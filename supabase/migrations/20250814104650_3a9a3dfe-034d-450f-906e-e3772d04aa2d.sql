-- Drop and recreate phone_otps table to ensure it exists with correct structure
DROP TABLE IF EXISTS public.phone_otps CASCADE;

CREATE TABLE public.phone_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'verify_mobile',
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address TEXT,
  consumed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access (needed for edge functions)
CREATE POLICY "Allow service role full access to phone_otps" 
ON public.phone_otps 
FOR ALL 
TO service_role 
USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_phone_otps_updated_at
    BEFORE UPDATE ON public.phone_otps
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();