import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { module_content, module_title, output_format } = await req.json();

    const prompt = `You are an expert learning scientist. Create summarized study materials from course module content.

MODULE TITLE: ${module_title}
MODULE CONTENT: ${module_content}
OUTPUT FORMAT: ${output_format || 'both'}

Generate comprehensive study materials including:

1. STUDY GUIDE:
   - Key concepts summary (bullet points)
   - Main takeaways (3-5 points)
   - Important definitions
   - Formulas/procedures (if applicable)
   - Visual learning aids suggestions
   - Quick reference section

2. FLASHCARDS (20-30 cards):
   - Front: Question/term/concept
   - Back: Answer/definition/explanation
   - Include various types: definitions, concepts, applications, comparisons
   - Progressive difficulty
   - Memory hooks/mnemonics where helpful

3. STUDY TIPS:
   - How to approach this material
   - What to focus on
   - Common confusion points
   - Recommended study sequence

Make content concise, clear, and optimized for quick review and retention.`;

    const schema = {
      type: "object",
      properties: {
        study_guide: {
          type: "object",
          properties: {
            key_concepts: { type: "array", items: { type: "string" } },
            main_takeaways: { type: "array", items: { type: "string" } },
            definitions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  term: { type: "string" },
                  definition: { type: "string" }
                }
              }
            },
            formulas_procedures: { type: "array", items: { type: "string" } },
            visual_aids: { type: "array", items: { type: "string" } },
            quick_reference: { type: "string" }
          }
        },
        flashcards: {
          type: "array",
          items: {
            type: "object",
            properties: {
              card_number: { type: "number" },
              front: { type: "string" },
              back: { type: "string" },
              type: { type: "string" },
              difficulty: { type: "string" },
              mnemonic: { type: "string" }
            }
          }
        },
        study_tips: {
          type: "array",
          items: {
            type: "object",
            properties: {
              tip: { type: "string" },
              category: { type: "string" }
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
    console.error('Study guides generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});