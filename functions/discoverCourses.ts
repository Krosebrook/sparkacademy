import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email, query } = await req.json();

    const enrollments = await base44.entities.Enrollment?.filter({ 
      student_email: user_email 
    }).catch(() => []);

    const allCourses = await base44.asServiceRole.entities.Course?.list(null, 100).catch(() => []);

    const userProfile = await base44.asServiceRole.entities.UserProfile?.filter({ user_email }).catch(() => []);
    const learningPath = await base44.asServiceRole.entities.LearningPathProgress?.filter({ user_email }).catch(() => []);

    const basePrompt = query 
      ? `User wants to learn: "${query}"\n\n`
      : `Based on user's profile:\nCourses completed: ${enrollments.filter(e => e.status === 'completed').length}\nCurrent enrollments: ${enrollments.length}\nKnowledge gaps: ${learningPath[0]?.knowledge_gaps?.map(g => g.topic).join(', ') || 'None identified'}\n\n`;

    const prompt = `${basePrompt}Create personalized learning journeys.

Available courses: ${allCourses.length}
User aspirations: ${userProfile[0]?.portfolio_goals?.sector_priorities || 'Career advancement'}
Skill gaps: ${learningPath[0]?.knowledge_gaps?.map(g => g.topic).join(', ') || 'General skill building'}

Create 3-5 comprehensive LEARNING JOURNEYS (not just course lists):
Each journey should:
- Target a specific career outcome or skill mastery
- Include 3-6 courses in logical progression
- Show skill progression (beginner → intermediate → advanced)
- Indicate estimated completion time
- List tangible outcomes/career benefits
- Include milestone checkpoints
- Reference current industry trends

Also suggest 3-5 individual courses and trending topics.

Format as JSON:
{
  "learning_journeys": [
    {
      "journey_id": "unique_id",
      "title": "Descriptive title with outcome",
      "description": "What learner will achieve",
      "target_outcome": "Specific career goal or skill level",
      "difficulty_progression": "beginner-to-advanced/intermediate-to-expert",
      "estimated_weeks": 0,
      "career_boost": "Career benefit description",
      "industry_relevance": "Why this matters now",
      "courses": [
        {
          "order": 1,
          "title": "...",
          "duration_weeks": 0,
          "skills_gained": ["..."]
        }
      ],
      "milestones": [
        {
          "checkpoint": "After course 2",
          "achievement": "What you can do"
        }
      ],
      "final_project": "Capstone project idea"
    }
  ],
  "courses": [
    {
      "title": "...",
      "description": "...",
      "match_score": 0-100,
      "level": "beginner/intermediate/advanced",
      "reason": "..."
    }
  ],
  "trending_topics": ["..."]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          learning_journeys: {
            type: "array",
            items: {
              type: "object",
              properties: {
                journey_id: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                target_outcome: { type: "string" },
                difficulty_progression: { type: "string" },
                estimated_weeks: { type: "number" },
                career_boost: { type: "string" },
                industry_relevance: { type: "string" },
                courses: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      order: { type: "number" },
                      title: { type: "string" },
                      duration_weeks: { type: "number" },
                      skills_gained: {
                        type: "array",
                        items: { type: "string" }
                      }
                    }
                  }
                },
                milestones: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      checkpoint: { type: "string" },
                      achievement: { type: "string" }
                    }
                  }
                },
                final_project: { type: "string" }
              }
            }
          },
          courses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                match_score: { type: "number" },
                level: { type: "string" },
                reason: { type: "string" }
              }
            }
          },
          trending_topics: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Discovery error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});