import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { course_id } = await req.json();

    const { data: analytics } = await base44.asServiceRole.functions.invoke('analyzeCoursePerformance', {
      course_id
    });

    const prompt = `Generate an instructor report based on this course analytics:

Total Students: ${analytics.total_students}
Average Engagement: ${analytics.avg_engagement}%
Completion Rate: ${analytics.completion_rate}%
At-Risk Students: ${analytics.at_risk_count}

Topic Performance:
${JSON.stringify(analytics.topic_performance, null, 2)}

Provide:
1. Executive summary
2. Key insights (3-5 bullet points)
3. Actionable recommendations (3-5 bullet points)`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          insights: {
            type: "array",
            items: { type: "string" }
          },
          recommendations: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Report generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});