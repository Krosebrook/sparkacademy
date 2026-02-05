import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, duration_minutes, learning_objectives } = await req.json();

    const prompt = `Create a detailed lesson plan for:
Topic: ${topic}
Duration: ${duration_minutes} minutes
Learning Objectives: ${learning_objectives?.join(', ') || 'Not specified'}

Generate a comprehensive lesson plan with:
- Introduction (5-10 min)
- Main content sections with timing
- Activities and engagement points
- Assessment checkpoints
- Conclusion and next steps

Format as JSON with clear structure.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          duration_minutes: { type: "number" },
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                duration_minutes: { type: "number" },
                content: { type: "string" },
                activities: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          assessment_methods: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Lesson plan generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});