/**
 * Analyze At-Risk Students
 * Identifies students likely to drop out based on:
 * - Engagement decline
 * - Performance trends
 * - Participation patterns
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin' && user?.role !== 'creator') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { course_id } = await req.json();
    if (!course_id) {
      return Response.json({ error: 'course_id required' }, { status: 400 });
    }

    const enrollments = await base44.entities.Enrollment.filter({ course_id });
    
    const atRiskAnalysis = [];

    for (const enrollment of enrollments) {
      let riskScore = 0;
      const riskFactors = [];

      // 1. Low completion rate
      if (enrollment.completion_percentage < 25) {
        riskScore += 40;
        riskFactors.push('Very low course progress (<25%)');
      } else if (enrollment.completion_percentage < 50) {
        riskScore += 20;
        riskFactors.push('Low course progress (<50%)');
      }

      // 2. Quiz performance decline
      if (enrollment.quiz_average && enrollment.quiz_average < 60) {
        riskScore += 30;
        riskFactors.push('Low quiz scores (<60%)');
      }

      // 3. Engagement decline
      const lastActiveDate = new Date(enrollment.last_activity_date);
      const daysInactive = Math.floor((Date.now() - lastActiveDate) / (1000 * 60 * 60 * 24));
      
      if (daysInactive > 14) {
        riskScore += 25;
        riskFactors.push(`No activity for ${daysInactive} days`);
      } else if (daysInactive > 7) {
        riskScore += 10;
        riskFactors.push(`Inactive for ${daysInactive} days`);
      }

      // 4. Decreasing engagement
      const discussionCount = enrollment.discussion_posts || 0;
      if (discussionCount === 0) {
        riskScore += 15;
        riskFactors.push('No discussion participation');
      }

      if (riskScore > 0) {
        atRiskAnalysis.push({
          student_email: enrollment.student_email,
          student_name: enrollment.student_name,
          risk_score: Math.min(riskScore, 100),
          risk_level: riskScore > 70 ? 'critical' : riskScore > 40 ? 'high' : 'medium',
          risk_factors: riskFactors,
          completion_percentage: enrollment.completion_percentage,
          quiz_average: enrollment.quiz_average,
          days_inactive: daysInactive,
          enrolled_date: enrollment.created_date
        });
      }
    }

    // Sort by risk score
    atRiskAnalysis.sort((a, b) => b.risk_score - a.risk_score);

    return Response.json({
      success: true,
      total_students: enrollments.length,
      at_risk_count: atRiskAnalysis.length,
      at_risk_students: atRiskAnalysis,
      risk_distribution: {
        critical: atRiskAnalysis.filter(s => s.risk_level === 'critical').length,
        high: atRiskAnalysis.filter(s => s.risk_level === 'high').length,
        medium: atRiskAnalysis.filter(s => s.risk_level === 'medium').length
      }
    });
  } catch (error) {
    console.error('Error analyzing at-risk students:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});