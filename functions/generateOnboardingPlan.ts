import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organization_id, assessment } = await req.json();

    const organization = await base44.asServiceRole.entities.ClientOrganization.filter({ id: organization_id }).then(r => r[0]);

    const prompt = `You are an AI training strategist for INTInc. Create a comprehensive onboarding plan for a new B2B client.

ORGANIZATION:
- Name: ${organization.organization_name}
- Industry: ${organization.organization_type}
- Employees: ${organization.total_employees}
- Subscription: ${organization.subscription_tier}

AI ASSESSMENT:
- Current Literacy: ${assessment.current_ai_literacy_level}
- Priority Areas: ${assessment.priority_training_areas?.join(', ')}
- Industry Needs: ${assessment.industry_specific_needs?.join(', ')}
- Risk Factors: ${assessment.risk_factors?.join(', ')}

Create a 3-phase training plan:

PHASE 1 - FOUNDATION (Weeks 1-4):
- Fundamental AI courses for all employees
- Department-specific introductions
- Target departments and course recommendations

PHASE 2 - APPLICATION (Weeks 5-10):
- Intermediate courses applying AI to job roles
- Domain-specific training (financial, developer, creative, etc.)
- Hands-on projects

PHASE 3 - MASTERY (Weeks 11-16):
- Advanced courses for power users
- Specialized certifications
- Leadership and AI strategy

Also provide:
1. Account manager suggestions (features to highlight, courses to promote, success strategies)
2. Implementation timeline with weekly milestones
3. Success metrics (target adoption, literacy improvement, completion rates)

Be specific to their ${organization.organization_type} industry and ${organization.subscription_tier} subscription tier.`;

    const schema = {
      type: "object",
      properties: {
        phase_1_foundation: {
          type: "object",
          properties: {
            duration_weeks: { type: "number" },
            courses: { type: "array", items: { type: "string" } },
            target_departments: { type: "array", items: { type: "string" } },
            key_objectives: { type: "array", items: { type: "string" } }
          }
        },
        phase_2_application: {
          type: "object",
          properties: {
            duration_weeks: { type: "number" },
            courses: { type: "array", items: { type: "string" } },
            target_departments: { type: "array", items: { type: "string" } },
            key_objectives: { type: "array", items: { type: "string" } }
          }
        },
        phase_3_mastery: {
          type: "object",
          properties: {
            duration_weeks: { type: "number" },
            courses: { type: "array", items: { type: "string" } },
            target_departments: { type: "array", items: { type: "string" } },
            key_objectives: { type: "array", items: { type: "string" } }
          }
        },
        account_manager_suggestions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              suggestion_type: { type: "string" },
              priority: { type: "string" },
              recommendation: { type: "string" },
              rationale: { type: "string" }
            }
          }
        },
        implementation_timeline: {
          type: "array",
          items: {
            type: "object",
            properties: {
              week: { type: "number" },
              milestone: { type: "string" },
              action_items: { type: "array", items: { type: "string" } }
            }
          }
        },
        success_metrics: {
          type: "object",
          properties: {
            target_adoption_rate: { type: "number" },
            target_literacy_improvement: { type: "number" },
            target_completion_rate: { type: "number" }
          }
        }
      }
    };

    const plan = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    return Response.json(plan);
  } catch (error) {
    console.error('Onboarding plan generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});