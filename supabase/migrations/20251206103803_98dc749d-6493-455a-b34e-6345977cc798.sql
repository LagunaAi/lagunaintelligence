-- Create table for WRI regional water risk scores
CREATE TABLE public.regional_risk_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country text NOT NULL,
  region text NOT NULL,
  physical_risk_score integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(country, region)
);

-- Enable RLS
ALTER TABLE public.regional_risk_scores ENABLE ROW LEVEL SECURITY;

-- Anyone can read this reference data
CREATE POLICY "Anyone can view regional risk scores" 
ON public.regional_risk_scores 
FOR SELECT 
USING (true);

-- Create index for fast lookups
CREATE INDEX idx_regional_risk_country_region ON public.regional_risk_scores(country, region);