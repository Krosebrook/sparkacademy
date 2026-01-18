import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { course_id } = await req.json();
    const discussions = await base44.asServiceRole.entities.CourseDiscussion?.filter({ course_id }).catch(() => []);

    const prompt = `Identify expert users in this course community:

Discussions: ${discussions.length}
Active users: ${[...new Set(discussions.map(d => d.user_email))].length}

Identify 3-5 experts based on:
- Helpful answers
- Expertise areas
- Reputation/engagement

Format:
{
  "experts": [{
    "name": "...",
    "expertise_area": "...",
    "helpful_answers": 0,
    "reputation_score": 0,
    "reason": "..."
  }]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          experts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                expertise_area: { type: "string" },
                helpful_answers: { type: "number" },
                reputation_score: { type: "number" },
                reason: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Expert identification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});