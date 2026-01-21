import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { employee_profile, target_role, organization_focus } = await req.json();

    const prompt = `You are an AI career development advisor for INTInc's corporate AI training platform. Generate a personalized AI skills learning pathway.

EMPLOYEE PROFILE:
- Current Role: ${employee_profile.current_role}
- Department: ${employee_profile.department}
- AI Experience: ${employee_profile.ai_experience_level}
- Current Skills: ${employee_profile.core_skills?.join(', ') || 'None specified'}
- Skill Gaps: ${employee_profile.skill_gaps?.join(', ') || 'To be identified'}
- Career Goals: ${employee_profile.career_goals?.join(', ') || 'Not specified'}

TARGET ROLE: ${target_role || 'AI-empowered professional in current field'}
ORGANIZATION FOCUS: ${organization_focus || 'General AI literacy'}

Create a comprehensive, personalized learning pathway with:

1. PATHWAY OVERVIEW:
   - Pathway name (inspiring and specific)
   - Current to target level progression
   - Estimated timeline
   - Career goal context

2. LEARNING STAGES (4-6 stages):
   For each stage:
   - Stage title and duration
   - Key AI skills to acquire (specific to role and department)
   - Recommended courses (prioritized: required, recommended, optional)
   - Practical projects/assignments
   - Learning resources
   - Success criteria

3. DOMAIN-SPECIFIC CUSTOMIZATION:
   - Financial sector: Focus on AI in trading, risk analysis, fraud detection, robo-advisors
   - Creative/Artistic: AI art generation, content creation, design automation
   - Developer: AI/ML engineering, model deployment, prompt engineering, AI APIs
   - Healthcare: Medical AI, diagnostics, patient care optimization
   - Manufacturing: Predictive maintenance, supply chain optimization
   - General: Productivity AI, decision-making, automation

4. CAREER PROGRESSION:
   - How each stage builds toward target role
   - Industry-recognized certifications to pursue
   - Real-world application opportunities

Make it actionable, measurable, and tailored to the employee's context within INTInc client organizations.`;

    const schema = {
      type: "object",
      properties: {
        pathway_name: { type: "string" },
        current_level: { type: "string" },
        target_level: { type: "string" },
        career_goal_context: { type: "string" },
        total_duration_weeks: { type: "number" },
        stages: {
          type: "array",
          items: {
            type: "object",
            properties: {
              stage_number: { type: "number" },
              stage_title: { type: "string" },
              duration_weeks: { type: "number" },
              key_skills: { type: "array", items: { type: "string" } },
              recommended_courses: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    course_title: { type: "string" },
                    duration_hours: { type: "number" },
                    priority: { type: "string" },
                    topics_covered: { type: "array", items: { type: "string" } }
                  }
                }
              },
              projects_assignments: { type: "array", items: { type: "string" } },
              learning_resources: { type: "array", items: { type: "string" } },
              success_criteria: { type: "array", items: { type: "string" } }
            }
          }
        },
        department_focus: { type: "string" },
        industry_focus: { type: "string" },
        career_milestones: { type: "array", items: { type: "string" } },
        certifications_to_pursue: { type: "array", items: { type: "string" } }
      }
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    return Response.json(result);
  } catch (error) {
    console.error('Skills pathway generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});