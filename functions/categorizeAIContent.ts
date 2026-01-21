import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { asset_type, content } = await req.json();

    const prompt = `You are an AI content analysis expert. Analyze this AI-generated educational content and provide detailed categorization.

ASSET TYPE: ${asset_type}
CONTENT: ${JSON.stringify(content, null, 2)}

Analyze and categorize this content by:
1. Main topics covered
2. Difficulty level (beginner, intermediate, advanced, expert)
3. Domain/industry focus (financial, developer, creative, healthcare, manufacturing, or general)
4. Key concepts and learning objectives
5. Related skills required or developed
6. Estimated time needed to complete/study (in minutes)
7. Generate searchable keywords and phrases

Provide comprehensive metadata for searchability and organization.`;

    const schema = {
      type: "object",
      properties: {
        topics: {
          type: "array",
          items: { type: "string" }
        },
        difficulty_level: {
          type: "string",
          enum: ["beginner", "intermediate", "advanced", "expert"]
        },
        domain: {
          type: "string",
          enum: ["financial", "developer", "creative", "healthcare", "manufacturing", "general"]
        },
        key_concepts: {
          type: "array",
          items: { type: "string" }
        },
        related_skills: {
          type: "array",
          items: { type: "string" }
        },
        estimated_time_minutes: {
          type: "number"
        },
        searchable_keywords: {
          type: "array",
          items: { type: "string" }
        },
        suggested_tags: {
          type: "array",
          items: { type: "string" }
        }
      }
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    // Generate searchable text
    const searchableText = [
      result.topics?.join(' '),
      result.key_concepts?.join(' '),
      result.related_skills?.join(' '),
      result.searchable_keywords?.join(' '),
      JSON.stringify(content)
    ].filter(Boolean).join(' ').toLowerCase();

    return Response.json({
      ai_metadata: {
        topics: result.topics,
        difficulty_level: result.difficulty_level,
        domain: result.domain,
        key_concepts: result.key_concepts,
        related_skills: result.related_skills,
        estimated_time_minutes: result.estimated_time_minutes
      },
      searchable_text: searchableText,
      tags: result.suggested_tags
    });
  } catch (error) {
    console.error('Content categorization error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});