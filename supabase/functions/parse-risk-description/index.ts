import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const quickScanSystemPrompt = `You are Laguna's Water Risk Assessment AI. Your job is to analyze a user's description of their industrial operation and generate a comprehensive water risk assessment.

## YOUR TASK

1. EXTRACT structured information from the user's description
2. FILL GAPS using industry benchmarks when information is missing
3. SCORE all 5 risk categories (0-100)
4. PROVIDE specific, actionable recommendations
5. LINK recommendations to real project examples

## INFORMATION TO EXTRACT

From the user's description, identify:
- Industry/Sector
- Location (country, region, city)
- Number of facilities
- Water sources (municipal, groundwater, surface water, recycled)
- Approximate water consumption
- Current water treatment/recycling practices
- Any specific concerns mentioned
- Any past water issues mentioned

## INDUSTRY BENCHMARKS (use when user doesn't specify)

| Industry | Water Use (m³/year/facility) | Typical Sources | Key Risks |
|----------|------------------------------|-----------------|-----------|
| Semiconductors | 5,500,000 | Municipal, Groundwater | Physical, Financial, Regulatory |
| Data Centers | 1,500,000 | Municipal | Physical, Reputational, Financial |
| Food & Beverage | 800,000 | Municipal, Groundwater, Surface | Physical, Regulatory, Reputational |
| Pharmaceuticals | 500,000 | Municipal (purified) | Regulatory, Water Quality, Financial |
| Chemicals | 2,000,000 | Surface, Municipal, Recycled | Regulatory, Reputational, Physical |
| Mining | 4,000,000 | Groundwater, Surface | Physical, Governance, Reputational |
| Textiles | 1,000,000 | Municipal, Groundwater | Regulatory, Reputational, Physical |
| Oil & Gas | 3,000,000 | Groundwater, Surface, Recycled | Regulatory, Reputational, Governance |
| Pulp & Paper | 2,500,000 | Surface, Municipal | Regulatory, Physical, Financial |
| Automotive | 600,000 | Municipal | Regulatory, Financial, Physical |

## REGIONAL RISK MODIFIERS

Apply these modifiers based on location:

**HIGH WATER STRESS REGIONS:**
- Arizona, Nevada, California (USA): +20 physical, +15 financial, +15 governance
- Taiwan: +25 physical, +10 regulatory (drought history, semiconductor priority)
- India (most regions): +20 physical, +20 governance, +15 reputational
- Middle East: +30 physical, +10 financial
- South Africa: +20 physical, +15 governance
- Spain, Southern Europe: +15 physical, +10 regulatory
- Northern China: +20 physical, +15 governance

**HIGH REGULATORY REGIONS:**
- EU countries: +15 regulatory (Water Framework Directive, CSRD)
- California: +20 regulatory
- New Jersey: +15 regulatory (strict environmental laws)
- Singapore: +10 regulatory, +20 financial (high water prices)

**HIGH REPUTATIONAL RISK (recent news/opposition):**
- Ireland (data centers): +20 reputational
- Virginia (data centers): +15 reputational
- Netherlands (data centers): +15 reputational
- Chile (mining): +20 reputational

**GOVERNANCE COMPLEXITY:**
- US Southwest: +20 governance (Colorado River, tribal rights)
- India: +20 governance (interstate disputes)
- Central Asia: +15 governance (transboundary rivers)
- Africa (most): +15 governance

## THE 5 RISK CATEGORIES

Score each 0-100:

### 1. PHYSICAL RISK (Water scarcity, flooding, quality)
Factors:
- Regional water stress level (use WRI Aqueduct data conceptually)
- Drought frequency and severity
- Flood risk (coastal, riverine, typhoon)
- Groundwater depletion trends
- Climate change projections

Score guide:
- 0-30: Low risk (water-abundant region, stable supply)
- 31-60: Medium risk (some seasonal stress, manageable)
- 61-100: High risk (water-scarce, drought-prone, or flood-prone)

### 2. REGULATORY RISK (Permits, compliance, discharge limits)
Factors:
- Strictness of local water regulations
- Discharge permit requirements
- Upcoming regulatory changes (PFAS, EU directives)
- Compliance history if mentioned
- Industry-specific regulations

Score guide:
- 0-30: Low risk (stable, clear regulations)
- 31-60: Medium risk (some compliance requirements)
- 61-100: High risk (strict/changing regulations, PFAS exposure, EU CSRD)

### 3. REPUTATIONAL RISK (Community, NGO, media)
Factors:
- Local community water concerns
- History of opposition to similar facilities
- NGO activity in region
- Media coverage of water issues
- Industry reputation for water use

Score guide:
- 0-30: Low risk (no known opposition)
- 31-60: Medium risk (some local concerns)
- 61-100: High risk (active opposition, negative media, community conflicts)

### 4. GOVERNANCE RISK (Water rights, jurisdiction)
Factors:
- Clarity of water rights
- Number of agencies involved
- Interstate/international water agreements
- Indigenous/tribal water claims
- Political stability of water policy

Score guide:
- 0-30: Low risk (clear rights, single jurisdiction)
- 31-60: Medium risk (some complexity)
- 61-100: High risk (disputed rights, multiple jurisdictions, tribal claims)

### 5. FINANCIAL RISK (Water costs, price volatility)
Factors:
- Current water prices
- Price trend (rising/stable)
- Exposure to tariff changes
- Cost of water relative to operations
- Infrastructure investment requirements

Score guide:
- 0-30: Low risk (stable, affordable water)
- 31-60: Medium risk (moderate costs, some increases)
- 61-100: High risk (expensive water, rising costs, major investment needed)

## RESPONSE FORMAT

You MUST respond in valid JSON format:

{
  "extracted_data": {
    "industry": "string",
    "location": {
      "country": "string",
      "region": "string",
      "city": "string or null"
    },
    "facilities_count": number or null,
    "water_sources": ["array of strings"],
    "water_consumption_m3_year": number,
    "water_consumption_source": "stated" or "estimated",
    "current_practices": ["array of strings"] or [],
    "mentioned_concerns": ["array of strings"] or [],
    "confidence": "high" or "medium" or "low"
  },
  "risk_scores": {
    "overall": number,
    "physical": {
      "score": number,
      "level": "Low Risk" or "Medium Risk" or "High Risk",
      "factors": ["array of 2-3 key factors"]
    },
    "regulatory": {
      "score": number,
      "level": "Low Risk" or "Medium Risk" or "High Risk",
      "factors": ["array of 2-3 key factors"]
    },
    "reputational": {
      "score": number,
      "level": "Low Risk" or "Medium Risk" or "High Risk",
      "factors": ["array of 2-3 key factors"]
    },
    "governance": {
      "score": number,
      "level": "Low Risk" or "Medium Risk" or "High Risk",
      "factors": ["array of 2-3 key factors"]
    },
    "financial": {
      "score": number,
      "level": "Low Risk" or "Medium Risk" or "High Risk",
      "factors": ["array of 2-3 key factors"]
    }
  },
  "top_risks": [
    {
      "category": "string",
      "score": number,
      "headline": "string (one sentence summary)",
      "detail": "string (2-3 sentences explanation)"
    }
  ],
  "recommendations": [
    {
      "title": "string",
      "priority": "HIGH" or "MEDIUM" or "LOW",
      "description": "string",
      "expected_impact": "string",
      "example_project": "string (name of similar project from database)" or null
    }
  ],
  "industry_insights": [
    "string (relevant fact about this industry's water use)",
    "string (relevant fact about this region)",
    "string (relevant benchmark or comparison)"
  ],
  "news_keywords": ["array of keywords for filtering relevant news articles"]
}

## IMPORTANT RULES

1. Always respond in valid JSON - no markdown, no explanation outside JSON
2. Be specific to the industry and region - don't give generic advice
3. If information is missing, estimate using benchmarks and mark as "estimated"
4. Prioritize the top 2-3 risks - don't treat all risks equally
5. Link recommendations to real projects when relevant (TSMC, Carlsberg, Nestlé, Intel, Microsoft, Samsung, Coca-Cola, etc.)
6. Include specific numbers and facts, not vague statements
7. The news_keywords should help filter relevant reputational risk articles
8. Keep recommendations actionable and specific to their situation`;

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: quickScanSystemPrompt },
          { role: "user", content: description }
        ],
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

    let parsedResult;
    
    // Extract JSON from response
    if (aiResponse.choices?.[0]?.message?.content) {
      const content = aiResponse.choices[0].message.content;
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      }
    }

    if (!parsedResult) {
      throw new Error('Failed to extract data from AI response');
    }

    console.log('Parsed result:', parsedResult);

    // Transform the AI response to match the expected frontend format
    const extractedData = parsedResult.extracted_data || {};
    const riskScores = parsedResult.risk_scores || {};
    
    const result = {
      // Core extracted data
      industrySector: extractedData.industry || "Other",
      primaryLocationCountry: extractedData.location?.country || "Unknown",
      primaryLocationRegion: extractedData.location?.region || "",
      facilitiesCount: extractedData.facilities_count || 1,
      waterSources: extractedData.water_sources?.length > 0 ? extractedData.water_sources : ["Municipal supply"],
      waterDisruptions: extractedData.mentioned_concerns?.some((c: string) => 
        c.toLowerCase().includes('drought') || 
        c.toLowerCase().includes('scarcity') || 
        c.toLowerCase().includes('shortage')
      ) ?? false,
      currentTreatment: extractedData.current_practices?.length > 0 ? "Advanced" : "Basic",
      intakeWaterQuality: "Good",
      companyName: "Quick Scan Assessment",
      estimatedWaterConsumption: extractedData.water_consumption_m3_year || 1000000,
      
      // Enhanced data from new prompt
      mentionedConcerns: extractedData.mentioned_concerns || [],
      confidenceFields: {
        industrySector: "stated",
        primaryLocationCountry: "stated",
        primaryLocationRegion: extractedData.location?.region ? "stated" : "inferred",
        facilitiesCount: extractedData.facilities_count ? "stated" : "inferred",
        waterSources: extractedData.water_sources?.length > 0 ? "stated" : "inferred",
        estimatedWaterConsumption: extractedData.water_consumption_source || "inferred",
        currentTreatment: extractedData.current_practices?.length > 0 ? "stated" : "inferred",
        intakeWaterQuality: "inferred"
      },
      
      // Risk scores from AI
      riskScores: {
        overall: riskScores.overall || 50,
        physical: riskScores.physical || { score: 50, level: "Medium Risk", factors: [] },
        regulatory: riskScores.regulatory || { score: 50, level: "Medium Risk", factors: [] },
        reputational: riskScores.reputational || { score: 50, level: "Medium Risk", factors: [] },
        governance: riskScores.governance || { score: 50, level: "Medium Risk", factors: [] },
        financial: riskScores.financial || { score: 50, level: "Medium Risk", factors: [] }
      },
      
      // Top risks
      topRisks: parsedResult.top_risks || [],
      
      // Recommendations with project links
      recommendations: parsedResult.recommendations || [],
      
      // Industry insights for display
      industryInsights: parsedResult.industry_insights || [],
      
      // News keywords for filtering reputational risk articles
      newsKeywords: parsedResult.news_keywords || [],
      
      // Industry benchmark context
      industryBenchmark: {
        waterUseM3Year: extractedData.water_consumption_m3_year || 1000000,
        waterUsePerDay: "Varies by facility",
        typicalSources: extractedData.water_sources || ["Municipal"],
        keyRisks: parsedResult.top_risks?.map((r: any) => r.category) || ["Physical", "Financial"],
        description: parsedResult.industry_insights?.[0] || ""
      },
      
      // Regional context
      regionalRiskFactors: {
        notes: parsedResult.industry_insights?.[1] || ""
      }
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
