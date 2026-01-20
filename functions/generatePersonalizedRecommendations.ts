import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { context } = await req.json();
    
    // Fetch student data
    const [enrollments, completedCourses, allCourses, learningGoal] = await Promise.all([
      base44.asServiceRole.entities.Enrollment.filter({ student_email: user.email }).catch(() => []),
      base44.asServiceRole.entities.Certificate.filter({ student_email: user.email }).catch(() => []),
      base44.asServiceRole.entities.Course.list().catch(() => []),
      base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email }).then(p => p[0]?.onboarding_progress?.learning_goal).catch(() => null)
    ]);

    if (!allCourses || allCourses.length === 0) {
      return Response.json({
        next_in_path: [],
        advanced_topics: [],
        skill_diversification: [],
        personalized_note: 'No courses available at this time.'
      });
    }

    const completedCourseIds = completedCourses.map(c => c.course_id);
    const inProgressCourses = enrollments.filter(e => 
      e.completion_percentage < 100 && e.completion_percentage > 0
    );
    
    const currentSkills = enrollments.map(e => {
      const course = allCourses.find(c => c.id === e.course_id);
      return course?.category || 'general';
    }).filter((v, i, a) => a.indexOf(v) === i);

    const avgEngagement = enrollments.reduce((sum, e) => sum + (e.engagement_score || 50), 0) / Math.max(enrollments.length, 1);
    const completionRate = (completedCourseIds.length / Math.max(enrollments.length, 1)) * 100;

    const prompt = `Analyze this student's learning data and recommend personalized courses:

STUDENT PROFILE:
- Learning Goal: ${learningGoal || 'Not specified'}
- Courses Completed: ${completedCourseIds.length}
- Courses In Progress: ${inProgressCourses.length}
- Average Engagement: ${avgEngagement.toFixed(1)}%
- Completion Rate: ${completionRate.toFixed(1)}%
- Current Skills: ${currentSkills.join(', ')}

COMPLETED COURSES:
${completedCourses.map(c => {
  const course = allCourses.find(co => co.id === c.course_id);
  return `- ${course?.title || 'Unknown'} (Level: ${course?.level || 'N/A'}, Category: ${course?.category || 'N/A'})`;
}).join('\n') || 'None'}

IN-PROGRESS COURSES:
${inProgressCourses.map(e => {
  const course = allCourses.find(c => c.id === e.course_id);
  return `- ${course?.title || 'Unknown'} (${e.completion_percentage}% complete, Level: ${course?.level || 'N/A'})`;
}).join('\n') || 'None'}

AVAILABLE COURSES:
${allCourses.filter(c => !completedCourseIds.includes(c.id) && !inProgressCourses.find(e => e.course_id === c.id)).slice(0, 20).map(c => 
  `- ID: ${c.id}, Title: ${c.title}, Level: ${c.level || 'intermediate'}, Category: ${c.category || 'general'}`
).join('\n')}

Context: ${context || 'General recommendations'}

Provide 3 types of recommendations:

1. NEXT IN LEARNING PATH (3-4 courses):
   - Natural progression from completed/in-progress courses
   - Aligned with learning goal
   - Sequential skill building
   
2. ADVANCED MASTERY TOPICS (2-3 courses):
   - Advanced topics in areas they've mastered
   - Deepens existing expertise
   - Higher difficulty level
   
3. SKILL DIVERSIFICATION (2-3 courses):
   - Complementary skills from different categories
   - Expands their skillset
   - Opens new opportunities

For each recommendation provide:
- course_id (from available courses)
- title
- reason (why this is recommended for THIS student)
- confidence_score (0-100)
- estimated_completion_weeks
- prerequisites_met (true/false)`;

    const schema = {
      type: "object",
      properties: {
        next_in_path: {
          type: "array",
          items: {
            type: "object",
            properties: {
              course_id: { type: "string" },
              title: { type: "string" },
              reason: { type: "string" },
              confidence_score: { type: "number" },
              estimated_completion_weeks: { type: "number" },
              prerequisites_met: { type: "boolean" }
            }
          }
        },
        advanced_topics: {
          type: "array",
          items: {
            type: "object",
            properties: {
              course_id: { type: "string" },
              title: { type: "string" },
              reason: { type: "string" },
              confidence_score: { type: "number" },
              estimated_completion_weeks: { type: "number" },
              prerequisites_met: { type: "boolean" }
            }
          }
        },
        skill_diversification: {
          type: "array",
          items: {
            type: "object",
            properties: {
              course_id: { type: "string" },
              title: { type: "string" },
              reason: { type: "string" },
              confidence_score: { type: "number" },
              estimated_completion_weeks: { type: "number" },
              prerequisites_met: { type: "boolean" }
            }
          }
        },
        personalized_note: { type: "string" }
      }
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    return Response.json(result);
  } catch (error) {
    console.error('Recommendations error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});