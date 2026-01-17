/**
 * Market Data Integration
 * Fetches real-time market data, company info, and deal signals
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query_type, company_name, ticker, filters } = await req.json();

    if (query_type === 'company_info') {
      // Use Perplexity for company research
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Research company ${company_name}. Provide recent funding, valuation, team, and market position.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            company_name: { type: "string" },
            recent_funding_round: { type: "string" },
            valuation: { type: "number" },
            team_size: { type: "number" },
            industry: { type: "string" },
            market_position: { type: "string" },
            recent_news: { type: "array", items: { type: "string" } }
          }
        }
      });
      return Response.json({ success: true, company_data: result });
    }

    if (query_type === 'market_trends') {
      // Research market trends
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `What are the current market trends in ${filters?.sector || 'technology'}? Focus on: growth areas, consolidation, regulatory changes, emerging opportunities.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            sector: { type: "string" },
            growth_areas: { type: "array", items: { type: "string" } },
            consolidation_trends: { type: "array", items: { type: "string" } },
            regulatory_impacts: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } }
          }
        }
      });
      return Response.json({ success: true, trends: result });
    }

    return Response.json({ error: 'Invalid query_type' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});