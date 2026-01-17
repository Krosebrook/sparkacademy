/**
 * Portfolio Performance Analytics
 * Calculate returns, diversification, risk metrics
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Fetch user investments
    const investments = await base44.entities.Investment?.filter({
      investor_email: user.email
    }).catch(() => []);

    // Calculate metrics
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this portfolio for an investor:
      Investments: ${JSON.stringify(investments)}
      
      Provide:
      1. Current valuation
      2. Total return
      3. Diversification index
      4. Risk assessment
      5. Sector allocation
      6. Recommendations`,
      response_json_schema: {
        type: "object",
        properties: {
          total_value: { type: "number" },
          total_return_percent: { type: "number" },
          diversification_score: { type: "number" },
          risk_level: { type: "string" },
          sector_breakdown: { type: "object" },
          recommendations: { type: "array", items: { type: "string" } }
        }
      }
    });

    return Response.json({ success: true, analysis });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});