/**
 * Predict Churn Risk
 * Calculates churn probability based on behavior trends
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch states
    const [lifecycleStates, retentionStates] = await Promise.all([
      base44.entities.LifecycleState?.filter({ user_email: user.email }).catch(() => []),
      base44.entities.RetentionState?.filter({ user_email: user.email }).catch(() => [])
    ]);

    const lifecycle = lifecycleStates?.[0];
    const retention = retentionStates?.[0];

    if (!lifecycle || !retention) {
      return Response.json({ error: 'Required state not found' }, { status: 404 });
    }

    // Extract signals
    const engagement = retention.engagement_metrics || {};
    const daysSinceLastAction = engagement.days_since_last_action || 0;
    const engagementTrend = lifecycle.engagement_trends?.engagement_trend_percent || 0;
    const currentState = lifecycle.current_state;
    const consecutiveWeeksActive = engagement.consecutive_weeks_active || 0;

    // Extract habit loop data
    const habitLoops = retention.habit_loops || {};
    const discoveryActive = habitLoops.discovery_loop?.active;
    const insightActive = habitLoops.insight_loop?.active;
    const socialActive = habitLoops.social_loop?.active;
    const activeLoopCount = [discoveryActive, insightActive, socialActive].filter(Boolean).length;

    // Calculate churn score (0-100)
    let churnScore = 0;
    const riskFactors = [];

    // 1. Inactivity window (0-40 points)
    if (daysSinceLastAction >= 21) {
      churnScore += 40;
      riskFactors.push('extended_inactivity');
    } else if (daysSinceLastAction >= 14) {
      churnScore += 25;
      riskFactors.push('increasing_inactivity');
    } else if (daysSinceLastAction >= 7) {
      churnScore += 10;
    }

    // 2. Engagement decline (0-35 points)
    if (engagementTrend < -50) {
      churnScore += 35;
      riskFactors.push('critical_engagement_drop');
    } else if (engagementTrend < -30) {
      churnScore += 20;
      riskFactors.push('significant_engagement_decline');
    } else if (engagementTrend < -10) {
      churnScore += 10;
    }

    // 3. Habit loop erosion (0-15 points)
    if (activeLoopCount === 0) {
      churnScore += 15;
      riskFactors.push('all_habit_loops_dormant');
    } else if (activeLoopCount === 1) {
      churnScore += 7;
    }

    // 4. Early exit (0-15 points) - quit shortly after activation
    if (consecutiveWeeksActive < 4 && engagementTrend < -30) {
      churnScore += 15;
      riskFactors.push('early_engagement_cliff');
    }

    // Cap at 100
    churnScore = Math.min(100, churnScore);

    // Determine risk level
    let riskLevel = 'low';
    if (churnScore >= 70) riskLevel = 'critical';
    else if (churnScore >= 50) riskLevel = 'high';
    else if (churnScore >= 30) riskLevel = 'moderate';

    // Determine primary risk factor
    let primaryRiskFactor = riskFactors[0] || 'unknown';

    // Update lifecycle state with churn risk
    const updatedChurnRisk = {
      churn_risk_score: churnScore,
      risk_level: riskLevel,
      primary_risk_factor: primaryRiskFactor,
      secondary_risk_factors: riskFactors.slice(1),
      last_risk_assessment_date: new Date().toISOString()
    };

    await base44.entities.LifecycleState?.update(lifecycle.id, {
      churn_risk: updatedChurnRisk,
      last_updated_date: new Date().toISOString()
    }).catch(() => {});

    return Response.json({
      success: true,
      churn_risk_score: churnScore,
      risk_level: riskLevel,
      primary_risk_factor: primaryRiskFactor,
      secondary_risk_factors: riskFactors.slice(1),
      should_trigger_intervention: riskLevel === 'high' || riskLevel === 'critical'
    });
  } catch (error) {
    console.error('Churn prediction error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});