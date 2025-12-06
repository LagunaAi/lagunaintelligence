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
    const { industrySector, country, region, annualWaterConsumption, waterUnit } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `You are a water risk intelligence expert. Generate comparative intelligence data for:
- Industry: ${industrySector}
- Country: ${country}
- Region: ${region || 'Not specified'}
- Annual Water Consumption: ${annualWaterConsumption} ${waterUnit}

Return a JSON object with exactly this structure:
{
  "industryBenchmark": {
    "userConsumption": ${annualWaterConsumption},
    "industryAverage": <number - estimated average annual water consumption for this industry in ${waterUnit}>,
    "unit": "${waterUnit}",
    "status": "<'efficient' if user is below average, 'average' if within 10%, 'high' if above average>",
    "percentageDifference": <number - how much above/below average as a percentage>,
    "insight": "<one sentence explaining the comparison>"
  },
  "floodRisk": {
    "riskLevel": "<'low', 'medium', or 'high'>",
    "score": <number 0-100>,
    "factors": ["<list 2-3 specific flood risk factors for this region>"],
    "seasonalPeak": "<when flood risk is highest, e.g., 'Monsoon season (June-September)'>",
    "insight": "<one sentence about flood risk in this specific region>"
  },
  "peerInsights": [
    {
      "title": "<short title of a common risk/challenge>",
      "description": "<2-3 sentence description of how other companies in this industry/region face this challenge>",
      "frequency": "<'Common', 'Very Common', or 'Emerging'>"
    }
  ]
}

For peerInsights, provide exactly 3 insights that are specific to ${industrySector} companies operating in ${country}. Focus on:
1. Regulatory challenges they commonly face
2. Water supply/quality issues specific to the region
3. ESG/reputational concerns in this market

Be specific and realistic. Use actual knowledge about water issues in ${country} and the ${industrySector} industry.
Return ONLY valid JSON, no additional text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a water risk and industry benchmarking expert. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let intelligenceData;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      intelligenceData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse intelligence data");
    }

    return new Response(JSON.stringify(intelligenceData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error generating comparative intelligence:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
