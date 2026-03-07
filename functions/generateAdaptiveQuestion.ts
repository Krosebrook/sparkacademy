import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { topic, currentQuestion, wasCorrect, difficulty, previousQuestions = [] } = await req.json();

  const targetDifficulty = wasCorrect
    ? (difficulty === 'easy' ? 'medium' : 'hard')
    : (difficulty === 'hard' ? 'medium' : 'easy');

  const difficultyGuidance = {
    easy: 'foundational, definitional — test basic recall and understanding of core concepts',
    medium: 'application-level — test ability to apply concepts in a scenario',
    hard: 'analytical/synthesis — test deep understanding, edge cases, or multi-step reasoning',
  };

  const avoidList = previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n');

  const prompt = `You are an adaptive quiz engine. A student just answered a question ${wasCorrect ? 'CORRECTLY' : 'INCORRECTLY'}.

Topic: ${topic}
Previous question: "${currentQuestion}"
Target difficulty: ${targetDifficulty} (${difficultyGuidance[targetDifficulty]})
${wasCorrect
  ? `The student got it right. Generate a HARDER question to challenge them further.`
  : `The student got it wrong. Generate a SIMPLER foundational reinforcement question to help them understand the concept better.`}

Questions to avoid repeating:
${avoidList || 'None yet'}

Return a single multiple-choice question. Provide exactly 4 options. One must be correct.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_schema', json_schema: {
      name: 'adaptive_question',
      schema: {
        type: 'object',
        properties: {
          question_text: { type: 'string' },
          options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
          correct_option_index: { type: 'integer' },
          explanation: { type: 'string', description: 'Brief explanation of the correct answer' },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] }
        },
        required: ['question_text', 'options', 'correct_option_index', 'explanation', 'difficulty'],
        additionalProperties: false
      }
    }}
  });

  const question = JSON.parse(response.choices[0].message.content);
  return Response.json({ question });
});