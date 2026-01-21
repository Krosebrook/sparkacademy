import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organization_id } = await req.json();

    // Fetch organization and employee data
    const [organization, employees, benchmarks] = await Promise.all([
      base44.asServiceRole.entities.ClientOrganization.filter({ id: organization_id }).then(r => r[0]),
      base44.asServiceRole.entities.EmployeeProfile.filter({ organization_id }),
      base44.asServiceRole.entities.ClientAILiteracyBenchmark.filter({ organization_id }).then(r => r[0])
    ]);

    if (!organization) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    const prompt = `You are an AI training consultant for INTInc. Perform a comprehensive initial assessment of a client organization's AI literacy needs.

ORGANIZATION PROFILE:
- Name: ${organization.organization_name}
- Industry: ${organization.organization_type}
- Total Employees: ${organization.total_employees}
- Subscription Tier: ${organization.subscription_tier}
- Departments: ${JSON.stringify(organization.departments)}
- Custom Training Focus: ${organization.custom_training_focus?.join(', ')}

CURRENT STATE:
- Enrolled Employees: ${employees.length}
- Adoption Rate: ${((employees.length / organization.total_employees) * 100).toFixed(1)}%

EMPLOYEE DATA:
${employees.map(emp => `
- Department: ${emp.department}, Role: ${emp.current_role}, AI Experience: ${emp.ai_experience_level}
`).slice(0, 20).join('')}

${benchmarks ? `
EXISTING BENCHMARK DATA:
- Avg AI Literacy: ${benchmarks.organization_metrics?.avg_ai_literacy_score}
- Completion Rate: ${benchmarks.organization_metrics?.course_completion_rate}%
` : ''}

Based on this data, provide:
1. Assessment of current AI literacy level (none, basic, intermediate, advanced)
2. Priority training areas for this organization
3. Industry-specific AI needs and applications
4. Risk factors (low adoption, skill gaps, department disparities)
5. Opportunities for quick wins and high-impact training

Be specific and actionable.`;

    const schema = {
      type: "object",
      properties: {
        current_ai_literacy_level: {
          type: "string",
          enum: ["none", "basic", "intermediate", "advanced"]
        },
        priority_training_areas: {
          type: "array",
          items: { type: "string" }
        },
        industry_specific_needs: {
          type: "array",
          items: { type: "string" }
        },
        risk_factors: {
          type: "array",
          items: { type: "string" }
        },
        opportunities: {
          type: "array",
          items: { type: "string" }
        },
        recommended_focus_departments: {
          type: "array",
          items: { type: "string" }
        },
        estimated_time_to_proficiency_weeks: {
          type: "number"
        }
      }
    };

    const assessment = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    return Response.json({
      organization,
      assessment,
      employee_count: employees.length,
      adoption_rate: ((employees.length / organization.total_employees) * 100).toFixed(1)
    });
  } catch (error) {
    console.error('Client assessment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});