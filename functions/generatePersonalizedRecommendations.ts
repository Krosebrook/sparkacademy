/**
 * Generate Personalized Course Recommendations
 * 
 * AI-powered recommendation engine that analyzes:
 * - Learning history and completion patterns
 * - Quiz scores and performance metrics
 * - Engagement patterns and time spent
 * - Stated interests and goals
 * 
 * @returns {Object} Personalized course recommendations and learning paths
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's learning data
    const enrollments = await base44.entities.Enrollment.filter({ student_email: user.email });
    const allCourses = await base44.entities.Course.list();
    const learningPaths = await base44.entities.LearningPathProgress.filter({ user_email: user.email });
    const badges = await base44.entities.UserBadge.filter({ user_email: user.email });

    // Calculate performance metrics
    const completionRate = enrollments.length > 0 
      ? enrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / enrollments.length 
      : 0;

    const avgQuizScore = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + (e.quiz_average || 0), 0) / enrollments.length
      : 0;

    // Identify completed courses and categories
    const completedCourses = enrollments.filter(e => e.completion_percentage >= 100);
    const inProgressCourses = enrollments.filter(e => e.completion_percentage > 0 && e.completion_percentage < 100);
    
    const completedCategories = [...new Set(
      completedCourses.map(e => {
        const course = allCourses.find(c => c.id === e.course_id);
        return course?.category;
      }).filter(Boolean)
    )];

    // Get knowledge gaps and interests
    const knowledgeGaps = learningPaths.flatMap(lp => lp.knowledge_gaps || []);
    const interests = user.interests || [];

    // Generate AI recommendations
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this student's learning profile and recommend personalized courses and learning paths.

Student Profile:
- Completion Rate: ${completionRate.toFixed(1)}%
- Average Quiz Score: ${avgQuizScore.toFixed(1)}%
- Completed Courses: ${completedCourses.length}
- In-Progress Courses: ${inProgressCourses.length}
- Completed Categories: ${completedCategories.join(', ') || 'None'}
- Stated Interests: ${interests.join(', ') || 'Not specified'}
- Badges Earned: ${badges.length}
- Knowledge Gaps: ${knowledgeGaps.map(k => k.topic).join(', ') || 'None identified'}

Available Courses:
${allCourses.map(c => `- ${c.title} (${c.category}) - ${c.description?.substring(0, 100)}...`).join('\n')}

Provide:
1. Top 5 recommended courses with specific reasons
2. 3 personalized learning paths (sequences of courses)
3. Skills to develop based on their progress
4. Engagement recommendations to improve completion rate`,
      response_json_schema: {
        type: "object",
        properties: {
          top_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                course_title: { type: "string" },
                course_id: { type: "string" },
                match_score: { type: "number" },
                reasons: { type: "array", items: { type: "string" } },
                estimated_time: { type: "string" },
                difficulty_match: { type: "string" }
              }
            }
          },
          learning_paths: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path_name: { type: "string" },
                goal: { type: "string" },
                courses: { type: "array", items: { type: "string" } },
                total_duration: { type: "string" },
                skills_gained: { type: "array", items: { type: "string" } }
              }
            }
          },
          skills_to_develop: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                current_level: { type: "string" },
                target_level: { type: "string" },
                recommended_courses: { type: "array", items: { type: "string" } }
              }
            }
          },
          engagement_tips: {
            type: "array",
            items: { type: "string" }
          },
          next_best_action: { type: "string" }
        }
      }
    });

    // Store recommendations
    await base44.entities.CourseRecommendation.create({
      student_email: user.email,
      recommendations: result.top_recommendations,
      learning_paths: result.learning_paths,
      generated_date: new Date().toISOString(),
      based_on_metrics: {
        completion_rate: completionRate,
        avg_quiz_score: avgQuizScore,
        courses_completed: completedCourses.length
      }
    });

    return Response.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});