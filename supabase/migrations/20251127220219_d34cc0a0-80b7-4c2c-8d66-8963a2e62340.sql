-- Add water quality assessment fields to risk_assessments table
ALTER TABLE public.risk_assessments
ADD COLUMN intake_water_source_quality TEXT,
ADD COLUMN primary_contaminants TEXT[],
ADD COLUMN treatment_before_use TEXT,
ADD COLUMN discharge_permit_type TEXT,
ADD COLUMN discharge_quality_concerns BOOLEAN DEFAULT false,
ADD COLUMN upstream_pollution_sources TEXT[],
ADD COLUMN water_quality_testing_frequency TEXT,
ADD COLUMN water_quality_risk_score INTEGER;

-- Add check constraint for water quality risk score
ALTER TABLE public.risk_assessments
ADD CONSTRAINT check_water_quality_risk_score 
CHECK (water_quality_risk_score IS NULL OR (water_quality_risk_score >= 0 AND water_quality_risk_score <= 100));