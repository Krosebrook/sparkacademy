import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { user_email, course_id } = await req.json();
    const enrollments = await base44.entities.Enrollment?.filter({ student_email: user_email }).catch(() => []);

    const prompt = `Suggest relevant discussions and resources for this user:

User's courses: ${enrollments.map(e => e.course_id).join(', ')}
Current course: ${course_id}

Suggest 3-5 discussions and 2-3 resources with relevance scores.

Format:
{
  "discussions": [{
    "title": "...",
    "snippet": "...",
    "relevance_score": 0-100,
    "replies": 0
  }],
  "resources": [{
    "title": "...",
    "description": "...",
    "type": "..."
  }]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          discussions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                snippet: { type: "string" },
                relevance_score: { type: "number" },
                replies: { type: "number" }
              }
            }
          },
          resources: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                type: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Content suggestion error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});