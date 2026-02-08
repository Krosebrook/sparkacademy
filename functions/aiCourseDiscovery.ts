import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, filters, userContext } = await req.json();

    // Get all courses
    const allCourses = await base44.asServiceRole.entities.Course.list();

    // Get user's profile for personalization
    const userProfile = await base44.entities.EmployeeProfile.filter({ employee_email: user.email });
    const learningPaths = await base44.entities.SkillsPathway.filter({ employee_id: user.email });

    const prompt = `You are an AI course discovery assistant. Analyze this search query and user context to recommend the most relevant courses.

Search Query: "${query}"
User Context: ${JSON.stringify(userContext || {})}
User Profile: ${JSON.stringify(userProfile[0] || {})}
Learning Paths: ${JSON.stringify(learningPaths || [])}

Available Courses:
${allCourses.map(c => `ID: ${c.id}, Title: ${c.title}, Description: ${c.description}, Category: ${c.category}, Level: ${c.level}, Tags: ${c.tags?.join(', ')}`).join('\n')}

Provide:
1. Ranked course recommendations with relevance scores
2. Explanation of why each course matches
3. Skill gaps addressed
4. Alternative search suggestions`;

    const aiResults = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          recommended_courses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                course_id: { type: 'string' },
                relevance_score: { type: 'number' },
                match_reason: { type: 'string' },
                skill_gaps_addressed: { type: 'array', items: { type: 'string' } },
                learning_path_alignment: { type: 'string' }
              }
            }
          },
          search_insights: { type: 'string' },
          alternative_queries: { type: 'array', items: { type: 'string' } },
          trending_topics: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    // Enrich with actual course data
    const enrichedResults = aiResults.recommended_courses.map(rec => {
      const course = allCourses.find(c => c.id === rec.course_id);
      return { ...rec, course };
    }).filter(r => r.course);

    return Response.json({
      results: enrichedResults,
      insights: aiResults.search_insights,
      alternatives: aiResults.alternative_queries,
      trending: aiResults.trending_topics
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});