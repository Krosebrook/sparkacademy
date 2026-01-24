import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentSkills, learningGoal, targetRole, timeframe, proficiencyLevel } = await req.json();

    // Generate personalized learning path using AI
    const pathResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `As an expert learning path designer, create a comprehensive personalized learning roadmap.

**Current Skills:** ${JSON.stringify(currentSkills)}
**Learning Goal:** ${learningGoal}
**Target Role:** ${targetRole || 'N/A'}
**Timeframe:** ${timeframe} weeks
**Current Proficiency:** ${proficiencyLevel}

Analyze the skill gaps and create a structured learning path with:
1. Identified skill gaps (what's missing to reach the goal)
2. Recommended courses/modules in optimal learning sequence
3. Estimated time for each module
4. Prerequisites and dependencies
5. Milestone checkpoints
6. Practice projects to reinforce learning

Prioritize:
- Foundational skills first
- Logical progression from basics to advanced
- Practical, hands-on learning
- Real-world application opportunities`,
      response_json_schema: {
        type: "object",
        properties: {
          skillGaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                currentLevel: { type: "string" },
                targetLevel: { type: "string" },
                priority: { type: "string" },
                reason: { type: "string" }
              }
            }
          },
          learningPath: {
            type: "array",
            items: {
              type: "object",
              properties: {
                phase: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                modules: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      estimatedHours: { type: "number" },
                      topics: { type: "array", items: { type: "string" } },
                      prerequisites: { type: "array", items: { type: "string" } },
                      skillsGained: { type: "array", items: { type: "string" } }
                    }
                  }
                },
                estimatedWeeks: { type: "number" },
                milestone: { type: "string" }
              }
            }
          },
          practiceProjects: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                phase: { type: "string" },
                skills: { type: "array", items: { type: "string" } },
                difficulty: { type: "string" }
              }
            }
          },
          totalEstimatedHours: { type: "number" },
          recommendations: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["skillGaps", "learningPath", "totalEstimatedHours"]
      }
    });

    return Response.json({
      success: true,
      path: pathResponse,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating personalized path:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});