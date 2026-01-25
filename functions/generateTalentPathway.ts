import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { employeeEmail, targetRole, timeframeMonths, organizationGoals } = await req.json();

    // Get employee profile
    const employees = await base44.asServiceRole.entities.EmployeeProfile.filter({
      employee_email: employeeEmail
    });
    const employee = employees[0];

    if (!employee) {
      return Response.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Generate AI-driven talent pathway
    const pathwayResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `As a talent development strategist, create a comprehensive career pathway.

**Current Employee Profile:**
- Current Role: ${employee.current_role}
- Department: ${employee.department}
- Current Skills: ${(employee.core_skills || []).join(', ')}
- Skill Gaps: ${(employee.skill_gaps || []).join(', ')}
- AI Experience: ${employee.ai_experience_level}
- Career Goals: ${(employee.career_goals || []).join(', ')}

**Target:**
- Target Role: ${targetRole}
- Timeframe: ${timeframeMonths} months
- Organization Goals: ${organizationGoals}

Create a detailed talent development pathway with:
1. Skill acquisition roadmap (prioritized)
2. Learning milestones and checkpoints
3. On-the-job development opportunities
4. Mentorship recommendations
5. Project assignments to build skills
6. Timeline with quarterly objectives
7. Success metrics and KPIs`,
      response_json_schema: {
        type: "object",
        properties: {
          pathway: {
            type: "array",
            items: {
              type: "object",
              properties: {
                quarter: { type: "string" },
                focus: { type: "string" },
                skillsToAcquire: { type: "array", items: { type: "string" } },
                learningActivities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      title: { type: "string" },
                      duration: { type: "string" },
                      priority: { type: "string" }
                    }
                  }
                },
                onTheJobOpportunities: { type: "array", items: { type: "string" } },
                milestone: { type: "string" },
                successCriteria: { type: "array", items: { type: "string" } }
              }
            }
          },
          mentorshipNeeds: {
            type: "array",
            items: {
              type: "object",
              properties: {
                area: { type: "string" },
                mentorProfile: { type: "string" },
                duration: { type: "string" }
              }
            }
          },
          projectAssignments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                skillsBuilt: { type: "array", items: { type: "string" } },
                estimatedDuration: { type: "string" },
                complexity: { type: "string" }
              }
            }
          },
          kpis: {
            type: "array",
            items: {
              type: "object",
              properties: {
                metric: { type: "string" },
                baseline: { type: "string" },
                target: { type: "string" },
                measurement: { type: "string" }
              }
            }
          },
          readinessScore: { type: "number" },
          estimatedSuccessProbability: { type: "number" }
        },
        required: ["pathway", "kpis", "readinessScore"]
      }
    });

    return Response.json({
      success: true,
      talentPathway: pathwayResponse,
      employee: {
        email: employeeEmail,
        currentRole: employee.current_role,
        targetRole
      }
    });

  } catch (error) {
    console.error('Error generating talent pathway:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});