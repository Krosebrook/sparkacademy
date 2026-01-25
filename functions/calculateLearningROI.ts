import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { organizationId, timeframeDays } = await req.json();

    // Get organization and employees
    const organizations = await base44.asServiceRole.entities.ClientOrganization.filter({
      id: organizationId
    });
    const organization = organizations[0];

    const employees = await base44.asServiceRole.entities.EmployeeProfile.filter({
      organization_id: organizationId
    });

    // Get learning data
    const enrollments = await base44.asServiceRole.entities.Enrollment.list();
    const certificates = await base44.asServiceRole.entities.Certificate.list();
    const pathways = await base44.asServiceRole.entities.SkillsPathway.list();

    const orgEnrollments = enrollments.filter(e => 
      employees.some(emp => emp.employee_email === e.student_email)
    );

    const orgCertificates = certificates.filter(c =>
      employees.some(emp => emp.employee_email === c.student_email)
    );

    // Calculate metrics
    const totalLearningHours = employees.reduce((sum, e) => 
      sum + (e.platform_engagement?.total_learning_hours || 0), 0
    );

    const completionRate = orgEnrollments.length > 0
      ? (orgCertificates.length / orgEnrollments.length) * 100
      : 0;

    // Use AI to calculate comprehensive ROI
    const roiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `As a learning ROI analyst, calculate comprehensive returns on learning investment.

**Organization Metrics:**
- Total Employees: ${employees.length}
- Active Learners: ${orgEnrollments.length}
- Courses Completed: ${orgCertificates.length}
- Total Learning Hours: ${totalLearningHours}
- Completion Rate: ${completionRate.toFixed(1)}%
- Timeframe: ${timeframeDays} days

**Industry Benchmarks:**
- Average training cost per employee: $1,200/year
- Productivity gain from training: 15-25%
- Retention improvement: 20-30%
- Time-to-proficiency reduction: 25-35%

Calculate ROI with:
1. Direct cost savings (reduced external training, faster onboarding)
2. Productivity improvements (efficiency gains, quality improvements)
3. Retention benefits (reduced turnover costs)
4. Innovation metrics (new skills enabling new capabilities)
5. Overall ROI percentage and dollar value
6. Projected 12-month returns`,
      response_json_schema: {
        type: "object",
        properties: {
          costSavings: {
            type: "object",
            properties: {
              externalTrainingReduction: { type: "number" },
              fasterOnboarding: { type: "number" },
              reducedConsultingFees: { type: "number" },
              total: { type: "number" }
            }
          },
          productivityGains: {
            type: "object",
            properties: {
              efficiencyImprovement: { type: "number" },
              qualityImprovements: { type: "number" },
              timeToMarket: { type: "number" },
              total: { type: "number" }
            }
          },
          retentionBenefits: {
            type: "object",
            properties: {
              reducedTurnover: { type: "number" },
              recruitmentCostsSaved: { type: "number" },
              knowledgeRetention: { type: "number" },
              total: { type: "number" }
            }
          },
          innovationMetrics: {
            type: "object",
            properties: {
              newCapabilities: { type: "number" },
              processImprovements: { type: "number" },
              competitiveAdvantage: { type: "string" }
            }
          },
          overallROI: {
            type: "object",
            properties: {
              totalInvestment: { type: "number" },
              totalReturns: { type: "number" },
              roiPercentage: { type: "number" },
              paybackPeriodMonths: { type: "number" }
            }
          },
          projections: {
            type: "object",
            properties: {
              sixMonthROI: { type: "number" },
              twelveMonthROI: { type: "number" },
              compoundingBenefits: { type: "string" }
            }
          }
        },
        required: ["costSavings", "productivityGains", "overallROI"]
      }
    });

    return Response.json({
      success: true,
      roi: roiResponse,
      metrics: {
        totalEmployees: employees.length,
        activeEnrollments: orgEnrollments.length,
        completedCourses: orgCertificates.length,
        totalLearningHours,
        completionRate: completionRate.toFixed(1)
      }
    });

  } catch (error) {
    console.error('Error calculating ROI:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});