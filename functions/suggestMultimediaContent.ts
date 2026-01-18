import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { lesson_topic } = await req.json();

    const prompt = `Suggest multimedia content ideas for: ${lesson_topic}

Generate:
- 2-3 video ideas with titles, descriptions, duration
- 1-2 interactive simulations
- 3-5 visual aids

Format:
{
  "video_ideas": [{
    "title": "...",
    "description": "...",
    "duration": "..."
  }],
  "interactive_simulations": [{
    "title": "...",
    "description": "..."
  }],
  "visual_aids": ["..."]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          video_ideas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                duration: { type: "string" }
              }
            }
          },
          interactive_simulations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          visual_aids: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Multimedia suggestion error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});