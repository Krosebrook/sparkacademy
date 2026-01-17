/**
 * Generate AI Course Content
 * Creates course outlines, lesson plans, quiz questions, and resource suggestions
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      content_type, // 'outline', 'lesson_plan', 'quiz', 'resources'
      topic,
      level, // 'beginner', 'intermediate', 'advanced'
      duration_hours,
      lesson_text, // for quiz generation
      external_source // for resource suggestions
    } = await req.json();

    let result;

    if (content_type === 'outline') {
      result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a comprehensive course outline for teaching "${topic}" at ${level} level, with estimated ${duration_hours} hours of content.

Provide:
1. Course learning objectives (5-7 key outcomes)
2. Course structure with 5-8 main modules
3. Estimated duration per module
4. Key concepts covered
5. Skills students will gain`,
        response_json_schema: {
          type: "object",
          properties: {
            learning_objectives: { type: "array", items: { type: "string" } },
            modules: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  duration_hours: { type: "number" },
                  topics: { type: "array", items: { type: "string" } }
                }
              }
            },
            skills_gained: { type: "array", items: { type: "string" } },
            assessment_methods: { type: "array", items: { type: "string" } }
          }
        }
      });
    } else if (content_type === 'lesson_plan') {
      result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a detailed lesson plan for teaching "${topic}" at ${level} level, lasting ${duration_hours} hours.

Include:
1. Learning objectives (SMART goals)
2. Introduction/hook activity
3. Main content sections with explanations
4. Interactive activities or exercises
5. Example scenarios or case studies
6. Summary/key takeaways
7. Assessment questions
8. Homework/follow-up assignments`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            objectives: { type: "array", items: { type: "string" } },
            introduction: { type: "string" },
            content_sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  section_title: { type: "string" },
                  content: { type: "string" },
                  duration_minutes: { type: "number" }
                }
              }
            },
            activities: { type: "array", items: { type: "string" } },
            summary: { type: "string" },
            assessment_questions: { type: "array", items: { type: "string" } },
            homework: { type: "array", items: { type: "string" } }
          }
        }
      });
    } else if (content_type === 'quiz') {
      result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create 10 quiz questions based on this lesson text. Include a mix of question types.

Lesson Text:
${lesson_text}

For each question provide:
1. Question text
2. 4 multiple choice options
3. Correct answer
4. Explanation
5. Difficulty level (easy/medium/hard)`,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "string" },
                  explanation: { type: "string" },
                  difficulty: { type: "string" }
                }
              }
            }
          }
        }
      });
    } else if (content_type === 'resources') {
      result = await base44.integrations.Core.InvokeLLM({
        prompt: `Suggest relevant external resources for teaching "${topic}" at ${level} level. Provide actual, well-known resources.

Include:
1. Video resources (YouTube channels, courses)
2. Articles and blog posts
3. Books and textbooks
4. Interactive tools
5. Podcasts
6. Online communities

For each resource, provide the title, description, URL if available, and why it's valuable.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            videos: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  source: { type: "string" },
                  description: { type: "string" },
                  why_valuable: { type: "string" }
                }
              }
            },
            articles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  source: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            tools: { type: "array", items: { type: "string" } },
            books: { type: "array", items: { type: "string" } }
          }
        }
      });
    }

    return Response.json({
      success: true,
      content_type,
      generated_content: result
    });
  } catch (error) {
    console.error('Error generating content:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});