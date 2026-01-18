import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { achievement_type, points_earned } = await req.json();

    // Get or create student points record
    let studentPoints = await base44.entities.StudentPoints?.filter({ 
      student_email: user.email 
    }).then(res => res?.[0]);

    if (!studentPoints) {
      studentPoints = await base44.entities.StudentPoints?.create({
        student_email: user.email,
        total_points: 0,
        lifetime_points: 0,
        achievements: {}
      });
    }

    // Update points
    const newTotalPoints = (studentPoints.total_points || 0) + points_earned;
    const newLifetimePoints = (studentPoints.lifetime_points || 0) + points_earned;
    const achievements = studentPoints.achievements || {};

    // Update achievement counter
    if (achievement_type === 'course_completed') {
      achievements.courses_completed = (achievements.courses_completed || 0) + 1;
    } else if (achievement_type === 'quiz_passed') {
      achievements.quizzes_passed = (achievements.quizzes_passed || 0) + 1;
    } else if (achievement_type === 'streak_day') {
      achievements.streak_days = (achievements.streak_days || 0) + 1;
    } else if (achievement_type === 'discussion') {
      achievements.discussions_participated = (achievements.discussions_participated || 0) + 1;
    }

    await base44.entities.StudentPoints?.update(studentPoints.id, {
      total_points: newTotalPoints,
      lifetime_points: newLifetimePoints,
      achievements,
      last_earned_date: new Date().toISOString()
    });

    // Update leaderboard
    const leaderboardEntry = await base44.entities.LeaderboardEntry?.filter({ 
      student_email: user.email 
    }).then(res => res?.[0]);

    if (leaderboardEntry) {
      await base44.entities.LeaderboardEntry?.update(leaderboardEntry.id, {
        score: newTotalPoints,
        courses_completed: achievements.courses_completed || 0
      });
    } else {
      await base44.entities.LeaderboardEntry?.create({
        student_email: user.email,
        student_name: user.full_name,
        score: newTotalPoints,
        courses_completed: achievements.courses_completed || 0
      });
    }

    // Check for badge eligibility
    const badges = await base44.asServiceRole.entities.Badge?.list();
    const userBadges = await base44.entities.UserBadge?.filter({ student_email: user.email });
    const earnedBadgeIds = userBadges?.map(ub => ub.badge_id) || [];
    const newBadges = [];

    for (const badge of badges) {
      if (earnedBadgeIds.includes(badge.id)) continue;

      let eligible = false;
      if (badge.criteria_type === 'courses_completed' && 
          achievements.courses_completed >= badge.criteria_value) {
        eligible = true;
      } else if (badge.criteria_type === 'points_earned' && 
                 newTotalPoints >= badge.criteria_value) {
        eligible = true;
      } else if (badge.criteria_type === 'streak_days' && 
                 achievements.streak_days >= badge.criteria_value) {
        eligible = true;
      }

      if (eligible) {
        await base44.entities.UserBadge?.create({
          student_email: user.email,
          badge_id: badge.id,
          earned_date: new Date().toISOString()
        });
        newBadges.push(badge);
      }
    }

    return Response.json({
      success: true,
      points_awarded: points_earned,
      total_points: newTotalPoints,
      new_badges: newBadges
    });
  } catch (error) {
    console.error('Award badge and points error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});