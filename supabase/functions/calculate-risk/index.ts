import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // 1. Hantera CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // -----------------------------------------------------------
    // 2. Initiera BÅDA Supabase-klienterna
    // -----------------------------------------------------------

    // A. Lovable / Standard (Hämtar automatiskt injicerade vars eller fallback till VITE_)
    const lovableUrl = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('VITE_SUPABASE_URL') ?? '';
    const lovableKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('VITE_SUPABASE_PUBLISHABLE_KEY') ?? '';

    // B. Ditt Personliga Konto (Läser från .env)
    const myUrl = Deno.env.get('MY_SUPABASE_URL') ?? '';
    const myKey = Deno.env.get('MY_SUPABASE_KEY') ?? '';

    // Säkerhetskoll
    if (!myUrl || !myKey) {
      throw new Error("Saknar MY_SUPABASE_URL eller MY_SUPABASE_KEY i .env filen");
    }

    // Skapa klienterna
    const supabaseLovable = createClient(lovableUrl, lovableKey);
    const supabasePersonal = createClient(myUrl, myKey); // <--- Denna används för wri_risk_data nedan

    // -----------------------------------------------------------
    // 3. Hämta input från request
    // -----------------------------------------------------------
    const {
      industrySector,
      waterSources,
      waterDisruptions,
      currentTreatment,
      primaryLocationCountry,
      primaryLocationRegion,
      intakeWaterQuality,
      primaryContaminants,
      treatmentBeforeUse,
      dischargePermitType,
      dischargeQualityConcerns,
      upstreamPollutionSources,
      waterQualityTestingFrequency
    } = await req.json();

    // -----------------------------------------------------------
    // 4. Slå upp Physical Risk (Använder din PERSONLIGA databas)
    // -----------------------------------------------------------
    let physicalRisk = 30; // Default
    let riskSource = "Default estimation";

    // A. Försök hitta exakt matchning (Land + Region)
    if (primaryLocationRegion) {
      // OBS: Här använder vi 'supabasePersonal' istället för 'supabase'
      const { data: regionData } = await supabasePersonal
          .from('wri_risk_data')
          .select('physical_risk_score')
          .ilike('country', primaryLocationCountry) // ilike = case insensitive
          .ilike('region', primaryLocationRegion)
          .maybeSingle();

      if (regionData) {
        physicalRisk = regionData.physical_risk_score;
        riskSource = `WRI Aqueduct (Region: ${primaryLocationRegion})`;
      }
    }

    // B. Om ingen region-matchning, försök med bara Land
    if (riskSource === "Default estimation") {
      const { data: countryData } = await supabasePersonal
          .from('wri_risk_data')
          .select('physical_risk_score')
          .ilike('country', primaryLocationCountry)
          .is('region', null)
          .maybeSingle();

      if (countryData) {
        physicalRisk = countryData.physical_risk_score;
        riskSource = `WRI Aqueduct (Country avg: ${primaryLocationCountry})`;
      }
    }

    // -----------------------------------------------------------
    // 5. Riskanalys & Matematik (Exakt samma som din kod)
    // -----------------------------------------------------------

    // Justera baserat på användarens specifika situation
    if (waterDisruptions) physicalRisk += 10;
    if (waterSources && waterSources.includes('Groundwater') && !waterSources.includes('Municipal supply')) physicalRisk += 5;

    // --- Övriga risker (Regulatory, Reputational, Financial) ---
    let regulatoryRisk = 30;
    let reputationalRisk = 30;
    let financialRisk = 30;

    const highRegSectors = ['Semiconductors', 'Pharmaceuticals', 'Mining', 'Food & Beverage'];
    if (highRegSectors.includes(industrySector)) regulatoryRisk += 25;
    if (currentTreatment === 'None' || currentTreatment === 'Basic') regulatoryRisk += 20;

    const highRepSectors = ['Food & Beverage', 'Textiles', 'Mining', 'Agriculture'];
    if (highRepSectors.includes(industrySector)) reputationalRisk += 25;
    if (currentTreatment === 'None') reputationalRisk += 15;

    if (waterDisruptions) financialRisk += 25;
    const waterIntensiveSectors = ['Semiconductors', 'Data Centers', 'Pharmaceuticals', 'Food & Beverage'];
    if (waterIntensiveSectors.includes(industrySector)) financialRisk += 20;

    // --- Water Quality Risk ---
    let waterQualityRisk = 0;
    const qualityScores: Record<string, number> = { 'Excellent': 0, 'Good': 5, 'Fair': 15, 'Poor': 25, 'Unknown': 20 };
    // Safe check if intakeWaterQuality is defined
    waterQualityRisk += qualityScores[intakeWaterQuality] || 20;

    // Cap alla scores till 100
    physicalRisk = Math.min(physicalRisk, 100);
    regulatoryRisk = Math.min(regulatoryRisk, 100);
    reputationalRisk = Math.min(reputationalRisk, 100);
    financialRisk = Math.min(financialRisk, 100);
    waterQualityRisk = Math.min(waterQualityRisk, 100);

    const overallRisk = Math.round(
        (physicalRisk * 0.25 + regulatoryRisk * 0.2 + reputationalRisk * 0.15 + financialRisk * 0.2 + waterQualityRisk * 0.2)
    );

    const recommendations = [];
    if (physicalRisk > 60) {
      recommendations.push({
        title: "Diversify Water Sources",
        priority: "high",
        description: `High physical water risk detected (${riskSource}). Consider alternative sources like rainwater harvesting or water reuse.`
      });
    }
    // ... (Här kan du lägga till fler recommendations om du hade det i originalkoden)

    // -----------------------------------------------------------
    // 6. Returnera svar
    // -----------------------------------------------------------
    return new Response(
        JSON.stringify({
          overallRisk,
          physicalRisk,
          regulatoryRisk,
          reputationalRisk,
          financialRisk,
          waterQualityRisk,
          recommendations,
          // Debug info för att se att vi använder din DB
          source: riskSource
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});