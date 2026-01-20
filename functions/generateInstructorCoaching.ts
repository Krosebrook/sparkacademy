import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { course_id } = await req.json();
    
    if (!course_id) {
      return Response.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Fetch course analytics data
    const [enrollments, course, feedback] = await Promise.all([
      base44.asServiceRole.entities.Enrollment.filter({ course_id }).catch(() => []),
      base44.asServiceRole.entities.Course.get(course_id).catch(() => null),
      base44.asServiceRole.entities.CourseFeedback.filter({ course_id }).catch(() => [])
    ]);
    
    if (!course) {
      return Response.json({ error: 'Course not found' }, { status: 404 });
    }
    
    if (!enrollments || enrollments.length === 0) {
      return Response.json({
        executive_summary: 'No enrollment data available yet. Start by inviting students to your course.',
        top_priorities: [],
        content_improvements: [],
        engagement_strategies: ['Build your student base', 'Share your course with potential students'],
        at_risk_interventions: [],
        success_metrics: {
          weekly_kpis: ['Track first enrollments'],
          thirty_day_goals: ['Achieve 10+ enrollments'],
          long_term_targets: []
        },
        teaching_effectiveness: {
          strengths: [],
          areas_for_growth: [],
          pro_development: []
        }
      });
    }

    const avgEngagement = enrollments.reduce((sum, e) => sum + (e.engagement_score || 50), 0) / Math.max(enrollments.length, 1);
    const completionRate = (enrollments.filter(e => e.completion_percentage === 100).length / Math.max(enrollments.length, 1)) * 100;
    const atRiskCount = enrollments.filter(e => 
      (Date.now() - new Date(e.last_activity_date).getTime()) > 7 * 24 * 60 * 60 * 1000 &&
      e.completion_percentage < 50
    ).length;

    const prompt = `Analyze this course performance and provide personalized instructor coaching:

Course: ${course.title}
Total Students: ${enrollments.length}
Average Engagement: ${avgEngagement.toFixed(1)}%
Completion Rate: ${completionRate.toFixed(1)}%
At-Risk Students: ${atRiskCount}

Student Feedback Summary:
${feedback.slice(0, 5).map(f => `- Rating: ${f.rating}/5 - "${f.comments}"`).join('\n') || 'No feedback yet'}

Provide comprehensive coaching recommendations:

1. TOP PRIORITIES (3-5 immediate actions)
   - Specific, actionable items ranked by impact
   - Focus on what will move the needle most

2. CONTENT IMPROVEMENTS
   - Which lessons/topics need revision
   - Why they're problematic (engagement, confusion, completion data)
   - Specific improvement suggestions

3. ENGAGEMENT STRATEGIES
   - Tactics to boost student activity
   - Interactive elements to add
   - Community building approaches

4. AT-RISK INTERVENTION
   - Proactive outreach strategies
   - Personalization tactics
   - Support structures to implement

5. STUDENT SUCCESS METRICS
   - Key indicators to monitor weekly
   - Goals for next 30 days
   - Long-term targets

6. TEACHING EFFECTIVENESS
   - What's working well (maintain/amplify)
   - What needs adjustment
   - Professional development suggestions

Make recommendations data-driven, specific, and actionable.`;

    const schema = {
      type: "object",
      properties: {
        executive_summary: { type: "string" },
        top_priorities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              priority: { type: "string" },
              impact: { type: "string" },
              effort: { type: "string" },
              timeline: { type: "string" },
              action_steps: { type: "array", items: { type: "string" } }
            }
          }
        },
        content_improvements: {
          type: "array",
          items: {
            type: "object",
            properties: {
              lesson_topic: { type: "string" },
              issue: { type: "string" },
              data_evidence: { type: "string" },
              recommendation: { type: "string" }
            }
          }
        },
        engagement_strategies: {
          type: "array",
          items: { type: "string" }
        },
        at_risk_interventions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              strategy: { type: "string" },
              when_to_use: { type: "string" },
              template: { type: "string" }
            }
          }
        },
        success_metrics: {
          type: "object",
          properties: {
            weekly_kpis: { type: "array", items: { type: "string" } },
            thirty_day_goals: { type: "array", items: { type: "string" } },
            long_term_targets: { type: "array", items: { type: "string" } }
          }
        },
        teaching_effectiveness: {
          type: "object",
          properties: {
            strengths: { type: "array", items: { type: "string" } },
            areas_for_growth: { type: "array", items: { type: "string" } },
            pro_development: { type: "array", items: { type: "string" } }
          }
        }
      }
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    return Response.json(result);
  } catch (error) {
    console.error('Instructor coaching error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});