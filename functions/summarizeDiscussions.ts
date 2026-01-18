import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { course_id } = await req.json();

    const discussions = await base44.entities.CourseDiscussion?.filter({ 
      course_id 
    }).catch(() => []);

    const recentDiscussions = discussions.slice(0, 20);

    const prompt = `Summarize these course discussions:

${recentDiscussions.map(d => `- ${d.message}`).join('\n')}

Provide:
- 3-5 key discussion points
- Top 3 trending topics with mention counts
- Common questions (if any)

Format as JSON:
{
  "key_points": ["..."],
  "trending_topics": [{"name": "...", "mentions": 0}],
  "common_questions": ["..."]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          key_points: {
            type: "array",
            items: { type: "string" }
          },
          trending_topics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                mentions: { type: "number" }
              }
            }
          },
          common_questions: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Summary error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});