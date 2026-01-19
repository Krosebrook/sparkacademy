import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { course_id, step_id } = await req.json();

    // Get or create learning path progress
    const progressRecords = await base44.asServiceRole.entities.LearningPathProgress.filter({
      user_email: user.email,
      course_id
    });

    let progress = progressRecords[0];

    if (progress) {
      // Update existing progress - mark step as complete
      const adaptationHistory = progress.adaptation_history || [];
      adaptationHistory.push({
        date: new Date().toISOString(),
        adaptation: `Completed step: ${step_id}`,
        reason: 'Student progress'
      });

      await base44.asServiceRole.entities.LearningPathProgress.update(progress.id, {
        adaptation_history: adaptationHistory
      });
    } else {
      // Create new progress record
      await base44.asServiceRole.entities.LearningPathProgress.create({
        user_email: user.email,
        course_id,
        knowledge_gaps: [],
        recommended_resources: [],
        adaptation_history: [{
          date: new Date().toISOString(),
          adaptation: `Completed step: ${step_id}`,
          reason: 'Student progress'
        }]
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Update progress error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});