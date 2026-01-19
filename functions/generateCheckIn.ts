import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      user_email, 
      course_id, 
      trigger_reason, 
      disengagement_score,
      days_since_activity,
      completion_rate 
    } = await req.json();

    // Get course details
    const course = await base44.asServiceRole.entities.Course.get(course_id);
    
    // Get user's learning goal if set
    const userProfile = await base44.asServiceRole.entities.User.get(user_email);
    const learningGoal = userProfile?.learning_goal || '';

    // Generate personalized check-in using AI
    const prompt = `You are an empathetic AI tutor conducting a proactive check-in with a learner who shows signs of disengagement.

Context:
- Course: ${course?.title || 'their course'}
- Days since last activity: ${days_since_activity}
- Course completion: ${completion_rate}%
- Trigger reason: ${trigger_reason}
- Disengagement score: ${disengagement_score}/100
- Learning goal: ${learningGoal || 'Not specified'}

Create a warm, encouraging check-in message (2-3 sentences) that:
1. Acknowledges their situation without being judgmental
2. Offers specific, actionable help
3. Motivates them to re-engage

Also provide 3-4 personalized suggestions with types (resource/tip/encouragement/goal_adjustment).

Format as JSON:
{
  "message": "Personalized check-in message",
  "suggestions": [
    {
      "type": "resource|tip|encouragement|goal_adjustment",
      "content": "Specific suggestion",
      "action_url": "Optional URL to resource"
    }
  ]
}`;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          message: { type: "string" },
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                content: { type: "string" },
                action_url: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Create check-in record
    const checkIn = await base44.asServiceRole.entities.TutorCheckIn.create({
      user_email,
      course_id,
      trigger_reason,
      disengagement_score,
      message: aiResponse.message,
      suggestions: aiResponse.suggestions,
      status: 'pending'
    });

    return Response.json({
      check_in: checkIn,
      success: true
    });

  } catch (error) {
    console.error('Check-in generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});