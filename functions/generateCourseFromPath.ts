import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { moduleTitle, moduleDescription, topics, targetLevel, estimatedHours } = await req.json();

    // Generate complete course content for the module
    const courseContent = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a comprehensive course for this module:

**Module Title:** ${moduleTitle}
**Description:** ${moduleDescription}
**Topics to Cover:** ${topics.join(', ')}
**Target Level:** ${targetLevel}
**Estimated Duration:** ${estimatedHours} hours

Generate a complete course structure with:
1. Detailed syllabus with learning objectives
2. Lesson plans for each topic (5-7 lessons)
3. Quiz questions (10-15 per topic)
4. Hands-on assignments/projects
5. Assessment criteria
6. Additional resources and references

Make it practical, engaging, and focused on real-world application.`,
      response_json_schema: {
        type: "object",
        properties: {
          syllabus: {
            type: "object",
            properties: {
              overview: { type: "string" },
              learningObjectives: { type: "array", items: { type: "string" } },
              prerequisites: { type: "array", items: { type: "string" } },
              outcomes: { type: "array", items: { type: "string" } }
            }
          },
          lessons: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                duration: { type: "string" },
                objectives: { type: "array", items: { type: "string" } },
                content: { type: "string" },
                keyPoints: { type: "array", items: { type: "string" } },
                activities: { type: "array", items: { type: "string" } },
                resources: { type: "array", items: { type: "string" } }
              }
            }
          },
          quizzes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                lessonTitle: { type: "string" },
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      type: { type: "string" },
                      options: { type: "array", items: { type: "string" } },
                      correctAnswer: { type: "string" },
                      explanation: { type: "string" }
                    }
                  }
                }
              }
            }
          },
          assignments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                objectives: { type: "array", items: { type: "string" } },
                deliverables: { type: "array", items: { type: "string" } },
                evaluationCriteria: { type: "array", items: { type: "string" } },
                estimatedTime: { type: "string" }
              }
            }
          },
          resources: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                type: { type: "string" },
                description: { type: "string" },
                url: { type: "string" }
              }
            }
          }
        },
        required: ["syllabus", "lessons", "quizzes"]
      }
    });

    return Response.json({
      success: true,
      course: courseContent,
      metadata: {
        moduleTitle,
        estimatedHours,
        targetLevel,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating course content:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});