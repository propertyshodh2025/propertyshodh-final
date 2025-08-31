-- Add new fields to properties table to match the comprehensive form
ALTER TABLE public.properties 
ADD COLUMN furnishing TEXT,
ADD COLUMN highlights TEXT[],
ADD COLUMN built_year INTEGER,
ADD COLUMN floor TEXT,
ADD COLUMN facing TEXT,
ADD COLUMN agent_name TEXT,
ADD COLUMN agent_phone TEXT;