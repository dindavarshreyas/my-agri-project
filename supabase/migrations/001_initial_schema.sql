-- ==============================================================================
-- Migration: 001_initial_schema.sql
-- Project: AI-Powered Agriculture Crop Advisory Assistant
-- Database: Supabase Cloud PostgreSQL
-- Description: Creates the core tables, foreign keys, indexes, RLS policies,
--              and automatic sample data seeding for new users.
-- Safe to re-run: Uses IF NOT EXISTS and DROP POLICY IF EXISTS.
-- Non-destructive: Does NOT drop or truncate existing tables.
-- ==============================================================================

-- 1. Enable Required UUID Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. Table: public.farms
-- Stores farmland metadata, soil chemistry (pH, NPK levels), and climate zones.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plot_name TEXT NOT NULL,
    acreage NUMERIC NOT NULL CHECK (acreage > 0),
    climate_zone TEXT NOT NULL CHECK (climate_zone IN ('Tropical', 'Arid', 'Temperate', 'Continental')),
    soil_type TEXT NOT NULL CHECK (soil_type IN ('Clay', 'Sandy', 'Loamy', 'Silt', 'Peat')),
    soil_ph NUMERIC NOT NULL CHECK (soil_ph >= 1.0 AND soil_ph <= 14.0),
    nitrogen_level TEXT NOT NULL CHECK (nitrogen_level IN ('Low', 'Medium', 'High')),
    phosphorus_level TEXT NOT NULL CHECK (phosphorus_level IN ('Low', 'Medium', 'High')),
    potassium_level TEXT NOT NULL CHECK (potassium_level IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for lightning-fast queries by user and creation date
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);
CREATE INDEX IF NOT EXISTS idx_farms_created_at ON public.farms(created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. Table: public.advisories
-- Stores AI-generated agronomic reports from Gemini 2.5 Flash, field symptoms,
-- and links directly to the specific farm plot and user.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    advisory_type TEXT NOT NULL CHECK (advisory_type IN ('Crop Selection', 'Pest Management')),
    user_observations TEXT,
    ai_response JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for filtering advisories by user, farm plot, and date
CREATE INDEX IF NOT EXISTS idx_advisories_user_id ON public.advisories(user_id);
CREATE INDEX IF NOT EXISTS idx_advisories_farm_id ON public.advisories(farm_id);
CREATE INDEX IF NOT EXISTS idx_advisories_created_at ON public.advisories(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures complete tenant isolation: Users can ONLY access their own data.
-- ------------------------------------------------------------------------------

-- Enable RLS on both tables
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisories ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies before recreating (allows safe re-running)
DROP POLICY IF EXISTS "Users can view their own farms" ON public.farms;
DROP POLICY IF EXISTS "Users can insert their own farms" ON public.farms;
DROP POLICY IF EXISTS "Users can update their own farms" ON public.farms;
DROP POLICY IF EXISTS "Users can delete their own farms" ON public.farms;

DROP POLICY IF EXISTS "Users can view their own advisories" ON public.advisories;
DROP POLICY IF EXISTS "Users can insert their own advisories" ON public.advisories;
DROP POLICY IF EXISTS "Users can update their own advisories" ON public.advisories;
DROP POLICY IF EXISTS "Users can delete their own advisories" ON public.advisories;

-- Farm RLS Policies
CREATE POLICY "Users can view their own farms" 
    ON public.farms FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own farms" 
    ON public.farms FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farms" 
    ON public.farms FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farms" 
    ON public.farms FOR DELETE 
    USING (auth.uid() = user_id);

-- Advisory RLS Policies
CREATE POLICY "Users can view their own advisories" 
    ON public.advisories FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own advisories" 
    ON public.advisories FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own advisories" 
    ON public.advisories FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own advisories" 
    ON public.advisories FOR DELETE 
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. Helper Function: Seed Sample Agri Data for a User
-- Automatically gives newly signed up farmers 2 realistic farm plots and
-- sample Gemini crop advisories so the dashboard is immediately populated.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.seed_sample_agri_data(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
    new_farm_id UUID;
BEGIN
    -- Only seed if the user has no existing plots
    IF NOT EXISTS (SELECT 1 FROM public.farms WHERE user_id = target_user_id) THEN
        
        -- Sample Plot 1: Green Valley Plot A
        INSERT INTO public.farms (
            user_id, plot_name, acreage, climate_zone, soil_type, 
            soil_ph, nitrogen_level, phosphorus_level, potassium_level
        ) VALUES (
            target_user_id, 'Green Valley Plot A', 15.5, 'Temperate', 'Loamy', 
            6.5, 'Medium', 'High', 'Medium'
        ) RETURNING id INTO new_farm_id;

        -- Sample Advisory for Plot 1
        INSERT INTO public.advisories (
            user_id, farm_id, advisory_type, user_observations, ai_response
        ) VALUES (
            target_user_id,
            new_farm_id,
            'Crop Selection',
            'Planning for the upcoming spring rotation. Looking for high-yield grains or legumes suited for loamy soil.',
            '{
                "summary": "Excellent soil conditions with optimal pH 6.5 and balanced NPK. Highly recommended for Spring Wheat or Soybeans rotation.",
                "risk_level": "Low",
                "recommended_actions": [
                    {
                        "action_title": "Soil Bed Preparation",
                        "timeline": "Pre-planting (2 weeks before sowing)",
                        "details": "Light tillage to aerate top 15cm of loamy soil while conserving moisture."
                    },
                    {
                        "action_title": "Seed Inoculation & Sowing",
                        "timeline": "Early Spring",
                        "details": "Inoculate legume seeds with Rhizobium bacteria to maximize nitrogen fixation."
                    },
                    {
                        "action_title": "Fertilizer Top-Dressing",
                        "timeline": "Within 30 days of germination",
                        "details": "Since phosphorus is high and nitrogen is medium, apply a low-phosphate organic compost or light nitrogen booster."
                    }
                ],
                "preventative_measures": [
                    "Implement 3-year crop rotation with legumes to maintain natural nitrogen balance.",
                    "Monitor soil moisture levels using tensiometers during early vegetative stage."
                ]
            }'::jsonb
        );

        -- Sample Plot 2: Highland Orchard
        INSERT INTO public.farms (
            user_id, plot_name, acreage, climate_zone, soil_type, 
            soil_ph, nitrogen_level, phosphorus_level, potassium_level
        ) VALUES (
            target_user_id, 'Highland Orchard', 8.2, 'Continental', 'Clay', 
            5.8, 'Low', 'Medium', 'High'
        ) RETURNING id INTO new_farm_id;

        -- Sample Advisory for Plot 2
        INSERT INTO public.advisories (
            user_id, farm_id, advisory_type, user_observations, ai_response
        ) VALUES (
            target_user_id,
            new_farm_id,
            'Pest Management',
            'Observed yellowing leaves with small brown necrotic spots on tomato foliage after heavy rains.',
            '{
                "summary": "Symptoms strongly indicate Early Blight (Alternaria solani) exacerbated by poor clay drainage and humid conditions.",
                "risk_level": "Medium",
                "recommended_actions": [
                    {
                        "action_title": "Foliage Pruning & Sanitation",
                        "timeline": "Immediate (Within 24 hours)",
                        "details": "Sterilize shears and prune all affected lower leaves showing necrotic spotting. Bag and burn discarded foliage."
                    },
                    {
                        "action_title": "Copper-based Fungicide Application",
                        "timeline": "Within 48 hours",
                        "details": "Apply liquid copper octanoate or OMRI-listed bio-fungicide (Bacillus subtilis) covering both leaf sides."
                    },
                    {
                        "action_title": "Mulching & Moisture Control",
                        "timeline": "Within 3 days",
                        "details": "Apply clean straw mulch to stop rainwater splashing spores from clay soil onto foliage."
                    }
                ],
                "preventative_measures": [
                    "Improve field drainage trenches around clay plots to prevent standing water.",
                    "Switch to drip irrigation to keep upper canopy completely dry.",
                    "Apply agricultural lime to gradually raise soil pH from 5.8 toward 6.5."
                ]
            }'::jsonb
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 6. Trigger: Auto-seed when a new user signs up via Supabase Auth
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_user_first_signup_seed()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.seed_sample_agri_data(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_seed ON auth.users;
CREATE TRIGGER on_auth_user_created_seed
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_first_signup_seed();

-- ------------------------------------------------------------------------------
-- 7. Seed any users that might already exist in auth.users
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    existing_user_record RECORD;
BEGIN
    FOR existing_user_record IN SELECT id FROM auth.users LOOP
        PERFORM public.seed_sample_agri_data(existing_user_record.id);
    END LOOP;
END $$;
