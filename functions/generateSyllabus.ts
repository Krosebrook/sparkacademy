import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { topic, target_audience, objectives, duration_weeks = 8 } = await req.json();

    const audienceMap = {
      'absolute_beginners': 'absolute beginners with no prior experience',
      'beginners': 'beginners with basic computer literacy',
      'intermediate': 'intermediate learners with some foundational knowledge',
      'advanced': 'advanced learners seeking mastery',
      'professionals': 'working professionals seeking career advancement'
    };

    const audienceDescription = audienceMap[target_audience] || 'general learners';

    const prompt = `Create a comprehensive course syllabus for: "${topic}"

Target Audience: ${audienceDescription}
Duration: ${duration_weeks} weeks
${objectives ? `Instructor's Learning Objectives: ${objectives}` : ''}

Generate a detailed syllabus with:
1. Course title (engaging and descriptive)
2. Course overview (2-3 paragraphs explaining the course)
3. Learning objectives (4-6 clear, measurable objectives)
4. Prerequisites (what students need before starting)
5. ${duration_weeks} modules (one per week) with:
   - Module title
   - Duration estimate
   - Description
   - 4-6 specific topics covered
   - 3-5 key activities/assignments
6. Assessment strategy (how students will be evaluated)
7. Recommended resources (books, tools, platforms)

Make it professional, comprehensive, and aligned with the target audience's skill level.`;

    const schema = {
      type: "object",
      properties: {
        title: { type: "string" },
        overview: { type: "string" },
        duration: { type: "string" },
        target_audience: { type: "string" },
        learning_objectives: {
          type: "array",
          items: { type: "string" }
        },
        prerequisites: {
          type: "array",
          items: { type: "string" }
        },
        modules: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              duration: { type: "string" },
              description: { type: "string" },
              topics: {
                type: "array",
                items: { type: "string" }
              },
              activities: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        },
        assessment: {
          type: "array",
          items: { type: "string" }
        },
        resources: {
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
    console.error('Syllabus generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});