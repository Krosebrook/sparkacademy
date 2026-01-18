import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { course_title, level, total_hours } = await req.json();

    const prompt = `Suggest monetization strategy for:

Course: ${course_title}
Level: ${level}
Duration: ${total_hours} hours

Provide:
- Recommended price
- Price range
- Pricing rationale
- 2-3 premium tiers with features
- Marketing tips

Format:
{
  "recommended_price": 0,
  "price_range": "...",
  "pricing_rationale": "...",
  "premium_tiers": [{
    "name": "...",
    "price": 0,
    "features": ["..."]
  }],
  "marketing_tips": ["..."]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommended_price: { type: "number" },
          price_range: { type: "string" },
          pricing_rationale: { type: "string" },
          premium_tiers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                price: { type: "number" },
                features: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          marketing_tips: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Monetization error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});