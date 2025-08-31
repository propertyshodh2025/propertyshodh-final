-- Create table for phone OTPs
CREATE TABLE IF NOT EXISTS public.phone_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'verify_mobile',
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '5 minutes'),
  attempts INTEGER NOT NULL DEFAULT 0,
  consumed BOOLEAN NOT NULL DEFAULT false,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  send_count INTEGER NOT NULL DEFAULT 1,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_phone_otps_phone ON public.phone_otps (phone);
CREATE INDEX IF NOT EXISTS idx_phone_otps_expires ON public.phone_otps (expires_at);

-- Enable RLS and keep access locked down (Edge functions use service role)
ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

-- No public policies; optionally allow owners later if needed
