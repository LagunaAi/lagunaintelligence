import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch relevant projects based on query
    const { data: projects } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        technology_type,
        sector,
        region,
        country,
        description,
        financials (
          total_investment_usd,
          roi_percent,
          payback_years
        ),
        outcomes (
          water_saved_m3_year,
          water_produced_m3_day,
          population_served
        )
      `)
      .limit(10);

    // Build system prompt with database context
    let systemPrompt = `You are Laguna AI, an expert water investment advisor. You have access to a verified database of water infrastructure projects with real outcomes data.

Your role is to:
1. Answer questions about water investments, technologies, and ROI
2. Cite specific projects from the database when relevant
3. Provide data-driven recommendations based on sector, region, and technology type
4. Explain financial metrics like ROI, payback period, and NPV in context
5. Discuss regulatory trends (PFAS, discharge limits, etc.)

Available projects in database:
${projects?.map(p => `
- ${p.name} (${p.technology_type}, ${p.sector}, ${p.region})
  Investment: $${p.financials?.[0]?.total_investment_usd?.toLocaleString() || 'N/A'}
  ROI: ${p.financials?.[0]?.roi_percent || 'N/A'}%
  Payback: ${p.financials?.[0]?.payback_years || 'N/A'} years
`).join('\n') || 'No projects available'}`;

    if (userContext) {
      systemPrompt += `\n\nUser Context:\n- Industry: ${userContext.industry}\n- Location: ${userContext.location}\n- Water Risk Score: ${userContext.riskScore}/100`;
    }

    systemPrompt += `\n\nAlways cite specific project names and data when making recommendations. Be concise and actionable.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI usage limit reached. Please contact support.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});