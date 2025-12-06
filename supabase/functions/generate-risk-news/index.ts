import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { industrySector, country } = await req.json();
    
    if (!industrySector || !country) {
      throw new Error("Missing required fields: industrySector and country");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Generate 4-5 realistic news headlines about water-related risks for the ${industrySector} industry in ${country}. 
    
Focus on these types of risks:
1. Water scarcity and drought impacts
2. Regulatory changes and compliance issues  
3. Community opposition to water usage
4. Environmental concerns and pollution
5. Supply chain disruptions due to water issues

For each headline, provide:
- A realistic, specific headline that sounds like it could be from a major news outlet
- A reputable-sounding source name (like Reuters, Bloomberg, local major newspaper, industry publication)
- A date within the last 6 months
- A 1-2 sentence summary
- 1-2 relevant tags from: "Water Scarcity", "Regulatory Pressure", "Community Opposition", "Environmental Concern", "Supply Chain Risk"
- sentiment: "negative" for severe issues or "warning" for concerning trends

Return ONLY a valid JSON array with this structure:
[
  {
    "id": "1",
    "headline": "Headline text here",
    "source": "Source Name",
    "date": "Month Year",
    "summary": "Brief summary here",
    "tags": ["Tag1"],
    "industryTag": "${industrySector}",
    "sentiment": "negative" or "warning"
  }
]`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a news analyst specializing in water risk and ESG issues for industrial sectors. Generate realistic, plausible news headlines based on real-world trends and concerns. Return only valid JSON, no markdown formatting." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let articles;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      articles = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    console.log(`Generated ${articles.length} news articles for ${industrySector} in ${country}`);

    return new Response(JSON.stringify({ articles }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in generate-risk-news:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});