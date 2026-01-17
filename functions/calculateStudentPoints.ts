/**
 * Calculate and Award Student Points
 * Gamification engine that awards points for:
 * - Course completion
 * - Quiz performance
 * - Engagement activities
 * - Streak maintenance
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enrollments = await base44.entities.Enrollment.filter({ 
      student_email: user.email 
    });

    let totalPointsEarned = 0;
    const pointsTransactions = [];

    // 1. Completion points
    for (const enrollment of enrollments) {
      const completionRate = enrollment.completion_percentage || 0;
      
      if (completionRate === 100 && !enrollment.completion_points_awarded) {
        const completionPoints = 500; // Base completion points
        totalPointsEarned += completionPoints;
        pointsTransactions.push({
          student_email: user.email,
          course_id: enrollment.course_id,
          activity_type: 'course_completion',
          points: completionPoints,
          timestamp: new Date().toISOString()
        });
      }
    }

    // 2. Quiz performance points
    for (const enrollment of enrollments) {
      const avgScore = enrollment.quiz_average || 0;
      if (avgScore > 0) {
        let quizPoints = 0;
        if (avgScore >= 90) quizPoints = 300; // Excellence
        else if (avgScore >= 80) quizPoints = 200; // Good
        else if (avgScore >= 70) quizPoints = 100; // Satisfactory
        
        if (quizPoints > 0) {
          totalPointsEarned += quizPoints;
          pointsTransactions.push({
            student_email: user.email,
            course_id: enrollment.course_id,
            activity_type: 'quiz_performance',
            points: quizPoints,
            quiz_score: avgScore,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    // 3. Engagement activity points
    const discussions = await base44.entities.CourseDiscussion?.filter({ 
      student_email: user.email 
    }).catch(() => []);
    
    const discussionPoints = Math.min(discussions.length * 10, 200); // Max 200 points
    if (discussionPoints > 0) {
      totalPointsEarned += discussionPoints;
      pointsTransactions.push({
        student_email: user.email,
        activity_type: 'engagement',
        points: discussionPoints,
        details: `${discussions.length} discussions`,
        timestamp: new Date().toISOString()
      });
    }

    // 4. Streak bonus points
    const streaks = await base44.entities.CourseStreak?.filter({ 
      student_email: user.email 
    }).catch(() => []);
    
    for (const streak of streaks) {
      const streakPoints = Math.floor(streak.current_streak_days / 7) * 50; // 50 points per week
      if (streakPoints > 0) {
        totalPointsEarned += streakPoints;
        pointsTransactions.push({
          student_email: user.email,
          course_id: streak.course_id,
          activity_type: 'streak_bonus',
          points: streakPoints,
          streak_days: streak.current_streak_days,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Update or create student points record
    const existingPoints = await base44.entities.StudentPoints?.filter({ 
      student_email: user.email 
    }).catch(() => []);

    if (existingPoints.length > 0) {
      await base44.entities.StudentPoints.update(existingPoints[0].id, {
        total_points: (existingPoints[0].total_points || 0) + totalPointsEarned,
        lifetime_points: (existingPoints[0].lifetime_points || 0) + totalPointsEarned,
        last_earned_date: new Date().toISOString()
      });
    } else {
      await base44.entities.StudentPoints.create({
        student_email: user.email,
        total_points: totalPointsEarned,
        lifetime_points: totalPointsEarned,
        last_earned_date: new Date().toISOString()
      });
    }

    // Award badges based on achievements
    const badges = [];
    if (enrollments.filter(e => e.completion_percentage === 100).length >= 1) {
      badges.push('first_course_completed');
    }
    if (enrollments.filter(e => e.completion_percentage === 100).length >= 5) {
      badges.push('power_learner');
    }
    if (totalPointsEarned >= 1000) {
      badges.push('point_collector');
    }
    if (streaks.some(s => s.current_streak_days >= 30)) {
      badges.push('consistency_champion');
    }

    for (const badgeId of badges) {
      const existingBadge = await base44.entities.UserBadge?.filter({ 
        student_email: user.email, 
        badge_id: badgeId 
      }).catch(() => []);
      
      if (!existingBadge.length) {
        await base44.entities.UserBadge?.create({
          student_email: user.email,
          badge_id: badgeId,
          earned_date: new Date().toISOString()
        }).catch(() => {});
      }
    }

    return Response.json({
      success: true,
      total_points_earned: totalPointsEarned,
      transactions: pointsTransactions,
      badges_earned: badges
    });
  } catch (error) {
    console.error('Error calculating points:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});