import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email, course_id } = await req.json();

    const enrollments = await base44.entities.Enrollment?.filter({ 
      student_email: user_email,
      course_id 
    }).catch(() => []);

    const prompt = `Analyze this student's performance and identify weak spots:

Enrollments: ${enrollments.length}
Quiz scores: ${enrollments.map(e => e.quiz_scores_avg || 0).join(', ')}
Lessons completed: ${enrollments.map(e => e.lessons_completed || 0).join(', ')}

Identify 2-3 weak areas with:
- Topic name
- Reason (based on quiz scores/engagement)
- Mastery level (0-100)
- Specific recommendations

Format as JSON:
{
  "weak_areas": [
    {
      "topic": "...",
      "reason": "...",
      "mastery_level": 0-100,
      "recommendations": ["...", "..."]
    }
  ]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          weak_areas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                topic: { type: "string" },
                reason: { type: "string" },
                mastery_level: { type: "number" },
                recommendations: {
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
    console.error('Weak spot analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});