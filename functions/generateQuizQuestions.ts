import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, num_questions = 5 } = await req.json();

    const prompt = `Generate ${num_questions} multiple-choice quiz questions about: ${topic}

Each question should have:
- A clear question
- 4 options (A, B, C, D)
- The index of the correct answer (0-3)

Format as JSON:
{
  "questions": [
    {
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct_answer": 0
    }
  ]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                options: {
                  type: "array",
                  items: { type: "string" }
                },
                correct_answer: { type: "number" }
              }
            }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Quiz generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});