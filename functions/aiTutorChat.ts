import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, lessonId, question, courseContent, conversationHistory } = await req.json();

    // Get student's learning history
    const metrics = await base44.entities.CourseEngagementMetrics.filter({
      course_id: courseId,
      student_email: user.email
    });

    const studentContext = metrics[0] || {};
    
    // Build context-aware prompt
    const prompt = `You are an intelligent AI tutor helping a student in their course. Be supportive, clear, and pedagogical.

Course Context: ${courseContent}
Current Lesson: ${lessonId}

Student's Learning History:
- Progress: ${studentContext.progress_percentage || 0}%
- Quiz Performance: ${JSON.stringify(studentContext.quiz_performance || [])}
- Recent Struggles: ${JSON.stringify(studentContext.struggle_indicators?.slice(-3) || [])}

Conversation History:
${conversationHistory?.map(msg => `${msg.role}: ${msg.content}`).join('\n') || 'None'}

Student Question: ${question}

Provide a helpful response that:
1. Answers their question clearly
2. Explains the concept at their level
3. Provides relevant examples
4. Offers hints, not direct answers for assignments
5. Encourages critical thinking`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false
    });

    // Track interaction
    await base44.functions.invoke('trackEngagement', {
      courseId,
      engagementType: 'ai_tutor',
      data: {
        question,
        lessonContext: lessonId
      }
    });

    return Response.json({ 
      response,
      tutorAdvice: response
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});