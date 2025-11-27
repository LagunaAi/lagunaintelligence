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
    const { industrySector, waterSources, waterDisruptions, currentTreatment, primaryLocationCountry } = await req.json();

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

    // Cap all scores at 100
    physicalRisk = Math.min(physicalRisk, 100);
    regulatoryRisk = Math.min(regulatoryRisk, 100);
    reputationalRisk = Math.min(reputationalRisk, 100);
    financialRisk = Math.min(financialRisk, 100);

    // Calculate overall risk (weighted average)
    const overallRisk = Math.round(
      (physicalRisk * 0.3 + regulatoryRisk * 0.25 + reputationalRisk * 0.2 + financialRisk * 0.25)
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

    return new Response(
      JSON.stringify({
        overallRisk,
        physicalRisk,
        regulatoryRisk,
        reputationalRisk,
        financialRisk,
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