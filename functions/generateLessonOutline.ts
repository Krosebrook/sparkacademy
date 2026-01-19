import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { topic, objectives, course_id } = await req.json();

    const objectivesContext = objectives ? `\n\nLearning Objectives:\n${objectives}` : '';

    const prompt = `Create a comprehensive lesson outline for: "${topic}"${objectivesContext}

Generate a detailed lesson structure including:
1. Lesson title and description
2. Clear learning objectives
3. Estimated duration
4. Section breakdown with key points
5. Suggested activities

Format:
{
  "title": "...",
  "description": "...",
  "estimated_duration": "45 minutes",
  "learning_objectives": ["...", "..."],
  "sections": [{
    "title": "...",
    "duration": "10 minutes",
    "description": "...",
    "key_points": ["...", "..."]
  }],
  "suggested_activities": ["...", "..."]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          estimated_duration: { type: "string" },
          learning_objectives: {
            type: "array",
            items: { type: "string" }
          },
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                duration: { type: "string" },
                description: { type: "string" },
                key_points: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          suggested_activities: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Lesson outline error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});