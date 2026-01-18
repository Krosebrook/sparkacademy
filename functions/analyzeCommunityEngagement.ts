import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { course_id } = await req.json();
    const discussions = await base44.asServiceRole.entities.CourseDiscussion?.filter({ course_id }).catch(() => []);

    const prompt = `Analyze community engagement and sentiment:

Total discussions: ${discussions.length}
Recent discussions: ${discussions.slice(0, 20).map(d => d.message).join('\n')}

Provide:
- Active members count
- Total discussions
- Engagement trend (%)
- Overall sentiment (positive/neutral/negative)
- Sentiment reason
- Top 5 topics

Format:
{
  "active_members": 0,
  "total_discussions": 0,
  "engagement_trend": 0,
  "sentiment": "positive/neutral/negative",
  "sentiment_reason": "...",
  "top_topics": ["..."]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          active_members: { type: "number" },
          total_discussions: { type: "number" },
          engagement_trend: { type: "number" },
          sentiment: { type: "string" },
          sentiment_reason: { type: "string" },
          top_topics: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});