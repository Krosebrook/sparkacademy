import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { lesson_topic, learning_objectives } = await req.json();
    
    if (!lesson_topic?.trim()) {
      return Response.json({ error: 'Lesson topic is required' }, { status: 400 });
    }

    const prompt = `Generate interactive elements for this lesson: "${lesson_topic}"

${learning_objectives ? `Learning Objectives: ${learning_objectives}` : ''}

Create engaging interactive elements to enhance student engagement and learning:

1. QUIZ QUESTIONS (4-5 questions):
   - Multiple choice questions that test understanding
   - Include 4 options each
   - Mark correct answer
   - Provide clear explanations for why the answer is correct
   - Mix difficulty levels

2. POLL QUESTIONS (3-4 polls):
   - Thought-provoking opinion questions
   - Encourage reflection and discussion
   - No right/wrong answers
   - 3-4 options each
   - Include purpose/what it reveals

3. DISCUSSION PROMPTS (3-4 prompts):
   - Open-ended questions that spark conversation
   - Types: debate, reflection, application, problem-solving
   - Include 2-3 follow-up questions to deepen discussion
   - Encourage peer learning

Make all elements relevant, engaging, and pedagogically sound.`;

    const schema = {
      type: "object",
      properties: {
        quizzes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question: { type: "string" },
              options: { type: "array", items: { type: "string" } },
              correct_answer: { type: "string" },
              explanation: { type: "string" }
            }
          }
        },
        polls: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question: { type: "string" },
              options: { type: "array", items: { type: "string" } },
              purpose: { type: "string" }
            }
          }
        },
        discussion_prompts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              prompt: { type: "string" },
              type: { type: "string" },
              follow_up_questions: { type: "array", items: { type: "string" } }
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
    console.error('Interactive elements error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});