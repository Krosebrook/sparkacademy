import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { course_topic, learning_objectives, course_level, duration_weeks } = await req.json();

    const prompt = `You are an expert instructional designer. Create a comprehensive lesson plan for a course.

COURSE DETAILS:
- Topic: ${course_topic}
- Learning Objectives: ${learning_objectives}
- Level: ${course_level || 'intermediate'}
- Duration: ${duration_weeks || 8} weeks

Generate a detailed lesson plan with:

1. COURSE STRUCTURE:
   - Suggested number of lessons
   - Week-by-week breakdown
   - Lesson duration estimates

2. LESSON SEQUENCE (for each lesson):
   - Lesson number and title
   - Learning outcomes (what students will achieve)
   - Key topics to cover (3-5 main concepts)
   - Lesson duration (minutes)
   - Prerequisites (if any)

3. LEARNING ACTIVITIES (for each lesson):
   - Teaching methods (lecture, demonstration, discussion, etc.)
   - Interactive elements (polls, live coding, breakout rooms, etc.)
   - Hands-on practice activities
   - Real-world application examples
   - Estimated time for each activity

4. ASSESSMENTS (for each lesson):
   - Formative assessments (during lesson)
   - Summative assessments (end of lesson)
   - Quiz suggestions (3-5 questions)
   - Project/assignment ideas
   - Rubric criteria

5. INSTRUCTIONAL RESOURCES:
   - Required materials
   - Supplementary resources
   - Tools/software needed
   - Reading materials

Make it practical, actionable, and aligned with modern pedagogical principles. Ensure smooth progression from foundational to advanced concepts.`;

    const schema = {
      type: "object",
      properties: {
        course_overview: {
          type: "object",
          properties: {
            total_lessons: { type: "number" },
            total_weeks: { type: "number" },
            lesson_frequency: { type: "string" },
            course_flow: { type: "string" }
          }
        },
        lessons: {
          type: "array",
          items: {
            type: "object",
            properties: {
              lesson_number: { type: "number" },
              title: { type: "string" },
              learning_outcomes: { type: "array", items: { type: "string" } },
              key_topics: { type: "array", items: { type: "string" } },
              duration_minutes: { type: "number" },
              prerequisites: { type: "array", items: { type: "string" } },
              teaching_methods: { type: "array", items: { type: "string" } },
              interactive_elements: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    description: { type: "string" },
                    duration_minutes: { type: "number" }
                  }
                }
              },
              practice_activities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    activity: { type: "string" },
                    duration_minutes: { type: "number" },
                    difficulty: { type: "string" }
                  }
                }
              },
              assessments: {
                type: "object",
                properties: {
                  formative: { type: "array", items: { type: "string" } },
                  summative: { type: "string" },
                  quiz_questions: { type: "array", items: { type: "string" } },
                  project_idea: { type: "string" }
                }
              }
            }
          }
        },
        instructional_resources: {
          type: "object",
          properties: {
            required_materials: { type: "array", items: { type: "string" } },
            supplementary_resources: { type: "array", items: { type: "string" } },
            tools_software: { type: "array", items: { type: "string" } },
            reading_materials: { type: "array", items: { type: "string" } }
          }
        },
        pedagogical_notes: {
          type: "array",
          items: { type: "string" }
        }
      }
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    return Response.json(result);
  } catch (error) {
    console.error('Lesson plan generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});