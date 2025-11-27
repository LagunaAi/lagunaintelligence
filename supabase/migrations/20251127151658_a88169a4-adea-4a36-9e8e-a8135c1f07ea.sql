-- Create enum types
CREATE TYPE public.technology_type AS ENUM (
  'desalination',
  'reuse',
  'leak_detection',
  'smart_metering',
  'nature_based',
  'circular_systems',
  'treatment',
  'other'
);

CREATE TYPE public.sector_type AS ENUM (
  'municipal',
  'industrial',
  'agriculture',
  'mining',
  'energy',
  'commercial'
);

CREATE TYPE public.project_stage AS ENUM (
  'planning',
  'construction',
  'operational',
  'completed'
);

CREATE TYPE public.subscription_tier AS ENUM (
  'free',
  'pro',
  'enterprise'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  queries_remaining INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  technology_type technology_type NOT NULL,
  sector sector_type NOT NULL,
  region TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  project_stage project_stage NOT NULL DEFAULT 'planning',
  start_date DATE,
  completion_date DATE,
  capacity_value DECIMAL,
  capacity_unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view projects"
  ON public.projects FOR SELECT
  USING (true);

-- Create financials table
CREATE TABLE public.financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  total_investment_usd DECIMAL NOT NULL,
  annual_operating_cost_usd DECIMAL,
  annual_revenue_usd DECIMAL,
  roi_percent DECIMAL,
  payback_years DECIMAL,
  npv_usd DECIMAL,
  irr_percent DECIMAL,
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 1 AND confidence_score <= 100),
  data_source TEXT NOT NULL,
  source_url TEXT
);

ALTER TABLE public.financials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view financials"
  ON public.financials FOR SELECT
  USING (true);

-- Create outcomes table
CREATE TABLE public.outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  water_saved_m3_year DECIMAL,
  water_produced_m3_day DECIMAL,
  energy_saved_kwh_year DECIMAL,
  co2_avoided_tons_year DECIMAL,
  jobs_created INTEGER,
  population_served INTEGER,
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 1 AND confidence_score <= 100)
);

ALTER TABLE public.outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view outcomes"
  ON public.outcomes FOR SELECT
  USING (true);

-- Create chat_history table
CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  projects_referenced UUID[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat history"
  ON public.chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history"
  ON public.chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create saved_projects table
CREATE TABLE public.saved_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

ALTER TABLE public.saved_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved projects"
  ON public.saved_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved projects"
  ON public.saved_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved projects"
  ON public.saved_projects FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own saved projects"
  ON public.saved_projects FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for projects updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();