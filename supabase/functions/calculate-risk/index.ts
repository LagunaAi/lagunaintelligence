import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Country-level water stress data (based on WRI Aqueduct simplified)
const COUNTRY_WATER_STRESS: Record<string, number> = {
  // Extremely High Stress (70+)
  "Qatar": 85, "Israel": 80, "Lebanon": 78, "Iran": 75, "Jordan": 75,
  "Libya": 75, "Kuwait": 80, "Saudi Arabia": 75, "Eritrea": 70, "UAE": 75,
  "San Marino": 70, "Bahrain": 80, "India": 65, "Pakistan": 70, "Turkmenistan": 70,
  "Oman": 72, "Botswana": 65,
  
  // High Stress (50-70)
  "Chile": 55, "Cyprus": 55, "Yemen": 65, "Afghanistan": 60, "Syria": 60,
  "Tunisia": 55, "Morocco": 50, "Algeria": 50, "Belgium": 50, "Greece": 50,
  "Mexico": 50, "Spain": 50, "South Africa": 55, "Turkey": 50, "Uzbekistan": 55,
  "Taiwan": 55, "Singapore": 50, "Australia": 50, "Egypt": 60,
  
  // Medium-High Stress (40-50)
  "China": 45, "Italy": 45, "Poland": 45, "Portugal": 45, "Thailand": 45,
  "Vietnam": 42, "Germany": 40, "France": 38, "Japan": 40, "South Korea": 42,
  "Netherlands": 40, "United Kingdom": 35, "Philippines": 40, "Indonesia": 38,
  "Malaysia": 35, "Argentina": 40,
  
  // Medium Stress (25-40)
  "United States": 35, "USA": 35, "Canada": 25, "Brazil": 28, "Russia": 25,
  "Sweden": 20, "Norway": 18, "Finland": 18, "Denmark": 25, "Ireland": 22,
  "New Zealand": 20, "Peru": 30, "Colombia": 28, "Austria": 25, "Switzerland": 22,
  "Czech Republic": 28, "Romania": 30, "Hungary": 32,
  
  // Low Stress (<25)
  "Iceland": 10, "Papua New Guinea": 12, "Bhutan": 15, "Congo": 15,
  "Cameroon": 18, "Gabon": 15, "Suriname": 12, "Guyana": 12
};

