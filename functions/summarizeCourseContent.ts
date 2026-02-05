import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, summary_type } = await req.json();

    const summaryPrompts = {
      brief: "Create a brief 2-3 sentence summary highlighting the main points.",
      detailed: "Create a detailed summary with key concepts, main ideas, and important details organized by topic.",
      bullet_points: "Create a concise bullet-point summary of the most important information.",
      study_notes: "Create comprehensive study notes with definitions, key concepts, and examples."
    };

    const prompt = `${summaryPrompts[summary_type] || summaryPrompts.detailed}

Content to summarize:
${content}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          key_points: {
            type: "array",
            items: { type: "string" }
          },
          topics_covered: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Content summarization error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});