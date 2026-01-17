/**
 * Deal Flow Aggregation
 * Aggregates deals from multiple sources based on user criteria
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const { user_profile_id } = await req.json();

    // Fetch user preferences
    const profile = await base44.entities.UserProfile?.filter({
      user_email: user.email
    }).catch(() => []);

    if (!profile.length) {
      return Response.json({ error: 'User profile not configured' }, { status: 400 });
    }

    const preferences = profile[0];
    const criteria = preferences.deal_sourcing_criteria;

    // Aggregate deal opportunities
    const deals = await base44.integrations.Core.InvokeLLM({
      prompt: `Find investment opportunities matching these criteria:
      - Industries: ${criteria.target_industries?.join(', ')}
      - Size: $${criteria.investment_size_min} - $${criteria.investment_size_max}
      - Structures: ${criteria.preferred_deal_structures?.join(', ')}
      - Regions: ${criteria.geographic_preferences?.join(', ')}
      - Risk: ${criteria.risk_tolerance}
      
      Return recent deals and opportunities from: AngelList, Pitchbook, Crunchbase, LinkedIn.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          deals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                company_name: { type: "string" },
                round: { type: "string" },
                amount: { type: "number" },
                industry: { type: "string" },
                stage: { type: "string" },
                source: { type: "string" },
                match_score: { type: "number" },
                url: { type: "string" }
              }
            }
          },
          total_count: { type: "number" }
        }
      }
    });

    // Cache deals in Redis if available
    const cacheKey = `deals_${user.email}`;
    if (Deno.env.get('UPSTASH_REDIS_REST_API_TOKEN')) {
      try {
        await fetch(`${Deno.env.get('REDIS_UPSTASH_URL')}/set/${cacheKey}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('UPSTASH_REDIS_REST_API_TOKEN')}`
          },
          body: JSON.stringify(deals)
        });
      } catch (e) {
        console.log('Redis cache write failed');
      }
    }

    return Response.json({ success: true, deals });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});