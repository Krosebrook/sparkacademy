import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organization_id, team_id } = await req.json();
    
    // Get teams and members
    const teams = team_id
      ? [await base44.asServiceRole.entities.Team.get(team_id)]
      : await base44.asServiceRole.entities.Team.filter({ organization_id });
    
    const allMemberships = await base44.asServiceRole.entities.TeamMembership.list();
    const teamMemberships = allMemberships.filter(m => 
      teams.some(t => t.id === m.team_id)
    );
    
    const userEmails = [...new Set(teamMemberships.map(m => m.user_email))];
    
    // Get all enrollments and courses
    const allEnrollments = await base44.asServiceRole.entities.Enrollment.list();
    const teamEnrollments = allEnrollments.filter(e => userEmails.includes(e.student_email));
    
    const courseIds = [...new Set(teamEnrollments.map(e => e.course_id))];
    const courses = await Promise.all(
      courseIds.map(id => base44.asServiceRole.entities.Course.get(id).catch(() => null))
    );
    
    // Analyze skills
    const skillMap = {};
    courses.filter(Boolean).forEach(course => {
      course.skills_taught?.forEach(skill => {
        if (!skillMap[skill]) {
          skillMap[skill] = {
            current_level: 0,
            target_level: 10,
            employees: new Set()
          };
        }
        
        const enrolled = teamEnrollments.filter(e => e.course_id === course.id);
        enrolled.forEach(e => {
          skillMap[skill].employees.add(e.student_email);
          const completion = e.completion_percentage || 0;
          skillMap[skill].current_level += (completion / 100) * 8;
        });
      });
    });
    
    // Calculate gaps
    const skill_gaps = Object.entries(skillMap).map(([skill, data]) => {
      const employeeCount = data.employees.size;
      const avgLevel = employeeCount > 0 ? data.current_level / employeeCount : 0;
      const gap = data.target_level - avgLevel;
      
      return {
        skill,
        current_level: Math.round(avgLevel * 10) / 10,
        target_level: data.target_level,
        gap_size: Math.round(gap * 10) / 10,
        affected_employees: employeeCount,
        priority: gap > 7 ? 'critical' : gap > 5 ? 'high' : gap > 3 ? 'medium' : 'low',
        recommended_courses: courses.filter(c => c.skills_taught?.includes(skill)).map(c => c.title).slice(0, 2)
      };
    }).sort((a, b) => b.gap_size - a.gap_size).slice(0, 10);
    
    const critical_gaps_count = skill_gaps.filter(g => g.priority === 'critical' || g.priority === 'high').length;
    const training_hours_needed = skill_gaps.reduce((sum, gap) => sum + (gap.gap_size * 10), 0);
    
    // ROI projections
    const roi_projections = {
      productivity_gain: Math.round(15 + (critical_gaps_count * 5)),
      cost_savings: Math.round(userEmails.length * 5000 * (critical_gaps_count / 10)),
      payback_months: Math.max(3, 12 - critical_gaps_count)
    };

    return Response.json({
      skill_gaps,
      critical_gaps_count,
      affected_employees: userEmails.length,
      training_hours_needed: Math.round(training_hours_needed),
      roi_projections
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});