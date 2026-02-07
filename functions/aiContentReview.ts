import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseContent, reviewCriteria } = await req.json();

    const prompt = `Conduct a comprehensive peer review of this course content:

Course Content:
${JSON.stringify(courseContent, null, 2)}

Review Criteria: ${reviewCriteria || 'pedagogical effectiveness, content accuracy, clarity, engagement, accessibility'}

Provide detailed feedback on:
1. Content Quality - accuracy, depth, relevance
2. Pedagogical Approach - teaching methods, learning objectives alignment
3. Student Engagement - interactive elements, real-world applications
4. Accessibility - clarity, language level, inclusive design
5. Structure & Organization - logical flow, pacing, completeness
6. Assessment Quality - quiz/assignment effectiveness
7. Areas for Improvement - specific suggestions with examples`;

    const review = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_rating: {
            type: 'object',
            properties: {
              score: { type: 'number' },
              summary: { type: 'string' }
            }
          },
          strengths: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                description: { type: 'string' }
              }
            }
          },
          improvements: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                issue: { type: 'string' },
                suggestion: { type: 'string' },
                priority: { type: 'string' },
                example: { type: 'string' }
              }
            }
          },
          pedagogical_insights: {
            type: 'array',
            items: { type: 'string' }
          },
          best_practices: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    // Store peer review
    await base44.entities.PeerReview.create({
      content_id: courseContent.id,
      content_type: 'course',
      reviewer_email: 'ai_assistant',
      review_data: review,
      review_date: new Date().toISOString(),
      status: 'completed'
    });

    return Response.json({ review });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});