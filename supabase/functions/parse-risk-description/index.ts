import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced industry benchmarks with water consumption data
const INDUSTRY_BENCHMARKS: Record<string, {
  waterUseM3Year: number;
  waterUsePerDay: string;
  typicalSources: string[];
  keyRisks: string[];
  description: string;
  waterSources: string[];
  currentTreatment: string;
  intakeWaterQuality: string;
}> = {
  "Semiconductors": {
    waterUseM3Year: 5500000,
    waterUsePerDay: "4-10 million gallons per fab",
    typicalSources: ["Municipal", "Groundwater"],
    keyRisks: ["Physical", "Financial", "Regulatory"],
    description: "Semiconductor fabs require ultrapure water for wafer cleaning",
    waterSources: ["Municipal supply"],
    currentTreatment: "Advanced",
    intakeWaterQuality: "Good"
  },
  "Data Centers": {
    waterUseM3Year: 1500000,
    waterUsePerDay: "1-5 million gallons per facility",
    typicalSources: ["Municipal"],
    keyRisks: ["Physical", "Reputational", "Financial"],
    description: "Data centers use water for cooling systems",
    waterSources: ["Municipal supply"],
    currentTreatment: "Basic",
    intakeWaterQuality: "Good"
  },
  "Food & Beverage": {
    waterUseM3Year: 800000,
    waterUsePerDay: "500K-2M gallons per facility",
    typicalSources: ["Municipal", "Groundwater", "Surface water"],
    keyRisks: ["Physical", "Regulatory", "Reputational"],
    description: "Food & beverage requires water as ingredient and for cleaning",
    waterSources: ["Municipal supply"],
    currentTreatment: "Advanced",
    intakeWaterQuality: "Good"
  },
  "Pharmaceuticals": {
    waterUseM3Year: 500000,
    waterUsePerDay: "200K-1M gallons per facility",
    typicalSources: ["Municipal", "Purified/WFI systems"],
    keyRisks: ["Regulatory", "Water Quality", "Financial"],
    description: "Pharma requires highly purified water for production",
    waterSources: ["Municipal supply"],
    currentTreatment: "Advanced",
    intakeWaterQuality: "Excellent"
  },
  "Chemicals": {
    waterUseM3Year: 2000000,
    waterUsePerDay: "1-5M gallons per facility",
    typicalSources: ["Surface water", "Municipal", "Recycled"],
    keyRisks: ["Regulatory", "Reputational", "Physical"],
    description: "Chemical manufacturing uses water for processing and cooling",
    waterSources: ["Municipal supply", "Surface water"],
    currentTreatment: "Basic",
    intakeWaterQuality: "Fair"
  },
  "Mining": {
    waterUseM3Year: 4000000,
    waterUsePerDay: "2-10M gallons per site",
    typicalSources: ["Groundwater", "Surface water"],
    keyRisks: ["Physical", "Reputational", "Regulatory"],
    description: "Mining operations require water for processing and dust control",
    waterSources: ["Surface water", "Groundwater"],
    currentTreatment: "Basic",
    intakeWaterQuality: "Poor"
  },
  "Textiles": {
    waterUseM3Year: 1000000,
    waterUsePerDay: "500K-2M gallons per facility",
    typicalSources: ["Municipal", "Groundwater"],
    keyRisks: ["Regulatory", "Reputational", "Physical"],
    description: "Textile dyeing and finishing are water-intensive",
    waterSources: ["Municipal supply", "Groundwater"],
    currentTreatment: "Basic",
    intakeWaterQuality: "Fair"
  },
  "Manufacturing": {
    waterUseM3Year: 500000,
    waterUsePerDay: "200K-1M gallons per facility",
    typicalSources: ["Municipal"],
    keyRisks: ["Physical", "Financial", "Regulatory"],
    description: "General manufacturing uses water for cooling and processing",
    waterSources: ["Municipal supply"],
    currentTreatment: "Basic",
    intakeWaterQuality: "Fair"
  },
  "Agriculture": {
    waterUseM3Year: 2000000,
    waterUsePerDay: "1-5M gallons per operation",
    typicalSources: ["Surface water", "Groundwater"],
    keyRisks: ["Physical", "Financial", "Regulatory"],
    description: "Agriculture uses water for irrigation and livestock",
    waterSources: ["Surface water", "Groundwater"],
    currentTreatment: "None",
    intakeWaterQuality: "Fair"
  },
  "Energy": {
    waterUseM3Year: 3000000,
    waterUsePerDay: "1-10M gallons per plant",
    typicalSources: ["Surface water", "Municipal"],
    keyRisks: ["Physical", "Regulatory", "Financial"],
    description: "Power plants use water for cooling and steam generation",
    waterSources: ["Surface water", "Municipal supply"],
    currentTreatment: "Basic",
    intakeWaterQuality: "Fair"
  },
  "Other": {
    waterUseM3Year: 500000,
    waterUsePerDay: "Varies",
    typicalSources: ["Municipal"],
    keyRisks: ["Physical", "Financial", "Regulatory"],
    description: "Water usage varies by operation type",
    waterSources: ["Municipal supply"],
    currentTreatment: "Basic",
    intakeWaterQuality: "Fair"
  }
};

