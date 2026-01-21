import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { content_type, current_content, feedback, refinement_instructions } = await req.json();

    const prompt = `You are an expert instructional designer helping refine AI-generated course content based on instructor feedback.

CONTENT TYPE: ${content_type}
CURRENT CONTENT: ${JSON.stringify(current_content, null, 2)}

INSTRUCTOR FEEDBACK: ${feedback}
REFINEMENT INSTRUCTIONS: ${refinement_instructions || 'Apply the feedback to improve the content'}

Your task:
1. Carefully analyze the current content and the instructor's feedback
2. Make specific, targeted improvements based on the feedback
3. Preserve what's working well
4. Ensure the refined content maintains the same structure/format
5. Provide a summary of changes made

Common refinement requests:
- "Make it more hands-on" → Add practical exercises, labs, real-world activities
- "Increase focus on practical application" → Add more examples, case studies, projects
- "Adjust difficulty" → Modify complexity, prerequisites, pacing
- "Add more interactivity" → Include polls, discussions, collaborative activities
- "Improve clarity" → Simplify language, add examples, improve organization
- "Make it more engaging" → Add storytelling, real-world connections, variety

Return the refined content in the same format as the original, plus a changes summary.`;

    const schema = {
      type: "object",
      properties: {
        refined_content: {
          type: "object",
          description: "The improved content with same structure as original"
        },
        changes_summary: {
          type: "string",
          description: "Clear explanation of what was changed and why"
        },
        specific_improvements: {
          type: "array",
          items: {
            type: "object",
            properties: {
              area: { type: "string" },
              change: { type: "string" },
              rationale: { type: "string" }
            }
          }
        },
        quality_score: {
          type: "number",
          description: "0-100 estimated quality improvement"
        }
      }
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    return Response.json(result);
  } catch (error) {
    console.error('Content refinement error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});