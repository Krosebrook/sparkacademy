/**
 * Compliance & Due Diligence
 * SEC filings, regulatory checks, background verification
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { company_name, check_type } = await req.json();

    if (check_type === 'sec_filings') {
      const filings = await base44.integrations.Core.InvokeLLM({
        prompt: `Find recent SEC filings for ${company_name}. Include 10-K, 10-Q, S-1 if available.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            company: { type: "string" },
            cik: { type: "string" },
            filings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  filing_type: { type: "string" },
                  date: { type: "string" },
                  url: { type: "string" }
                }
              }
            }
          }
        }
      });
      return Response.json({ success: true, filings });
    }

    if (check_type === 'regulatory') {
      const regulatory = await base44.integrations.Core.InvokeLLM({
        prompt: `Check regulatory status and compliance history for ${company_name}. Include any investigations, violations, or regulatory issues.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            regulatory_status: { type: "string" },
            compliance_rating: { type: "string" },
            issues: { type: "array", items: { type: "string" } },
            risk_level: { type: "string" }
          }
        }
      });
      return Response.json({ success: true, regulatory });
    }

    return Response.json({ error: 'Invalid check_type' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});