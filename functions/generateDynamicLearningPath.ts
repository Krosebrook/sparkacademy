import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { course_id, confusion_points } = await req.json();

    // Gather comprehensive user data
    const [course, enrollments, userProfile, pathProgress, quizAttempts] = await Promise.all([
      base44.asServiceRole.entities.Course.get(course_id),
      base44.asServiceRole.entities.Enrollment.filter({
        course_id,
        student_email: user.email
      }),
      base44.asServiceRole.entities.User.get(user.email),
      base44.asServiceRole.entities.LearningPathProgress.filter({
        user_email: user.email,
        course_id
      }),
      base44.asServiceRole.entities.Enrollment.filter({
        course_id,
        student_email: user.email
      }).catch(() => [])
    ]);

    const enrollment = enrollments[0];
    const progress = pathProgress[0];
    const learningGoal = userProfile?.learning_goal || '';

    // Calculate performance metrics
    const completionRate = enrollment?.completion_percentage || 0;
    const completedLessons = enrollment?.completed_lessons || [];
    const knowledgeGaps = progress?.knowledge_gaps || [];

    // Build comprehensive context for AI
    const context = {
      learning_goal: learningGoal,
      current_progress: completionRate,
      completed_lessons_count: completedLessons.length,
      confusion_points: confusion_points?.map(c => ({
        topic: c.topic,
        severity: c.severity
      })) || [],
      knowledge_gaps: knowledgeGaps,
      course_structure: course?.lessons || []
    };

    const prompt = `Create a dynamic, personalized learning path for this student:

Student Context:
- Learning Goal: ${learningGoal || 'Complete the course'}
- Current Progress: ${completionRate}%
- Completed Lessons: ${completedLessons.length}
- Recent Confusion Points: ${JSON.stringify(confusion_points || [])}
- Identified Knowledge Gaps: ${JSON.stringify(knowledgeGaps)}

Course: ${course?.title}

Analyze the student's performance and create an adaptive learning path that:

1. **Identifies Priority Topics**: Based on confusion points and knowledge gaps, determine what topics need immediate attention
2. **Sequences Next Steps**: Order the next 5-7 learning steps optimally, considering dependencies and current understanding
3. **Suggests Supplementary Resources**: Recommend additional materials to fill specific gaps
4. **Adjusts for Goal**: Align the path with their learning goal
5. **Provides Rationale**: Explain why the path was adjusted this way

Generate a comprehensive learning path that adapts to their needs.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          mastery_level: { 
            type: "number",
            description: "0-100 score of current mastery"
          },
          completed_steps: { type: "number" },
          total_steps: { type: "number" },
          path_adjustments: {
            type: "string",
            description: "Brief explanation of why path was adjusted"
          },
          priority_topics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                reason: { type: "string" },
                urgency: { 
                  type: "string",
                  enum: ["high", "medium", "low"]
                },
                recommended_action: { type: "string" }
              }
            }
          },
          next_steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                type: { 
                  type: "string",
                  description: "lesson, practice, review, etc."
                },
                estimated_time: { type: "string" },
                completed: { type: "boolean" }
              }
            }
          },
          supplementary_resources: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                type: { 
                  type: "string",
                  description: "video, article, exercise, etc."
                },
                addresses_gap: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Save/update the learning path progress
    if (progress) {
      await base44.asServiceRole.entities.LearningPathProgress.update(progress.id, {
        knowledge_gaps: result.priority_topics || [],
        recommended_resources: result.supplementary_resources || []
      });
    } else {
      await base44.asServiceRole.entities.LearningPathProgress.create({
        user_email: user.email,
        course_id,
        knowledge_gaps: result.priority_topics || [],
        recommended_resources: result.supplementary_resources || []
      });
    }

    return Response.json(result);
  } catch (error) {
    console.error('Dynamic learning path error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});