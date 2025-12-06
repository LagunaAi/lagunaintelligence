import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Industry defaults for missing data (worst case assumptions for risk assessment)
const INDUSTRY_DEFAULTS: Record<string, {
  waterSources: string[];
  currentTreatment: string;
  intakeWaterQuality: string;
}> = {
  "Manufacturing": {
    waterSources: ["Municipal supply"],
    currentTreatment: "Basic",
    intakeWaterQuality: "Fair"
  },
  "Food & Beverage": {
    waterSources: ["Municipal supply"],
    currentTreatment: "Advanced",
    intakeWaterQuality: "Good"
  },
  "Pharmaceuticals": {
    waterSources: ["Municipal supply"],
    currentTreatment: "Advanced",
    intakeWaterQuality: "Excellent"
  },
  "Semiconductors": {
    waterSources: ["Municipal supply"],
    currentTreatment: "Advanced",
    intakeWaterQuality: "Good"
  },
  "Mining": {
    waterSources: ["Surface water", "Groundwater"],
    currentTreatment: "Basic",
    intakeWaterQuality: "Poor"
  },
  "Agriculture": {
    waterSources: ["Surface water", "Groundwater"],
    currentTreatment: "None",
    intakeWaterQuality: "Fair"
  },
  "Energy": {
    waterSources: ["Surface water", "Municipal supply"],
    currentTreatment: "Basic",
    intakeWaterQuality: "Fair"
  },
  "Data Centers": {
    waterSources: ["Municipal supply"],
    currentTreatment: "Basic",
    intakeWaterQuality: "Good"
  },
  "Textiles": {
    waterSources: ["Municipal supply", "Groundwater"],
    currentTreatment: "Basic",
    intakeWaterQuality: "Fair"
  },
  "Other": {
    waterSources: ["Municipal supply"],
    currentTreatment: "Basic",
    intakeWaterQuality: "Fair"
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description } = await req.json();
    
    if (!description || typeof description !== 'string') {
      throw new Error('Description is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing description:', description.substring(0, 100) + '...');

    const systemPrompt = `You are a water risk assessment expert. Your task is to extract structured data from a user's description of their business operations.

Extract the following fields from the text. If a field is not explicitly mentioned, make an educated guess based on the industry and context provided:

1. industrySector: One of: "Manufacturing", "Food & Beverage", "Pharmaceuticals", "Semiconductors", "Mining", "Agriculture", "Energy", "Data Centers", "Textiles", "Other"

2. primaryLocationCountry: The country where operations are based (e.g., "Taiwan", "United States", "Germany")

3. primaryLocationRegion: The specific region/state/province if mentioned (e.g., "Hsinchu", "California", "Bavaria"). Leave empty string if not mentioned.

4. waterSources: An array of water sources. Choose from: "Municipal supply", "Groundwater", "Surface water", "Recycled/reclaimed", "Desalinated", "Rainwater". Default to ["Municipal supply"] if not specified.

5. waterDisruptions: Boolean - true if the user mentions any past water scarcity, shortages, disruptions, or supply issues. Default to false.

6. currentTreatment: One of: "None", "Basic", "Advanced", "Zero Liquid Discharge". Make educated guess based on industry.

7. intakeWaterQuality: One of: "Excellent", "Good", "Fair", "Poor", "Unknown". Make educated guess based on region and industry needs.

8. companyName: Extract if mentioned, otherwise use "Quick Scan Assessment"

9. estimatedWaterConsumption: A rough estimate in m³/year based on industry and size hints. Use 100000 as default for unknown.

Return ONLY a valid JSON object with these exact field names, no additional text or explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: description }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_risk_data",
              description: "Extract water risk assessment parameters from the user's description",
              parameters: {
                type: "object",
                properties: {
                  industrySector: {
                    type: "string",
                    enum: ["Manufacturing", "Food & Beverage", "Pharmaceuticals", "Semiconductors", "Mining", "Agriculture", "Energy", "Data Centers", "Textiles", "Other"]
                  },
                  primaryLocationCountry: { type: "string" },
                  primaryLocationRegion: { type: "string" },
                  waterSources: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: ["Municipal supply", "Groundwater", "Surface water", "Recycled/reclaimed", "Desalinated", "Rainwater"]
                    }
                  },
                  waterDisruptions: { type: "boolean" },
                  currentTreatment: {
                    type: "string",
                    enum: ["None", "Basic", "Advanced", "Zero Liquid Discharge"]
                  },
                  intakeWaterQuality: {
                    type: "string",
                    enum: ["Excellent", "Good", "Fair", "Poor", "Unknown"]
                  },
                  companyName: { type: "string" },
                  estimatedWaterConsumption: { type: "number" }
                },
                required: ["industrySector", "primaryLocationCountry", "waterSources", "waterDisruptions", "currentTreatment", "intakeWaterQuality"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_risk_data" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI gateway error');
    }

    const aiResponse = await response.json();
    console.log('AI Response:', JSON.stringify(aiResponse));

    let extractedData;
    
    // Extract from tool call response
    if (aiResponse.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      const args = aiResponse.choices[0].message.tool_calls[0].function.arguments;
      extractedData = typeof args === 'string' ? JSON.parse(args) : args;
    } else if (aiResponse.choices?.[0]?.message?.content) {
      // Fallback: try to parse content as JSON
      const content = aiResponse.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      }
    }

    if (!extractedData) {
      throw new Error('Failed to extract data from AI response');
    }

    console.log('Extracted data:', extractedData);

    // Apply industry defaults for any missing fields
    const industry = extractedData.industrySector || "Other";
    const defaults = INDUSTRY_DEFAULTS[industry] || INDUSTRY_DEFAULTS["Other"];

    const result = {
      industrySector: extractedData.industrySector || "Other",
      primaryLocationCountry: extractedData.primaryLocationCountry || "Unknown",
      primaryLocationRegion: extractedData.primaryLocationRegion || "",
      waterSources: extractedData.waterSources?.length > 0 ? extractedData.waterSources : defaults.waterSources,
      waterDisruptions: extractedData.waterDisruptions ?? false,
      currentTreatment: extractedData.currentTreatment || defaults.currentTreatment,
      intakeWaterQuality: extractedData.intakeWaterQuality || defaults.intakeWaterQuality,
      companyName: extractedData.companyName || "Quick Scan Assessment",
      estimatedWaterConsumption: extractedData.estimatedWaterConsumption || 100000
    };

    console.log('Final result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in parse-risk-description:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
