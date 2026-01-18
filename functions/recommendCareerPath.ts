import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email } = await req.json();

    const enrollments = await base44.entities.Enrollment?.filter({ 
      student_email: user_email 
    }).catch(() => []);

    const completedCourses = enrollments.filter(e => e.status === 'completed');

    const prompt = `Based on this learning profile, recommend career paths:

Completed courses: ${completedCourses.length}
Average quiz score: ${enrollments.reduce((sum, e) => sum + (e.quiz_scores_avg || 0), 0) / (enrollments.length || 1)}%

Recommend 2-3 career paths with:
- Title and description
- Match score (0-100)
- Required skills list
- Next courses to take

Format as JSON:
{
  "paths": [
    {
      "title": "...",
      "description": "...",
      "match_score": 0-100,
      "required_skills": ["..."]
    }
  ],
  "next_courses": ["..."]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          paths: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                match_score: { type: "number" },
                required_skills: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          next_courses: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Career path error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});