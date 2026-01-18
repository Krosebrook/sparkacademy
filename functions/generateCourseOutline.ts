import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, target_audience } = await req.json();

    const prompt = `Create a comprehensive course outline for:
Topic: ${topic}
Target Audience: ${target_audience}

Generate a structured outline with:
- Course title and description
- 4-6 modules, each with 3-5 lessons
- Clear learning objectives

Format as JSON:
{
  "title": "...",
  "description": "...",
  "modules": [
    {"title": "...", "lessons": ["...", "..."]}
  ]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          modules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                lessons: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Outline generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});