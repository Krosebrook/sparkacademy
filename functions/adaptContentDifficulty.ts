import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { course_id, current_content, performance_metrics } = await req.json();

    const [employeeProfile, skillsPathway, engagements] = await Promise.all([
      base44.entities.EmployeeProfile.filter({ employee_email: user.email }).then(r => r[0]),
      base44.entities.SkillsPathway.filter({ employee_id: user.email, status: 'active' }).then(r => r[0]),
      base44.entities.AIContentEngagement.filter({ student_email: user.email, course_id })
    ]);

    // Analyze performance
    const avgCompletion = engagements?.reduce((sum, e) => 
      sum + (e.engagement_metrics?.completion_percentage || 0), 0) / (engagements?.length || 1);
    
    const avgQuizScore = engagements?.reduce((sum, e) => 
      sum + (e.performance_metrics?.quiz_score || 0), 0) / (engagements?.length || 1);

    const hasStruggles = engagements?.some(e => e.struggle_indicators?.length > 0);

    let difficultyAdjustment = 'maintain';
    if (avgCompletion > 90 && avgQuizScore > 85) {
      difficultyAdjustment = 'increase';
    } else if (avgCompletion < 50 || avgQuizScore < 60 || hasStruggles) {
      difficultyAdjustment = 'decrease';
    }

    const prompt = `You are an adaptive learning AI adjusting content difficulty based on student performance.

STUDENT CONTEXT:
- AI Experience: ${employeeProfile?.ai_experience_level}
- Current Pathway Level: ${skillsPathway?.current_level}
- Avg Completion: ${avgCompletion.toFixed(0)}%
- Avg Quiz Score: ${avgQuizScore.toFixed(0)}%
- Has Struggles: ${hasStruggles ? 'Yes' : 'No'}

CURRENT CONTENT:
${JSON.stringify(current_content, null, 2)}

PERFORMANCE METRICS:
${JSON.stringify(performance_metrics, null, 2)}

RECOMMENDATION: ${difficultyAdjustment.toUpperCase()} difficulty

Based on their performance, ${
  difficultyAdjustment === 'increase' 
    ? 'create a more challenging version with advanced concepts, complex examples, and harder exercises'
    : difficultyAdjustment === 'decrease'
    ? 'simplify the content with clearer explanations, more examples, and easier practice problems'
    : 'maintain current difficulty but provide additional support resources'
}.

Provide adapted content that matches their demonstrated capabilities.`;

    const schema = {
      type: "object",
      properties: {
        adapted_content: { type: "object" },
        difficulty_level: { 
          type: "string",
          enum: ["beginner", "intermediate", "advanced"]
        },
        adjustments_made: { type: "array", items: { type: "string" } },
        reasoning: { type: "string" },
        recommended_next_steps: { type: "array", items: { type: "string" } }
      }
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    // Update pathway progress if needed
    if (skillsPathway && difficultyAdjustment === 'increase') {
      const currentStageIdx = skillsPathway.stages?.findIndex(s => s.stage_number === skillsPathway.progress_percentage / 20) || 0;
      await base44.entities.SkillsPathway.update(skillsPathway.id, {
        progress_percentage: Math.min(100, skillsPathway.progress_percentage + 5)
      });
    }

    return Response.json(result);
  } catch (error) {
    console.error('Content adaptation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});