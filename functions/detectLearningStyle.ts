import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { interaction_history, quiz_patterns, time_spent_data } = await req.json();

    const prompt = `Analyze student learning patterns to detect their primary learning style:

Interaction History (last 20 tutor questions):
${interaction_history?.map(q => `- "${q}"`).join('\n') || 'No data'}

Quiz Performance Patterns:
${quiz_patterns ? JSON.stringify(quiz_patterns, null, 2) : 'No data'}

Time Spent on Different Content Types:
${time_spent_data ? JSON.stringify(time_spent_data, null, 2) : 'No data'}

Determine the student's primary and secondary learning styles:
- Visual: Prefers diagrams, charts, videos, written content
- Auditory: Prefers spoken explanations, discussions, audio content
- Kinesthetic: Prefers hands-on practice, interactive exercises, coding
- Reading/Writing: Prefers text-based learning, note-taking, written exercises

Provide:
1. Primary learning style with confidence (0-100%)
2. Secondary learning style with confidence
3. Specific indicators that led to this conclusion
4. Personalized study recommendations
5. Content format preferences`;

    const schema = {
      type: "object",
      properties: {
        primary_style: { type: "string" },
        primary_confidence: { type: "number" },
        secondary_style: { type: "string" },
        secondary_confidence: { type: "number" },
        indicators: {
          type: "array",
          items: { type: "string" }
        },
        study_recommendations: {
          type: "array",
          items: { type: "string" }
        },
        preferred_formats: {
          type: "array",
          items: { type: "string" }
        }
      }
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    return Response.json(result);
  } catch (error) {
    console.error('Learning style detection error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});