import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email } = await req.json();

    const userEnrollments = await base44.entities.Enrollment?.filter({ 
      student_email: user_email 
    }).catch(() => []);

    const allEnrollments = await base44.asServiceRole.entities.Enrollment?.list(null, 50).catch(() => []);

    const prompt = `Find compatible study partners for this user:

User's courses: ${userEnrollments.map(e => e.course_id).join(', ')}
Other students: ${allEnrollments.filter(e => e.student_email !== user_email).length}

Suggest 3-5 study partners with:
- Name and brief bio
- Match score (0-100)
- Shared interests count
- Common learning goals

Format as JSON:
{
  "suggested_partners": [
    {
      "name": "...",
      "bio": "...",
      "match_score": 0-100,
      "shared_interests": 0,
      "common_goals": ["..."]
    }
  ]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          suggested_partners: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                bio: { type: "string" },
                match_score: { type: "number" },
                shared_interests: { type: "number" },
                common_goals: {
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
    console.error('Match error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});