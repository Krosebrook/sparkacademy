import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { new_asset, existing_assets } = await req.json();

    const prompt = `You are an AI content curator analyzing educational materials to find connections and relationships.

NEW ASSET:
Type: ${new_asset.asset_type}
Topics: ${new_asset.ai_metadata?.topics?.join(', ')}
Difficulty: ${new_asset.ai_metadata?.difficulty_level}
Domain: ${new_asset.ai_metadata?.domain}
Key Concepts: ${new_asset.ai_metadata?.key_concepts?.join(', ')}

EXISTING ASSETS:
${existing_assets.map((asset, idx) => `
Asset ${idx + 1}:
- ID: ${asset.id}
- Type: ${asset.asset_type}
- Topics: ${asset.ai_metadata?.topics?.join(', ')}
- Difficulty: ${asset.ai_metadata?.difficulty_level}
- Domain: ${asset.ai_metadata?.domain}
`).join('\n')}

Identify connections between the new asset and existing assets. For each connection, provide:
1. Asset ID
2. Connection type (prerequisite, related, follow-up, complementary, example, practice)
3. Relevance score (0-100)
4. Explanation of the connection

Focus on pedagogically meaningful connections that would help instructors build cohesive learning experiences.`;

    const schema = {
      type: "object",
      properties: {
        connections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              asset_id: { type: "string" },
              connection_type: {
                type: "string",
                enum: ["prerequisite", "related", "follow-up", "complementary", "example", "practice"]
              },
              relevance_score: { type: "number" },
              explanation: { type: "string" }
            }
          }
        },
        suggested_learning_sequences: {
          type: "array",
          items: {
            type: "object",
            properties: {
              sequence_name: { type: "string" },
              asset_order: { type: "array", items: { type: "string" } },
              rationale: { type: "string" }
            }
          }
        }
      }
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    return Response.json(result);
  } catch (error) {
    console.error('Connection suggestion error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});