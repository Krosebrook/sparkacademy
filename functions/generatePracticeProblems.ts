import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { lesson_content, lesson_topic, difficulty_level, problem_count } = await req.json();

    const prompt = `You are an expert instructional designer. Generate diverse practice problems and case studies based on lesson content.

LESSON TOPIC: ${lesson_topic}
LESSON CONTENT: ${lesson_content}
DIFFICULTY LEVEL: ${difficulty_level || 'mixed'}
NUMBER OF PROBLEMS: ${problem_count || 5}

Generate ${problem_count || 5} practice problems/case studies that:
1. Cover different aspects of the lesson content
2. Range in difficulty (${difficulty_level || 'include beginner, intermediate, and advanced'})
3. Include various formats (multiple choice, short answer, coding challenges, case studies, scenarios)
4. Provide detailed solutions with explanations
5. Include hints for students who get stuck
6. Connect to real-world applications

For each problem, provide:
- Problem type and difficulty
- Full problem statement
- Step-by-step solution
- Key concepts being tested
- Common mistakes to avoid
- Extension challenges (optional harder version)`;

    const schema = {
      type: "object",
      properties: {
        problems: {
          type: "array",
          items: {
            type: "object",
            properties: {
              problem_number: { type: "number" },
              type: { type: "string" },
              difficulty: { type: "string" },
              title: { type: "string" },
              problem_statement: { type: "string" },
              hints: { type: "array", items: { type: "string" } },
              solution: { type: "string" },
              explanation: { type: "string" },
              key_concepts: { type: "array", items: { type: "string" } },
              common_mistakes: { type: "array", items: { type: "string" } },
              extension_challenge: { type: "string" },
              estimated_time_minutes: { type: "number" }
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
    console.error('Practice problems generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});