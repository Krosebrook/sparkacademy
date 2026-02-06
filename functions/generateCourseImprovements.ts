import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, analyticsData } = await req.json();

    const prompt = `Based on these course analytics, provide detailed improvement suggestions:

Analytics:
- Average Completion Rate: ${analyticsData.completionRate}%
- Average Quiz Score: ${analyticsData.avgQuizScore}%
- Video Watch Time: ${analyticsData.videoWatchTime} minutes
- Forum Participation: ${analyticsData.forumPosts} posts
- Students Struggling: ${analyticsData.strugglingStudents}
- Drop-off Points: ${JSON.stringify(analyticsData.dropoffPoints)}

Generate:
1. Content improvements (specific lessons to enhance)
2. Structure changes (pacing, ordering)
3. Engagement strategies
4. Assessment improvements
5. Support resources needed`;

    const improvements = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          content_improvements: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                lesson_id: { type: 'string' },
                issue: { type: 'string' },
                suggestion: { type: 'string' },
                priority: { type: 'string' }
              }
            }
          },
          structure_changes: {
            type: 'array',
            items: { type: 'string' }
          },
          engagement_strategies: {
            type: 'array',
            items: { type: 'string' }
          },
          assessment_improvements: {
            type: 'array',
            items: { type: 'string' }
          },
          support_resources: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    return Response.json({ improvements });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});