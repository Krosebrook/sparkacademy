import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { completed_courses, in_progress_courses, avg_quiz_score } = await req.json();

    const analysisPrompt = `Analyze this learner's skills and recommend next courses:

Completed Courses: ${completed_courses.length}
In Progress: ${in_progress_courses.length}
Average Quiz Score: ${avg_quiz_score}%

Based on this data, provide:
1. Current skill levels (0-100) for 3-5 key skills
2. Top 3 recommended courses with reasons
3. Knowledge gaps to address

Format as JSON with this structure:
{
  "current_skills": [{"skill_name": "...", "level": 0-100}],
  "recommendations": [{"course_title": "...", "reason": "...", "priority": "high/medium", "fills_gap": true/false, "estimated_hours": 0}],
  "knowledge_gaps": ["..."]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          current_skills: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill_name: { type: "string" },
                level: { type: "number" }
              }
            }
          },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                course_title: { type: "string" },
                reason: { type: "string" },
                priority: { type: "string" },
                fills_gap: { type: "boolean" },
                estimated_hours: { type: "number" }
              }
            }
          },
          knowledge_gaps: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Skill analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});