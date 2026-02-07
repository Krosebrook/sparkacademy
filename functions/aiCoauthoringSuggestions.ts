import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId, currentContent, context, suggestionType } = await req.json();

    const prompts = {
      expand: `Expand and enhance this course content with more detail, examples, and clarity:\n\n${currentContent}\n\nContext: ${context}`,
      restructure: `Suggest a better structure and organization for this content:\n\n${currentContent}\n\nContext: ${context}`,
      simplify: `Simplify and make this content more accessible for students:\n\n${currentContent}\n\nContext: ${context}`,
      enhance: `Enhance this content with engaging elements, interactive components, and modern teaching methods:\n\n${currentContent}\n\nContext: ${context}`,
      proofread: `Proofread and improve grammar, clarity, and academic tone:\n\n${currentContent}\n\nContext: ${context}`
    };

    const prompt = prompts[suggestionType] || prompts.enhance;

    const suggestions = await base44.integrations.Core.InvokeLLM({
      prompt: `${prompt}\n\nProvide:
1. Specific suggestions with rationale
2. Revised content snippets
3. Teaching tips`,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                section: { type: 'string' },
                issue: { type: 'string' },
                suggestion: { type: 'string' },
                revised_content: { type: 'string' },
                rationale: { type: 'string' }
              }
            }
          },
          teaching_tips: {
            type: 'array',
            items: { type: 'string' }
          },
          overall_assessment: { type: 'string' }
        }
      }
    });

    // Track collaboration
    const doc = await base44.entities.CollaborativeDocument.filter({ id: documentId });
    if (doc[0]) {
      await base44.entities.CollaborativeDocument.update(documentId, {
        version_history: [
          ...(doc[0].version_history || []),
          {
            timestamp: new Date().toISOString(),
            user_email: user.email,
            change_type: 'ai_suggestion',
            suggestion_type: suggestionType
          }
        ]
      });
    }

    return Response.json({ suggestions });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});