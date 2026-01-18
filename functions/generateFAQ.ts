import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { course_id } = await req.json();
    const discussions = await base44.asServiceRole.entities.CourseDiscussion?.filter({ course_id }).catch(() => []);

    const prompt = `Create FAQ from recurring questions in discussions:

${discussions.slice(0, 50).map(d => d.message).join('\n')}

Generate 5-10 FAQ entries with questions and comprehensive answers.

Format:
{
  "faqs": [{
    "question": "...",
    "answer": "..."
  }]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          faqs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                answer: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('FAQ generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});