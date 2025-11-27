-- Create app_role enum for role-based access
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'viewer');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create risk_assessments table
CREATE TABLE public.risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  industry_sector TEXT NOT NULL,
  annual_water_consumption NUMERIC NOT NULL,
  water_unit TEXT NOT NULL,
  primary_location_country TEXT NOT NULL,
  primary_location_region TEXT,
  facilities_count INTEGER NOT NULL,
  water_sources TEXT[] NOT NULL,
  water_cost_per_m3 NUMERIC,
  water_cost_currency TEXT,
  water_disruptions_past_5y BOOLEAN NOT NULL,
  disruption_description TEXT,
  current_treatment_level TEXT NOT NULL,
  overall_risk_score INTEGER NOT NULL,
  physical_risk_score INTEGER NOT NULL,
  regulatory_risk_score INTEGER NOT NULL,
  reputational_risk_score INTEGER NOT NULL,
  financial_risk_score INTEGER NOT NULL,
  recommended_actions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on risk_assessments
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;

-- RLS policies for risk_assessments
CREATE POLICY "Users can view their own assessments"
  ON public.risk_assessments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments"
  ON public.risk_assessments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
  ON public.risk_assessments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all assessments"
  ON public.risk_assessments
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_risk_assessments_updated_at
  BEFORE UPDATE ON public.risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();