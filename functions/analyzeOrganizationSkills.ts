import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { organizationId } = await req.json();

    // Get all employees for the organization
    const employees = await base44.asServiceRole.entities.EmployeeProfile.filter({
      organization_id: organizationId
    });

    // Get all enrollments and completions
    const enrollments = await base44.asServiceRole.entities.Enrollment.list();
    const certificates = await base44.asServiceRole.entities.Certificate.list();

    // Use AI to analyze skills landscape
    const analysisResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `As an enterprise talent analytics expert, analyze this organization's skills landscape.

**Organization Data:**
- Total Employees: ${employees.length}
- Departments: ${[...new Set(employees.map(e => e.department))].join(', ')}

**Employee Skills:**
${JSON.stringify(employees.map(e => ({
  department: e.department,
  role: e.current_role,
  skills: e.core_skills || [],
  skill_gaps: e.skill_gaps || [],
  experience: e.ai_experience_level
})), null, 2)}

Provide comprehensive analysis:
1. Organization-wide skill inventory
2. Department skill distribution
3. Critical skill gaps by department
4. Emerging vs. legacy skill trends
5. Skill coverage percentage by category
6. High-demand skills across organization
7. Recommendations for strategic skill development`,
      response_json_schema: {
        type: "object",
        properties: {
          skillInventory: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                totalEmployees: { type: "number" },
                departments: { type: "array", items: { type: "string" } },
                proficiencyLevels: {
                  type: "object",
                  properties: {
                    beginner: { type: "number" },
                    intermediate: { type: "number" },
                    advanced: { type: "number" },
                    expert: { type: "number" }
                  }
                }
              }
            }
          },
          departmentSkills: {
            type: "array",
            items: {
              type: "object",
              properties: {
                department: { type: "string" },
                employeeCount: { type: "number" },
                topSkills: { type: "array", items: { type: "string" } },
                criticalGaps: { type: "array", items: { type: "string" } },
                skillCoverage: { type: "number" },
                healthScore: { type: "number" }
              }
            }
          },
          criticalGaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                affectedDepartments: { type: "array", items: { type: "string" } },
                urgency: { type: "string" },
                impactScore: { type: "number" },
                recommendedAction: { type: "string" }
              }
            }
          },
          skillTrends: {
            type: "object",
            properties: {
              emerging: { type: "array", items: { type: "string" } },
              declining: { type: "array", items: { type: "string" } },
              stable: { type: "array", items: { type: "string" } }
            }
          },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                priority: { type: "string" },
                recommendation: { type: "string" },
                expectedImpact: { type: "string" },
                estimatedCost: { type: "string" }
              }
            }
          }
        },
        required: ["skillInventory", "departmentSkills", "criticalGaps"]
      }
    });

    return Response.json({
      success: true,
      analysis: analysisResponse,
      metadata: {
        organizationId,
        totalEmployees: employees.length,
        analyzedDate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error analyzing organization skills:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});