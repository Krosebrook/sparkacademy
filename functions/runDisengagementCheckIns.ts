import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // This should be called by a scheduled automation or admin
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all active enrollments
    const enrollments = await base44.asServiceRole.entities.Enrollment.list();
    
    // Group by user
    const userEmails = [...new Set(enrollments.map(e => e.student_email))];
    
    const results = {
      users_analyzed: 0,
      check_ins_created: 0,
      users_at_risk: []
    };

    for (const userEmail of userEmails) {
      results.users_analyzed++;

      // Check for existing pending check-ins to avoid spam
      const existingCheckIns = await base44.asServiceRole.entities.TutorCheckIn.filter({
        user_email: userEmail,
        status: 'pending'
      });

      if (existingCheckIns.length > 0) {
        continue; // Skip if user already has pending check-ins
      }

      // Detect disengagement
      const { data: disengagement } = await base44.asServiceRole.functions.invoke('detectDisengagement', {
        user_email: userEmail
      });

      if (!disengagement.needs_intervention || disengagement.at_risk_courses.length === 0) {
        continue;
      }

      const topRisk = disengagement.at_risk_courses[0];
      const { data: checkInResult } = await base44.asServiceRole.functions.invoke('generateCheckIn', {
        user_email: userEmail,
        course_id: topRisk.course_id,
        trigger_reason: topRisk.primary_trigger,
        disengagement_score: topRisk.disengagement_score,
        days_since_activity: topRisk.days_since_activity,
        completion_rate: topRisk.completion_rate
      });

      if (checkInResult.success) {
        results.check_ins_created++;
        results.users_at_risk.push({
          user_email: userEmail,
          course: topRisk.course_title,
          risk_score: topRisk.disengagement_score
        });
      }
    }

    return Response.json({
      success: true,
      summary: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Disengagement check-in error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});