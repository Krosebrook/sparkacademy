import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { course_id, lesson_title } = await req.json();

    const prompt = `Create a realistic scenario for students learning: ${lesson_title}

Generate a practical, real-world scenario where they must apply what they learned.

Format as JSON:
{
  "scenario": "Detailed scenario description (2-3 sentences)",
  "task": "Specific task they need to complete"
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          scenario: { type: "string" },
          task: { type: "string" }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Scenario generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});