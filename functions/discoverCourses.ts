import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email, query, career_goals } = await req.json();

    const enrollments = await base44.entities.Enrollment?.filter({ 
      student_email: user_email 
    }).catch(() => []);

    const allCourses = await base44.asServiceRole.entities.Course?.list(null, 100).catch(() => []);

    const userProfile = await base44.asServiceRole.entities.UserProfile?.filter({ user_email }).catch(() => []);
    const learningPath = await base44.asServiceRole.entities.LearningPathProgress?.filter({ user_email }).catch(() => []);

    const careerGoalsSection = career_goals 
      ? `\n\nUSER'S CAREER GOALS:\n${career_goals}\n\nIMPORTANT: All recommendations MUST align with these career goals and aspirations.`
      : '';

    const basePrompt = query 
      ? `User wants to learn: "${query}"`
      : `User's profile:\nCourses completed: ${enrollments.filter(e => e.status === 'completed').length}\nCurrent enrollments: ${enrollments.length}\nKnowledge gaps: ${learningPath[0]?.knowledge_gaps?.map(g => g.topic).join(', ') || 'None identified'}`;

    const prompt = `${basePrompt}${careerGoalsSection}\n\nCreate holistic career and learning recommendations.

Available courses: ${allCourses.length}
Skill gaps: ${learningPath[0]?.knowledge_gaps?.map(g => g.topic).join(', ') || 'General skill building'}

Provide HOLISTIC CAREER RECOMMENDATIONS:

1. CAREER PATHS (2-4 paths): Specific career roles that align with user's goals, showing:
   - Role progression (Junior → Mid → Senior)
   - Required skills with importance levels
   - Industry demand, growth rate, job openings
   - Salary ranges and timeline to achieve
   - Which learning journey maps to this path

2. LEARNING JOURNEYS (3-5 journeys): Comprehensive learning tracks
Each journey should:
- Target a specific career outcome or skill mastery
- Include 3-6 courses in logical progression
- Show skill progression (beginner → intermediate → advanced)
- Indicate estimated completion time
- List tangible outcomes/career benefits
- Include milestone checkpoints
- Reference current industry trends

3. Individual courses and trending topics.

Format as JSON:
{
  "career_paths": [
    {
      "path_id": "unique_id",
      "title": "Career role title",
      "description": "What this career involves",
      "timeline": "Time to achieve (e.g., '12-18 months')",
      "demand_level": "high/medium/low",
      "growth_rate": "e.g., '22% annually'",
      "job_openings": "e.g., '10,000+ openings'",
      "salary_range": "e.g., '$80k-$150k'",
      "required_skills": [
        {
          "name": "Skill name",
          "importance": 0-100
        }
      ],
      "progression_stages": [
        {
          "role": "Junior/Mid/Senior role title",
          "experience_required": "e.g., '0-2 years'",
          "typical_salary": "e.g., '$60k-$80k'"
        }
      ],
      "industry_insights": "Why this career is relevant now",
      "recommended_journey_id": "matching journey ID"
    }
  ],
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
          career_paths: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path_id: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                timeline: { type: "string" },
                demand_level: { type: "string" },
                growth_rate: { type: "string" },
                job_openings: { type: "string" },
                salary_range: { type: "string" },
                required_skills: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      importance: { type: "number" }
                    }
                  }
                },
                progression_stages: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      role: { type: "string" },
                      experience_required: { type: "string" },
                      typical_salary: { type: "string" }
                    }
                  }
                },
                industry_insights: { type: "string" },
                recommended_journey_id: { type: "string" }
              }
            }
          },
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