// Region modifiers for specific high-stress regions
const REGION_MODIFIERS: Record<string, Record<string, number>> = {
  "United States": {
    "California": 15, "Arizona": 20, "Nevada": 18, "Utah": 15,
    "Colorado": 12, "New Mexico": 15, "Texas": 10, "Florida": 8
  },
  "USA": {
    "California": 15, "Arizona": 20, "Nevada": 18, "Utah": 15,
    "Colorado": 12, "New Mexico": 15, "Texas": 10, "Florida": 8
  },
  "China": {
    "Beijing": 15, "Hebei": 12, "Shandong": 10, "Henan": 10,
    "Shanxi": 12, "Xinjiang": 15, "Gansu": 15, "Inner Mongolia": 10
  },
  "India": {
    "Rajasthan": 15, "Gujarat": 12, "Maharashtra": 10, "Karnataka": 10,
    "Tamil Nadu": 12, "Punjab": 8, "Haryana": 10, "Delhi": 12
  },
  "Australia": {
    "South Australia": 15, "Victoria": 10, "New South Wales": 8,
    "Western Australia": 12, "Queensland": 5
  },
  "Spain": {
    "Andalusia": 15, "Murcia": 18, "Valencia": 12, "Castilla-La Mancha": 10
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Calculate Physical Risk based on country data
    let physicalRisk = 35; // Default for unknown countries
    let riskSource = "Default estimation";

    // Normalize country name for lookup
    const normalizedCountry = primaryLocationCountry?.trim() || "";
    
    // Look up country stress
    const countryStress = COUNTRY_WATER_STRESS[normalizedCountry];
    if (countryStress !== undefined) {
      physicalRisk = countryStress;
      riskSource = `Water stress data (${normalizedCountry})`;
      
      // Apply region modifier if available
      const regionModifiers = REGION_MODIFIERS[normalizedCountry];
      if (regionModifiers && primaryLocationRegion) {
        const normalizedRegion = primaryLocationRegion.trim();
        for (const [region, modifier] of Object.entries(regionModifiers)) {
          if (normalizedRegion.toLowerCase().includes(region.toLowerCase()) ||
              region.toLowerCase().includes(normalizedRegion.toLowerCase())) {
            physicalRisk += modifier;
            riskSource = `Water stress data (${normalizedRegion}, ${normalizedCountry})`;
            break;
          }
        }
      }
    } else {
      console.log(`No water stress data for country: ${normalizedCountry}`);
    }

    // Adjust based on user's specific situation
    if (waterDisruptions) {
      physicalRisk += 10;
    }
    if (waterSources && waterSources.includes('Groundwater') && !waterSources.includes('Municipal supply')) {
      physicalRisk += 5;
    }

    // Regulatory Risk
    let regulatoryRisk = 30;
    const highRegSectors = ['Semiconductors', 'Pharmaceuticals', 'Mining', 'Food & Beverage'];
    if (highRegSectors.includes(industrySector)) regulatoryRisk += 25;
    if (currentTreatment === 'None' || currentTreatment === 'Basic') regulatoryRisk += 20;
    if (dischargeQualityConcerns) regulatoryRisk += 15;
    if (dischargePermitType === 'Direct to surface water (river, ocean)') regulatoryRisk += 10;

    // Reputational Risk
    let reputationalRisk = 30;
    const highRepSectors = ['Food & Beverage', 'Textiles', 'Mining', 'Agriculture'];
    if (highRepSectors.includes(industrySector)) reputationalRisk += 25;
    if (currentTreatment === 'None') reputationalRisk += 15;
    if (dischargeQualityConcerns) reputationalRisk += 20;

    // Financial Risk
    let financialRisk = 30;
    if (waterDisruptions) financialRisk += 25;
    const waterIntensiveSectors = ['Semiconductors', 'Data Centers', 'Pharmaceuticals', 'Food & Beverage'];
    if (waterIntensiveSectors.includes(industrySector)) financialRisk += 20;
    if (physicalRisk > 60) financialRisk += 15; // High physical risk = financial exposure

    // Water Quality Risk
    let waterQualityRisk = 20;
    const qualityScores: Record<string, number> = { 
      'Excellent': 5, 'Good': 15, 'Fair': 30, 'Poor': 50, 'Unknown': 35 
    };
    waterQualityRisk = qualityScores[intakeWaterQuality] || 35;
    
    // Adjust for contaminants
    if (primaryContaminants && primaryContaminants.length > 0) {
      const severeContaminants = ['Heavy metals (arsenic, lead, chromium)', 'PFAS/Forever chemicals'];
      const hasSevere = primaryContaminants.some((c: string) => severeContaminants.includes(c));
      if (hasSevere) waterQualityRisk += 20;
      waterQualityRisk += primaryContaminants.length * 3;
    }
    
    // Adjust for upstream pollution
    if (upstreamPollutionSources && upstreamPollutionSources.length > 0 && 
        !upstreamPollutionSources.includes('None known')) {
      waterQualityRisk += upstreamPollutionSources.length * 5;
    }
    
    // Testing frequency factor
    if (waterQualityTestingFrequency === 'Never / Don\'t know') waterQualityRisk += 10;
    if (waterQualityTestingFrequency === 'Annually or less') waterQualityRisk += 5;

    // Cap all scores to 100
    physicalRisk = Math.min(Math.round(physicalRisk), 100);
    regulatoryRisk = Math.min(Math.round(regulatoryRisk), 100);
    reputationalRisk = Math.min(Math.round(reputationalRisk), 100);
    financialRisk = Math.min(Math.round(financialRisk), 100);
    waterQualityRisk = Math.min(Math.round(waterQualityRisk), 100);

    const overallRisk = Math.round(
      physicalRisk * 0.25 + 
      regulatoryRisk * 0.2 + 
      reputationalRisk * 0.15 + 
      financialRisk * 0.2 + 
      waterQualityRisk * 0.2
    );

    // Generate recommendations based on risk factors
    const recommendations = [];
    
    if (physicalRisk > 60) {
      recommendations.push({
        title: "Diversify Water Sources",
        priority: "high",
        description: `High physical water risk detected (${riskSource}). Consider alternative sources like rainwater harvesting, water recycling, or desalination.`
      });
    }
    
    if (regulatoryRisk > 60) {
      recommendations.push({
        title: "Upgrade Treatment Systems",
        priority: "high",
        description: "High regulatory risk. Invest in advanced water treatment to ensure compliance and reduce violation risk."
      });
    }
    
    if (financialRisk > 60) {
      recommendations.push({
        title: "Implement Water Efficiency Measures",
        priority: "high",
        description: "High financial exposure to water risk. Consider water recycling systems and efficiency audits to reduce consumption and costs."
      });
    }
    
    if (waterQualityRisk > 50) {
      recommendations.push({
        title: "Enhance Water Quality Monitoring",
        priority: "medium",
        description: "Implement continuous water quality monitoring and consider additional pre-treatment for incoming water."
      });
    }
    
    if (reputationalRisk > 50) {
      recommendations.push({
        title: "Develop Water Stewardship Program",
        priority: "medium",
        description: "Consider joining water stewardship initiatives and improving transparency in water use reporting."
      });
    }
    
    if (currentTreatment === 'None' || currentTreatment === 'Basic') {
      recommendations.push({
        title: "Upgrade Wastewater Treatment",
        priority: "medium",
        description: "Current treatment level may not meet future regulatory requirements. Consider upgrading to advanced treatment."
      });
    }

    console.log('Risk calculation complete:', { 
      country: normalizedCountry, 
      region: primaryLocationRegion,
      overallRisk, 
      physicalRisk, 
      source: riskSource 
    });

    return new Response(
      JSON.stringify({
        overallRisk,
        physicalRisk,
        regulatoryRisk,
        reputationalRisk,
        financialRisk,
        waterQualityRisk,
        recommendations,
        source: riskSource
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