// Regional risk factors for major regions
const REGIONAL_RISK_FACTORS: Record<string, {
  physicalRisk?: string;
  regulatoryRisk?: string;
  financialRisk?: string;
  reputationalRisk?: string;
  governanceRisk?: string;
  notes: string;
}> = {
  "Arizona": {
    physicalRisk: "HIGH",
    governanceRisk: "HIGH",
    financialRisk: "HIGH",
    notes: "Arizona faces Colorado River allocation cuts and groundwater restrictions"
  },
  "Taiwan": {
    physicalRisk: "HIGH",
    regulatoryRisk: "MEDIUM",
    notes: "Taiwan experienced severe droughts in 2021-2023 affecting semiconductor production"
  },
  "California": {
    physicalRisk: "HIGH",
    regulatoryRisk: "HIGH",
    financialRisk: "HIGH",
    notes: "California has some of the strictest water regulations in the US"
  },
  "Singapore": {
    physicalRisk: "MEDIUM",
    financialRisk: "HIGH",
    regulatoryRisk: "MEDIUM",
    notes: "Singapore has high water prices but excellent infrastructure"
  },
  "India": {
    physicalRisk: "HIGH",
    governanceRisk: "HIGH",
    reputationalRisk: "HIGH",
    notes: "Many Indian regions face severe groundwater depletion"
  },
  "Netherlands": {
    physicalRisk: "LOW",
    regulatoryRisk: "HIGH",
    financialRisk: "LOW",
    notes: "EU Water Framework Directive applies"
  },
  "Ireland": {
    physicalRisk: "LOW",
    regulatoryRisk: "MEDIUM",
    reputationalRisk: "HIGH",
    notes: "Data center moratoriums and community opposition to water use"
  },
  "Texas": {
    physicalRisk: "HIGH",
    regulatoryRisk: "LOW",
    financialRisk: "MEDIUM",
    notes: "Increasing drought conditions and groundwater depletion in some regions"
  },
  "Chile": {
    physicalRisk: "HIGH",
    regulatoryRisk: "HIGH",
    notes: "Mining regions face water scarcity and regulatory changes for groundwater"
  },
  "Australia": {
    physicalRisk: "HIGH",
    regulatoryRisk: "MEDIUM",
    financialRisk: "HIGH",
    notes: "Drought cycles common, high water prices in many regions"
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

Extract the following fields from the text. Be intelligent about inferring information:

1. industrySector: One of: "Manufacturing", "Food & Beverage", "Pharmaceuticals", "Semiconductors", "Mining", "Agriculture", "Energy", "Data Centers", "Textiles", "Chemicals", "Other"
   - "chip factory", "fab", "wafer" → Semiconductors
   - "data center", "server farm", "cloud" → Data Centers
   - "pharma", "drug", "medicine" → Pharmaceuticals

2. primaryLocationCountry: The country (e.g., "Taiwan", "United States", "Germany")

3. primaryLocationRegion: State/province/region (e.g., "Arizona", "Hsinchu", "Bavaria")

4. facilitiesCount: Number of facilities mentioned, default to 1

5. waterSources: Array from: "Municipal supply", "Groundwater", "Surface water", "Recycled/reclaimed", "Desalinated", "Rainwater"

6. waterDisruptions: true if ANY water issues mentioned (drought, scarcity, shortage, supply problems, restrictions)

7. currentTreatment: One of: "None", "Basic", "Advanced", "Zero Liquid Discharge"
   - If they mention recycling/reuse/advanced treatment → "Advanced"
   - If they mention ultrapure water → "Advanced"

8. intakeWaterQuality: One of: "Excellent", "Good", "Fair", "Poor", "Unknown"

9. companyName: Extract if mentioned, otherwise "Quick Scan Assessment"

10. estimatedWaterConsumption: Number in m³/year. Use industry benchmarks:
    - Semiconductors: 5,500,000 per fab
    - Data Centers: 1,500,000 per facility
    - Food & Beverage: 800,000 per facility
    - Pharmaceuticals: 500,000 per facility
    - Scale by facilities count mentioned

11. mentionedConcerns: Array of specific concerns mentioned (e.g., "drought", "community opposition", "PFAS", "regulations", "costs")

12. confidenceFields: Object indicating which fields were explicitly stated vs inferred
    - Format: { fieldName: "stated" | "inferred" }

Return ONLY valid JSON with these exact field names.`;

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
                    enum: ["Manufacturing", "Food & Beverage", "Pharmaceuticals", "Semiconductors", "Mining", "Agriculture", "Energy", "Data Centers", "Textiles", "Chemicals", "Other"]
                  },
                  primaryLocationCountry: { type: "string" },
                  primaryLocationRegion: { type: "string" },
                  facilitiesCount: { type: "number" },
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
                  estimatedWaterConsumption: { type: "number" },
                  mentionedConcerns: {
                    type: "array",
                    items: { type: "string" }
                  },
                  confidenceFields: {
                    type: "object",
                    additionalProperties: { type: "string" }
                  }
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

    // Get industry benchmark data
    const industry = extractedData.industrySector || "Other";
    const benchmark = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS["Other"];
    
    // Get regional risk factors
    const region = extractedData.primaryLocationRegion || extractedData.primaryLocationCountry || "";
    const regionalRisks = REGIONAL_RISK_FACTORS[region] || null;

    // Calculate estimated water consumption with facilities multiplier
    const facilitiesCount = extractedData.facilitiesCount || 1;
    const estimatedWater = extractedData.estimatedWaterConsumption || (benchmark.waterUseM3Year * facilitiesCount);

    // Build confidence indicators
    const confidenceFields = extractedData.confidenceFields || {};
    
    // Default confidence based on what's typically inferred
    const defaultConfidence: Record<string, string> = {
      industrySector: "stated",
      primaryLocationCountry: "stated",
      primaryLocationRegion: confidenceFields.primaryLocationRegion || "inferred",
      facilitiesCount: confidenceFields.facilitiesCount || "inferred",
      waterSources: confidenceFields.waterSources || "inferred",
      estimatedWaterConsumption: confidenceFields.estimatedWaterConsumption || "inferred",
      currentTreatment: confidenceFields.currentTreatment || "inferred",
      intakeWaterQuality: confidenceFields.intakeWaterQuality || "inferred"
    };

    const result = {
      // Core extracted data
      industrySector: extractedData.industrySector || "Other",
      primaryLocationCountry: extractedData.primaryLocationCountry || "Unknown",
      primaryLocationRegion: extractedData.primaryLocationRegion || "",
      facilitiesCount: facilitiesCount,
      waterSources: extractedData.waterSources?.length > 0 ? extractedData.waterSources : benchmark.waterSources,
      waterDisruptions: extractedData.waterDisruptions ?? false,
      currentTreatment: extractedData.currentTreatment || benchmark.currentTreatment,
      intakeWaterQuality: extractedData.intakeWaterQuality || benchmark.intakeWaterQuality,
      companyName: extractedData.companyName || "Quick Scan Assessment",
      estimatedWaterConsumption: estimatedWater,
      
      // Enhanced data
      mentionedConcerns: extractedData.mentionedConcerns || [],
      confidenceFields: { ...defaultConfidence, ...confidenceFields },
      
      // Industry benchmark context
      industryBenchmark: {
        waterUseM3Year: benchmark.waterUseM3Year,
        waterUsePerDay: benchmark.waterUsePerDay,
        typicalSources: benchmark.typicalSources,
        keyRisks: benchmark.keyRisks,
        description: benchmark.description
      },
      
      // Regional context
      regionalRiskFactors: regionalRisks,
      
      // Industry insights for display
      industryInsights: [
        benchmark.description,
        `Typical water consumption: ${benchmark.waterUsePerDay}`,
        `Key risk areas: ${benchmark.keyRisks.join(", ")}`
      ]
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
