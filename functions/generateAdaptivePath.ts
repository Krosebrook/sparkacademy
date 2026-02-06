import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, performanceData, learningPreferences } = await req.json();

    // Fetch user's learning history and skill gaps
    const profile = await base44.entities.EmployeeProfile.filter({ employee_email: user.email });
    const completedCourses = profile[0]?.completed_courses || [];
    const skillGaps = profile[0]?.skill_gaps || [];
    const learningStyle = profile[0]?.learning_preferences?.learning_style || 'mixed';

    // Generate adaptive path using AI
    const prompt = `Generate an adaptive learning path for this user:

Learning Style: ${learningStyle}
Skill Gaps: ${skillGaps.join(', ')}
Completed Courses: ${completedCourses.length} courses
Performance Data: ${JSON.stringify(performanceData)}
Preferences: ${JSON.stringify(learningPreferences)}

Create a personalized learning path with:
1. Next 3-5 recommended courses (in order)
2. Estimated difficulty level for each
3. Why each course is recommended
4. Expected learning outcomes
5. Adaptive milestones and checkpoints`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          path: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                course_title: { type: 'string' },
                difficulty: { type: 'string' },
                reason: { type: 'string' },
                outcomes: { type: 'array', items: { type: 'string' } },
                estimated_hours: { type: 'number' },
                priority: { type: 'string' }
              }
            }
          },
          milestones: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                week: { type: 'number' },
                checkpoint: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return Response.json({
      adaptivePath: response.path,
      milestones: response.milestones,
      personalizedFor: user.email,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});