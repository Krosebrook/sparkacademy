import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, currentContent, userPerformance } = await req.json();

    // Analyze user performance to determine optimal difficulty
    const prompt = `Analyze this user's performance and adjust content difficulty:

Current Content: ${JSON.stringify(currentContent)}
User Performance:
- Quiz Scores: ${userPerformance.quizScores?.join(', ')}
- Time Spent: ${userPerformance.timeSpent} minutes
- Completion Rate: ${userPerformance.completionRate}%
- Struggle Indicators: ${userPerformance.struggles?.join(', ')}

Provide:
1. Recommended difficulty level (easier/same/harder)
2. Adjusted content with appropriate complexity
3. Alternative explanations if struggling
4. Advanced concepts if excelling
5. Personalized practice problems`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommended_difficulty: { type: 'string' },
          adjusted_content: { type: 'string' },
          alternative_explanations: { type: 'array', items: { type: 'string' } },
          practice_problems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                problem: { type: 'string' },
                difficulty: { type: 'string' },
                hints: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          reasoning: { type: 'string' }
        }
      }
    });

    return Response.json({
      adjustedDifficulty: response.recommended_difficulty,
      content: response.adjusted_content,
      alternatives: response.alternative_explanations,
      practiceProblems: response.practice_problems,
      reasoning: response.reasoning,
      adjustedAt: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});