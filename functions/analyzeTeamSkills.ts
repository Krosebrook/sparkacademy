import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organization_id, team_id } = await req.json();
    
    // Get team members
    const memberships = team_id 
      ? await base44.asServiceRole.entities.TeamMembership.filter({ team_id })
      : await base44.asServiceRole.entities.TeamMembership.list();
    
    const userEmails = memberships.map(m => m.user_email);
    
    // Get enrollments for team members
    const allEnrollments = await base44.asServiceRole.entities.Enrollment.list();
    const teamEnrollments = allEnrollments.filter(e => userEmails.includes(e.student_email));
    
    // Get courses
    const courseIds = [...new Set(teamEnrollments.map(e => e.course_id))];
    const courses = await Promise.all(
      courseIds.map(id => base44.asServiceRole.entities.Course.get(id))
    );
    
    // Extract skills from courses
    const skillMap = {};
    courses.forEach(course => {
      course.skills_taught?.forEach(skill => {
        if (!skillMap[skill]) {
          skillMap[skill] = { name: skill, learner_count: 0, total_proficiency: 0 };
        }
        const enrolledCount = teamEnrollments.filter(e => e.course_id === course.id).length;
        skillMap[skill].learner_count += enrolledCount;
        skillMap[skill].total_proficiency += enrolledCount * 70; // Placeholder proficiency
      });
    });
    
    const top_skills = Object.values(skillMap)
      .map(skill => ({
        ...skill,
        proficiency: Math.round(skill.total_proficiency / skill.learner_count)
      }))
      .sort((a, b) => b.learner_count - a.learner_count)
      .slice(0, 6);
    
    const skill_gaps = [
      { skill: 'Advanced Analytics', recommendation: 'Consider adding data science courses' },
      { skill: 'Leadership', recommendation: 'Team would benefit from management training' }
    ];

    return Response.json({ 
      top_skills,
      skill_gaps,
      total_skills: Object.keys(skillMap).length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});