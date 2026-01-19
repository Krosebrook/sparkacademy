import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { course_id } = await req.json();

    const [enrollment, course, recentChallenges] = await Promise.all([
      base44.asServiceRole.entities.Enrollment.filter({
        course_id,
        student_email: user.email
      }).then(e => e[0]),
      base44.asServiceRole.entities.Course.get(course_id),
      base44.asServiceRole.entities.DailyChallenge.filter({
        student_email: user.email,
        course_id
      }, '-created_date', 5)
    ]);

    const prompt = `Generate a personalized learning challenge for this student:

Course: ${course?.title}
Progress: ${enrollment?.completion_percentage || 0}%
Recent Challenges: ${recentChallenges.map(c => c.title).join(', ')}

Create a unique, engaging challenge that:
- Matches their current skill level
- Encourages practice and mastery
- Is achievable in one session
- Provides clear value

Format:
{
  "title": "...",
  "description": "...",
  "points": 50-200,
  "difficulty": "easy/medium/hard"
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          points: { type: "number" },
          difficulty: { type: "string" }
        }
      }
    });

    await base44.asServiceRole.entities.DailyChallenge.create({
      student_email: user.email,
      course_id,
      title: result.title,
      description: result.description,
      points: result.points,
      difficulty: result.difficulty,
      status: 'active'
    });

    return Response.json(result);
  } catch (error) {
    console.error('Challenge generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});