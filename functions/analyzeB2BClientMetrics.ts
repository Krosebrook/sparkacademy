import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organization_id, include_benchmarks } = await req.json();

    // Fetch organization data
    const [organizations, employees, pathways, engagements] = await Promise.all([
      organization_id 
        ? base44.asServiceRole.entities.ClientOrganization.filter({ id: organization_id })
        : base44.asServiceRole.entities.ClientOrganization.list(),
      organization_id
        ? base44.asServiceRole.entities.EmployeeProfile.filter({ organization_id })
        : base44.asServiceRole.entities.EmployeeProfile.list(),
      organization_id
        ? base44.asServiceRole.entities.SkillsPathway.filter({ organization_id })
        : base44.asServiceRole.entities.SkillsPathway.list(),
      base44.asServiceRole.entities.AIContentEngagement.list()
    ]);

    const org = organization_id ? organizations[0] : null;
    const orgEmployees = organization_id ? employees : [];

    // Calculate adoption metrics
    const adoptionMetrics = {
      total_employees: org ? org.total_employees : employees.length,
      enrolled_employees: orgEmployees.length,
      adoption_rate: org ? (orgEmployees.length / org.total_employees) * 100 : 0,
      active_learners_30_days: orgEmployees.filter(e => {
        const lastLogin = new Date(e.platform_engagement?.last_login_date || 0);
        const daysAgo = (Date.now() - lastLogin) / (1000 * 60 * 60 * 24);
        return daysAgo <= 30;
      }).length
    };

    // Department breakdown
    const departmentStats = {};
    orgEmployees.forEach(emp => {
      if (!departmentStats[emp.department]) {
        departmentStats[emp.department] = {
          employee_count: 0,
          active_count: 0,
          avg_engagement_score: 0,
          total_engagement: 0,
          skill_gaps: {}
        };
      }
      
      const dept = departmentStats[emp.department];
      dept.employee_count++;
      dept.total_engagement += emp.platform_engagement?.engagement_score || 0;
      
      if (emp.platform_engagement?.last_login_date) {
        const daysAgo = (Date.now() - new Date(emp.platform_engagement.last_login_date)) / (1000 * 60 * 60 * 24);
        if (daysAgo <= 30) dept.active_count++;
      }

      emp.skill_gaps?.forEach(gap => {
        dept.skill_gaps[gap] = (dept.skill_gaps[gap] || 0) + 1;
      });
    });

    Object.keys(departmentStats).forEach(dept => {
      const stats = departmentStats[dept];
      stats.avg_engagement_score = stats.employee_count > 0 
        ? stats.total_engagement / stats.employee_count 
        : 0;
      stats.adoption_rate = (stats.employee_count / adoptionMetrics.total_employees) * 100;
      stats.top_skill_gaps = Object.entries(stats.skill_gaps)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([gap, count]) => ({ skill: gap, employee_count: count }));
    });

    // AI literacy distribution
    const literacyDistribution = {
      none: orgEmployees.filter(e => e.ai_experience_level === 'none').length,
      beginner: orgEmployees.filter(e => e.ai_experience_level === 'beginner').length,
      intermediate: orgEmployees.filter(e => e.ai_experience_level === 'intermediate').length,
      advanced: orgEmployees.filter(e => e.ai_experience_level === 'advanced').length
    };

    const avgLiteracyScore = calculateAvgLiteracyScore(literacyDistribution, orgEmployees.length);

    // Engagement metrics
    const totalLearningHours = orgEmployees.reduce((sum, e) => 
      sum + (e.platform_engagement?.total_learning_hours || 0), 0);
    const totalCoursesCompleted = orgEmployees.reduce((sum, e) => 
      sum + (e.platform_engagement?.courses_completed || 0), 0);
    const avgEngagementHours = orgEmployees.length > 0 ? totalLearningHours / orgEmployees.length : 0;

    // Skill gaps analysis
    const allSkillGaps = {};
    orgEmployees.forEach(emp => {
      emp.skill_gaps?.forEach(gap => {
        allSkillGaps[gap] = (allSkillGaps[gap] || 0) + 1;
      });
    });

    const topSkillGaps = Object.entries(allSkillGaps)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({
        skill,
        affected_employees: count,
        percentage: (count / orgEmployees.length) * 100,
        severity: count / orgEmployees.length > 0.3 ? 'high' : 
                 count / orgEmployees.length > 0.15 ? 'medium' : 'low'
      }));

    // Predictive interventions
    const interventions = generateInterventions(topSkillGaps, departmentStats, adoptionMetrics);

    // Industry benchmarks (simulated - would be real data)
    const industryBenchmarks = org ? {
      industry_type: org.organization_type,
      industry_avg_literacy_score: 65,
      industry_avg_adoption_rate: 45,
      industry_avg_engagement_hours: 12,
      organization_percentile: {
        literacy: Math.round((avgLiteracyScore / 65) * 100),
        adoption: Math.round((adoptionMetrics.adoption_rate / 45) * 100),
        engagement: Math.round((avgEngagementHours / 12) * 100)
      }
    } : null;

    return Response.json({
      organization_summary: org ? {
        name: org.organization_name,
        type: org.organization_type,
        total_employees: org.total_employees,
        subscription_tier: org.subscription_tier
      } : null,
      adoption_metrics: adoptionMetrics,
      engagement_metrics: {
        total_learning_hours: totalLearningHours,
        avg_learning_hours_per_employee: avgEngagementHours,
        total_courses_completed: totalCoursesCompleted,
        active_pathways: pathways.filter(p => p.status === 'active').length
      },
      ai_literacy: {
        distribution: literacyDistribution,
        avg_score: avgLiteracyScore,
        by_department: departmentStats
      },
      department_breakdown: departmentStats,
      skill_gaps_analysis: {
        top_gaps: topSkillGaps,
        total_unique_gaps: Object.keys(allSkillGaps).length
      },
      predictive_interventions: interventions,
      industry_benchmarks: industryBenchmarks
    });
  } catch (error) {
    console.error('B2B analytics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateAvgLiteracyScore(distribution, total) {
  if (total === 0) return 0;
  const scores = { none: 0, beginner: 25, intermediate: 50, advanced: 100 };
  let weightedSum = 0;
  Object.entries(distribution).forEach(([level, count]) => {
    weightedSum += scores[level] * count;
  });
  return Math.round(weightedSum / total);
}

function generateInterventions(skillGaps, deptStats, adoption) {
  const interventions = [];

  // Low adoption intervention
  if (adoption.adoption_rate < 40) {
    interventions.push({
      priority: 'high',
      type: 'adoption',
      title: 'Low Platform Adoption',
      description: `Only ${adoption.adoption_rate.toFixed(1)}% of employees are enrolled`,
      recommended_action: 'Launch organization-wide AI awareness campaign and onboarding program',
      estimated_impact: 'Could increase adoption by 25-30%'
    });
  }

  // Department-specific interventions
  Object.entries(deptStats).forEach(([dept, stats]) => {
    if (stats.avg_engagement_score < 40) {
      interventions.push({
        priority: 'medium',
        type: 'engagement',
        title: `Low Engagement in ${dept}`,
        description: `${dept} shows engagement score of ${stats.avg_engagement_score.toFixed(1)}`,
        recommended_action: `Create department-specific AI use cases and targeted workshops for ${dept}`,
        estimated_impact: 'Could improve engagement by 15-20%'
      });
    }
  });

  // Skill gap interventions
  skillGaps.slice(0, 3).forEach(gap => {
    if (gap.severity === 'high') {
      interventions.push({
        priority: 'high',
        type: 'skill_gap',
        title: `Critical Skill Gap: ${gap.skill}`,
        description: `${gap.affected_employees} employees (${gap.percentage.toFixed(1)}%) lack this skill`,
        recommended_action: `Deploy mandatory training module on ${gap.skill}`,
        estimated_impact: 'Could reduce skill gap by 60-70% in 8 weeks'
      });
    }
  });

  return interventions.sort((a, b) => 
    (a.priority === 'high' ? 0 : 1) - (b.priority === 'high' ? 0 : 1)
  );
}