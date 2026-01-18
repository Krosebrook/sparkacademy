import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email, query } = await req.json();

    const enrollments = await base44.entities.Enrollment?.filter({ 
      student_email: user_email 
    }).catch(() => []);

    const allCourses = await base44.asServiceRole.entities.Course?.list(null, 100).catch(() => []);

    const basePrompt = query 
      ? `User wants to learn: "${query}"\n\n`
      : `Based on user's current learning:\n${enrollments.map(e => e.course_id).join(', ')}\n\n`;

    const prompt = `${basePrompt}Recommend courses and learning tracks.

Available courses: ${allCourses.length}

Provide:
- 3-5 recommended courses with title, description, match score, level, and reason
- 2-3 learning tracks (bundles of related courses)
- Trending topics in their field

Format as JSON:
{
  "courses": [
    {
      "title": "...",
      "description": "...",
      "match_score": 0-100,
      "level": "beginner/intermediate/advanced",
      "reason": "..."
    }
  ],
  "learning_tracks": [
    {
      "title": "...",
      "description": "...",
      "courses": ["..."]
    }
  ],
  "trending_topics": ["..."]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          courses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                match_score: { type: "number" },
                level: { type: "string" },
                reason: { type: "string" }
              }
            }
          },
          learning_tracks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                courses: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          trending_topics: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Discovery error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});