import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { topic, learning_style, difficulty_level, resource_types } = await req.json();
    
    if (!topic?.trim()) {
      return Response.json({ error: 'Topic is required' }, { status: 400 });
    }

    const prompt = `Find and curate the best external learning resources for: "${topic}"

Learning Style: ${learning_style || 'all styles'}
Difficulty Level: ${difficulty_level || 'intermediate'}
Preferred Types: ${resource_types?.join(', ') || 'articles, videos, interactive tools, tutorials'}

Search the web for high-quality, up-to-date resources (2023-2026) and curate the TOP 8-10 resources.

For each resource provide:
1. Title
2. URL (must be real, accessible URL from search results)
3. Type (article/video/interactive_tool/tutorial/documentation/course)
4. Source (website/platform name)
5. Description (50-80 words explaining what it covers and why it's valuable)
6. Quality score (1-10 based on authority, recency, depth)
7. Estimated time to complete
8. Difficulty level (beginner/intermediate/advanced)
9. Learning style fit (visual/auditory/kinesthetic/reading)
10. Key topics covered

Prioritize:
- Recent content (2023+)
- Authoritative sources (MDN, official docs, respected educators)
- Practical, actionable content
- Free or freemium resources
- Highly-rated content

Ensure variety in resource types and difficulty levels.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          resources: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                url: { type: "string" },
                type: { type: "string" },
                source: { type: "string" },
                description: { type: "string" },
                quality_score: { type: "number" },
                estimated_time: { type: "string" },
                difficulty: { type: "string" },
                learning_style_fit: { type: "string" },
                key_topics: { type: "array", items: { type: "string" } }
              }
            }
          },
          search_summary: { type: "string" }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Resource curation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});