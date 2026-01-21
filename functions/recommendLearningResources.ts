import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { current_topic, performance_data } = await req.json();

    const [employeeProfile, skillsPathway, engagements] = await Promise.all([
      base44.entities.EmployeeProfile.filter({ employee_email: user.email }).then(r => r[0]),
      base44.entities.SkillsPathway.filter({ employee_id: user.email, status: 'active' }).then(r => r[0]),
      base44.entities.AIContentEngagement.filter({ student_email: user.email })
    ]);

    // Calculate performance metrics
    const avgScore = performance_data?.recent_scores?.reduce((a, b) => a + b, 0) / (performance_data?.recent_scores?.length || 1) || 70;
    const strugglingTopics = engagements
      ?.filter(e => e.struggle_indicators?.length > 0)
      .map(e => e.course_id) || [];

    const prompt = `You are an AI learning advisor recommending personalized resources for corporate learners.

LEARNER PROFILE:
- Role: ${employeeProfile?.current_role}
- Department: ${employeeProfile?.department}
- AI Experience: ${employeeProfile?.ai_experience_level}
- Pathway: ${skillsPathway?.pathway_name}
- Current Stage: ${skillsPathway?.current_level}

PERFORMANCE CONTEXT:
- Current Topic: ${current_topic}
- Average Score: ${avgScore.toFixed(0)}%
- Struggling With: ${strugglingTopics.join(', ') || 'None identified'}

LEARNING GOALS:
${employeeProfile?.career_goals?.join(', ') || 'AI skill development'}

Recommend 5-8 learning resources:
1. Articles, videos, tutorials
2. Interactive exercises or projects
3. Industry-specific case studies
4. Advanced readings for deeper understanding

Prioritize resources that:
- Match their experience level and performance
- Align with their career goals and department
- Address any struggling areas
- Support their current pathway stage`;

    const schema = {
      type: "object",
      properties: {
        recommendations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              type: { 
                type: "string",
                enum: ["article", "video", "tutorial", "exercise", "case_study", "book", "course"]
              },
              url: { type: "string" },
              description: { type: "string" },
              difficulty: { 
                type: "string",
                enum: ["beginner", "intermediate", "advanced"]
              },
              estimated_time_minutes: { type: "number" },
              relevance_reason: { type: "string" }
            }
          }
        },
        priority_focus: { type: "string" },
        next_milestone: { type: "string" }
      }
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema,
      add_context_from_internet: true
    });

    return Response.json(result);
  } catch (error) {
    console.error('Resource recommendation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});