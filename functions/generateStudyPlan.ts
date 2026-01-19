import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { course_id } = await req.json();

    const userProfile = await base44.asServiceRole.entities.User.get(user.email);
    const learningGoal = userProfile?.learning_goal || 'Complete the course efficiently';
    
    const course = await base44.asServiceRole.entities.Course.get(course_id);

    const prompt = `Create a personalized study plan with spaced repetition:

Learning Goal: ${learningGoal}
Course: ${course?.title || 'Course'}

Generate:
- Goal summary
- 4-8 week schedule with topics and hours/week
- Spaced repetition review schedule

Format:
{
  "goal_summary": "...",
  "weekly_schedule": [{
    "week_number": 0,
    "hours_per_week": 0,
    "topics": ["..."],
    "spaced_repetition": ["..."]
  }]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          goal_summary: { type: "string" },
          weekly_schedule: {
            type: "array",
            items: {
              type: "object",
              properties: {
                week_number: { type: "number" },
                hours_per_week: { type: "number" },
                topics: {
                  type: "array",
                  items: { type: "string" }
                },
                spaced_repetition: {
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
    console.error('Study plan error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});