import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text_content, num_questions, difficulty } = await req.json();

    const prompt = `Analyze this content and create ${num_questions || 5} interactive quiz questions at ${difficulty || 'medium'} difficulty level:

Content:
${text_content}

Create a variety of question types:
- Multiple choice (4 options)
- True/False
- Fill in the blank

Format as JSON with questions, options, correct answers, and explanations.`;

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
                type: { 
                  type: "string",
                  enum: ["multiple_choice", "true_false", "fill_blank"]
                },
                options: {
                  type: "array",
                  items: { type: "string" }
                },
                correct_answer: { type: "string" },
                explanation: { type: "string" }
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