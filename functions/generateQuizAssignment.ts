import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { topic, type, difficulty, count, course_id } = await req.json();

    let prompt = '';
    let schema = {};

    if (type === 'quiz') {
      prompt = `Generate ${count} multiple-choice quiz questions about "${topic}" at ${difficulty} difficulty level.

Each question should:
- Test understanding, not just memorization
- Have 4 options with one correct answer
- Include a brief explanation

Format:
{
  "items": [{
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correct_answer": 0-3,
    "explanation": "..."
  }]
}`;

      schema = {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                options: {
                  type: "array",
                  items: { type: "string" }
                },
                correct_answer: { type: "number" },
                explanation: { type: "string" }
              }
            }
          }
        }
      };
    } else if (type === 'assignment') {
      prompt = `Generate ${count} assignment prompts about "${topic}" at ${difficulty} difficulty level.

Each assignment should:
- Be practical and engaging
- Encourage critical thinking or application
- Include grading rubric criteria

Format:
{
  "items": [{
    "prompt": "...",
    "rubric": ["...", "...", "..."]
  }]
}`;

      schema = {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                prompt: { type: "string" },
                rubric: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      };
    } else {
      // discussion prompts
      prompt = `Generate ${count} discussion prompts about "${topic}" at ${difficulty} difficulty level.

Each prompt should:
- Encourage critical thinking and debate
- Be open-ended
- Relate to real-world applications

Format:
{
  "items": [{
    "prompt": "...",
    "explanation": "Why this matters..."
  }]
}`;

      schema = {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                prompt: { type: "string" },
                explanation: { type: "string" }
              }
            }
          }
        }
      };
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    return Response.json(result);
  } catch (error) {
    console.error('Quiz/assignment generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});