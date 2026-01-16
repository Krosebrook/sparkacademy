import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { integration_id, user_email } = await req.json();
    
    const integration = await base44.asServiceRole.entities.HRIntegration.get(integration_id);
    
    if (!integration.sync_settings?.push_learning_data) {
      return Response.json({ error: 'Learning data push not enabled' }, { status: 400 });
    }

    // Get user's learning progress
    const enrollments = await base44.asServiceRole.entities.Enrollment.filter({
      student_email: user_email
    });

    const certificates = await base44.asServiceRole.entities.Certificate.filter({
      student_email: user_email
    });

    // Calculate metrics
    const completedCourses = enrollments.filter(e => e.completion_percentage === 100).length;
    const totalHours = enrollments.reduce((sum, e) => sum + (e.time_spent_hours || 0), 0);
    const avgScore = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + (e.final_score || 0), 0) / enrollments.length
      : 0;

    const learningData = {
      employee_email: user_email,
      courses_completed: completedCourses,
      total_learning_hours: Math.round(totalHours),
      certificates_earned: certificates.length,
      average_score: Math.round(avgScore),
      last_updated: new Date().toISOString(),
      skills_acquired: []
    };

    // Get skills from completed courses
    const courseIds = enrollments.filter(e => e.completion_percentage === 100).map(e => e.course_id);
    const courses = await Promise.all(
      courseIds.map(id => base44.asServiceRole.entities.Course.get(id).catch(() => null))
    );
    
    learningData.skills_acquired = [...new Set(
      courses.filter(Boolean).flatMap(c => c.skills_taught || [])
    )];

    // Push to HR system
    if (integration.hr_system === 'workday') {
      const tenantUrl = Deno.env.get('WORKDAY_TENANT_URL');
      const username = Deno.env.get('WORKDAY_USERNAME');
      const password = Deno.env.get('WORKDAY_PASSWORD');

      const auth = btoa(`${username}:${password}`);
      await fetch(`${tenantUrl}/ccx/service/customreport2/learning_data`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(learningData)
      });
    } else if (integration.hr_system === 'bamboohr') {
      const apiKey = Deno.env.get('BAMBOOHR_API_KEY');
      const subdomain = Deno.env.get('BAMBOOHR_SUBDOMAIN');

      const auth = btoa(`${apiKey}:x`);
      
      // BambooHR doesn't have direct learning API, use custom fields
      await fetch(
        `https://api.bamboohr.com/api/gateway.php/${subdomain}/v1/employees/learning`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(learningData)
        }
      );
    }

    return Response.json({
      success: true,
      data: learningData
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});