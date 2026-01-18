import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { code } = await req.json();

    const prompt = `Review this code and provide feedback:

\`\`\`
${code}
\`\`\`

Provide:
- Quality score (0-100)
- Strengths
- Issues to fix
- Suggestions for improvement

Format:
{
  "quality_score": 0-100,
  "strengths": ["..."],
  "issues": ["..."],
  "suggestions": ["..."]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          quality_score: { type: "number" },
          strengths: {
            type: "array",
            items: { type: "string" }
          },
          issues: {
            type: "array",
            items: { type: "string" }
          },
          suggestions: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Code review error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});