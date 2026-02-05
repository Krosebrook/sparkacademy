import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { metrics_data, organization_id } = await req.json();

    const prompt = `Analyze this learning analytics data and generate actionable insights:

Metrics:
${JSON.stringify(metrics_data, null, 2)}

Identify:
1. Significant trends (positive or negative)
2. Anomalies or unusual patterns
3. Predictive indicators for future performance
4. Specific recommendations for improvement

Focus on actionable insights that can drive decision-making.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["trend", "anomaly", "prediction", "recommendation"]
                },
                title: { type: "string" },
                description: { type: "string" },
                severity: {
                  type: "string",
                  enum: ["low", "medium", "high", "critical"]
                },
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

    // Store insights in database
    for (const insight of result.insights) {
      await base44.asServiceRole.entities.AnalyticsInsight.create({
        organization_id,
        insight_type: insight.type,
        title: insight.title,
        description: insight.description,
        severity: insight.severity,
        recommendations: insight.recommendations,
        detected_date: new Date().toISOString(),
        status: 'active'
      });
    }

    return Response.json(result);
  } catch (error) {
    console.error('Insight generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});