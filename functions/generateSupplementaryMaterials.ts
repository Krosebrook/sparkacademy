import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { course_content } = await req.json();
    
    if (!course_content?.trim()) {
      return Response.json({ error: 'Course content is required' }, { status: 400 });
    }

    const prompt = `Analyze this course content and create comprehensive supplementary materials:

${course_content}

Generate TWO learning aids:

1. CHEAT SHEET:
   - Quick reference guide with 15-25 items
   - Organized into 4-6 logical categories
   - Each item includes:
     * Term/concept
     * Concise explanation (1-2 lines)
     * Code example or use case (when applicable)
   - Prioritize most important/frequently-used concepts
   - Format for easy scanning

2. GLOSSARY:
   - Comprehensive terminology guide with 20-30 terms
   - Alphabetically organized
   - Each term includes:
     * Clear, beginner-friendly definition
     * Example usage or context
     * Related terms (cross-references)
   - Cover all key vocabulary from the course
   - Include both basic and advanced terms

Make both materials:
- Accurate and technically correct
- Beginner-friendly yet comprehensive
- Formatted for easy reference
- Practical and actionable`;

    const schema = {
      type: "object",
      properties: {
        cheat_sheet: {
          type: "object",
          properties: {
            title: { type: "string" },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        term: { type: "string" },
                        explanation: { type: "string" },
                        example: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        glossary: {
          type: "object",
          properties: {
            terms: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  term: { type: "string" },
                  definition: { type: "string" },
                  example: { type: "string" },
                  related_terms: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      }
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    return Response.json(result);
  } catch (error) {
    console.error('Supplementary materials error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});