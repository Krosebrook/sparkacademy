import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();

    // Fetch user profile and learning data
    const profiles = await base44.entities.EmployeeProfile.filter({ employee_email: user.email });
    const profile = profiles[0] || {};
    
    const courses = await base44.entities.Course.list();
    const enrollments = await base44.entities.Enrollment.filter({ student_email: user.email });

    // Generate smart recommendations
    const prompt = `Generate personalized course recommendations for this user:

User Profile:
- Current Role: ${profile.current_role || 'Not specified'}
- Career Goals: ${profile.career_goals?.join(', ') || 'Not specified'}
- AI Experience: ${profile.ai_experience_level || 'beginner'}
- Core Skills: ${profile.core_skills?.join(', ') || 'None'}
- Skill Gaps: ${profile.skill_gaps?.join(', ') || 'None'}
- Learning Style: ${profile.learning_preferences?.learning_style || 'mixed'}
- Completed Courses: ${profile.completed_courses?.length || 0}
- In Progress: ${profile.in_progress_courses?.length || 0}

Current Enrollments: ${enrollments.length}

Provide personalized recommendations with:
1. Top 5 recommended courses
2. Match score (0-100) for each
3. Why it's recommended
4. How it addresses skill gaps
5. Learning path placement`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                course_title: { type: 'string' },
                match_score: { type: 'number' },
                reason: { type: 'string' },
                addresses_gaps: { type: 'array', items: { type: 'string' } },
                placement: { type: 'string' },
                estimated_completion: { type: 'string' },
                difficulty: { type: 'string' }
              }
            }
          },
          learning_path_summary: { type: 'string' },
          priority_skills: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return Response.json({
      recommendations: response.recommendations,
      pathSummary: response.learning_path_summary,
      prioritySkills: response.priority_skills,
      personalizedFor: user.email,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});