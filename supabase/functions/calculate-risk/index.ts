import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      intakeWaterQuality,
      primaryContaminants,
      treatmentBeforeUse,
      dischargePermitType,
      dischargeQualityConcerns,
      upstreamPollutionSources,
      waterQualityTestingFrequency
    } = await req.json();

    // Calculate risk scores based on multiple factors
    let physicalRisk = 30;
    let regulatoryRisk = 30;
    let reputationalRisk = 30;
    let financialRisk = 30;

    // Physical risk factors
    const highRiskCountries = ['United Arab Emirates', 'Saudi Arabia', 'India', 'South Africa', 'Australia'];
    if (highRiskCountries.some(country => primaryLocationCountry.toLowerCase().includes(country.toLowerCase()))) {
      physicalRisk += 30;
    }

    if (waterDisruptions) {
      physicalRisk += 20;
    }

    if (waterSources.includes('Groundwater') && !waterSources.includes('Municipal supply')) {
      physicalRisk += 15;
    }

    // Regulatory risk factors
    const highRegSectors = ['Semiconductors', 'Pharmaceuticals', 'Mining', 'Food & Beverage'];
    if (highRegSectors.includes(industrySector)) {
      regulatoryRisk += 25;
    }

    if (currentTreatment === 'None' || currentTreatment === 'Basic') {
      regulatoryRisk += 20;
    }

    // Reputational risk factors
    const highRepSectors = ['Food & Beverage', 'Textiles', 'Mining', 'Agriculture'];
    if (highRepSectors.includes(industrySector)) {
      reputationalRisk += 25;
    }

    if (currentTreatment === 'None') {
      reputationalRisk += 15;
    }

    // Financial risk factors
    if (waterDisruptions) {
      financialRisk += 25;
    }

    const waterIntensiveSectors = ['Semiconductors', 'Data Centers', 'Pharmaceuticals', 'Food & Beverage'];
    if (waterIntensiveSectors.includes(industrySector)) {
      financialRisk += 20;
    }

    // Calculate Water Quality Risk
    let waterQualityRisk = 0;
    
    // Intake quality (0-25 points)
    const qualityScores: Record<string, number> = {
      'Excellent': 0,
      'Good': 5,
      'Fair': 15,
      'Poor': 25,
      'Unknown': 20
    };
    waterQualityRisk += qualityScores[intakeWaterQuality] || 20;
    
    // Contaminants present (0-25 points)
    const highRiskContaminants = ['PFAS/Forever chemicals', 'Heavy metals (arsenic, lead, chromium)', 'Organic compounds (pesticides, solvents)'];
    const contaminantCount = primaryContaminants?.length || 0;
    const hasHighRisk = primaryContaminants?.some((c: string) => highRiskContaminants.includes(c));
    waterQualityRisk += Math.min(contaminantCount * 4, 15);
    if (hasHighRisk) waterQualityRisk += 10;
    
    // Discharge risk (0-20 points)
    if (dischargeQualityConcerns) waterQualityRisk += 15;
    if (dischargePermitType === 'Direct to surface water (river, ocean)') waterQualityRisk += 5;
    
    // Upstream pollution (0-15 points)
    const upstreamCount = upstreamPollutionSources?.length || 0;
    waterQualityRisk += Math.min(upstreamCount * 5, 15);
    
    // Monitoring gap (0-15 points)
    const monitoringScores: Record<string, number> = {
      'Continuous online monitoring': 0,
      'Daily': 2,
      'Weekly': 5,
      'Monthly': 10,
      'Annually or less': 13,
      'Never / Don\'t know': 15
    };
    waterQualityRisk += monitoringScores[waterQualityTestingFrequency] || 15;

    // Cap all scores at 100
    physicalRisk = Math.min(physicalRisk, 100);
    regulatoryRisk = Math.min(regulatoryRisk, 100);
    reputationalRisk = Math.min(reputationalRisk, 100);
    financialRisk = Math.min(financialRisk, 100);
    waterQualityRisk = Math.min(waterQualityRisk, 100);

    // Calculate overall risk (weighted average including water quality)
    const overallRisk = Math.round(
      (physicalRisk * 0.25 + regulatoryRisk * 0.2 + reputationalRisk * 0.15 + financialRisk * 0.2 + waterQualityRisk * 0.2)
    );

    // Generate recommendations based on risk profile
    const recommendations = [];

    if (physicalRisk > 60) {
      recommendations.push({
        title: "Diversify Water Sources",
        priority: "high",
        description: "Consider alternative water sources like recycled water or rainwater harvesting to reduce dependency on stressed sources."
      });
    }

    if (regulatoryRisk > 60) {
      recommendations.push({
        title: "Upgrade Treatment Systems",
        priority: "high",
        description: "Invest in advanced water treatment to meet evolving discharge regulations and PFAS standards."
      });
    }

    if (financialRisk > 60) {
      recommendations.push({
        title: "Water Efficiency Projects",
        priority: "medium",
        description: "Implement water reuse and recycling systems to reduce operating costs and supply risk."
      });
    }

    if (reputationalRisk > 50) {
      recommendations.push({
        title: "ESG Reporting Enhancement",
        priority: "medium",
        description: "Strengthen water stewardship programs and transparent reporting to stakeholders."
      });
    }

    // Water quality specific recommendations
    if (waterQualityRisk > 50) {
      recommendations.push({
        title: "Advanced Treatment System",
        priority: "high",
        description: "Consider implementing RO/UF for intake water to address quality concerns and ensure operational reliability."
      });
    }

    if (primaryContaminants?.includes('PFAS/Forever chemicals')) {
      recommendations.push({
        title: "PFAS Treatment Compliance",
        priority: "high",
        description: "PFAS regulations are tightening globally. Implement specialized PFAS treatment to ensure compliance and avoid liability."
      });
    }

    if (dischargeQualityConcerns) {
      recommendations.push({
        title: "Wastewater Treatment Upgrade",
        priority: "high",
        description: "Upgrade discharge treatment systems, consider MBR (Membrane Bioreactor) for consistent compliance with permit limits."
      });
    }

    if (waterQualityTestingFrequency === 'Monthly' || waterQualityTestingFrequency === 'Annually or less' || waterQualityTestingFrequency === 'Never / Don\'t know') {
      recommendations.push({
        title: "Continuous Quality Monitoring",
        priority: "medium",
        description: "Implement real-time water quality monitoring to detect contamination early and prevent operational disruptions."
      });
    }

    return new Response(
      JSON.stringify({
        overallRisk,
        physicalRisk,
        regulatoryRisk,
        reputationalRisk,
        financialRisk,
        waterQualityRisk,
        recommendations
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error calculating risk:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});