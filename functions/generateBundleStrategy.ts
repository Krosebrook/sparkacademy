import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { courses } = await req.json();

    const prompt = `Analyze these courses and create optimal bundle strategies:

${courses.map((c, i) => `${i + 1}. ${c.title} (Level: ${c.level || 'N/A'}, Category: ${c.category || 'N/A'}, Price: $${c.price || 0})`).join('\n')}

Generate 3-5 bundle strategies considering:
1. Thematic bundles (related topics)
2. Skill path packages (beginner to advanced)
3. Career-focused bundles (job-ready skills)
4. Complementary skill bundles

For each bundle provide:
- Bundle name (compelling, benefit-focused)
- Bundle type (thematic/skill_path/career/complementary)
- Included course IDs
- Included course titles
- Bundle price (with strategic discount)
- Individual total price
- Savings amount
- 3 pricing tiers (basic/pro/elite) with features
- Compelling marketing copy (100-150 words, conversion-focused)
- Target audience description

Ensure bundles create genuine value and strategic pricing that maximizes revenue while remaining attractive.`;

    const schema = {
      type: "object",
      properties: {
        bundles: {
          type: "array",
          items: {
            type: "object",
            properties: {
              bundle_id: { type: "string" },
              bundle_name: { type: "string" },
              bundle_type: { type: "string" },
              course_ids: { type: "array", items: { type: "string" } },
              course_titles: { type: "array", items: { type: "string" } },
              bundle_price: { type: "number" },
              individual_total: { type: "number" },
              savings: { type: "number" },
              pricing_tiers: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    tier_name: { type: "string" },
                    price: { type: "number" },
                    features: { type: "array", items: { type: "string" } }
                  }
                }
              },
              marketing_copy: { type: "string" },
              target_audience: { type: "string" }
            }
          }
        },
        insights: {
          type: "array",
          items: { type: "string" }
        }
      }
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    return Response.json(result);
  } catch (error) {
    console.error('Bundle strategy error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});