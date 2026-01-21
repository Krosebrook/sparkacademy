import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { lesson_topic, lesson_content, target_audience } = await req.json();

    const prompt = `You are an expert educator who excels at connecting theory to practice. Suggest real-world examples and current events to enrich lesson content.

LESSON TOPIC: ${lesson_topic}
LESSON CONTENT: ${lesson_content}
TARGET AUDIENCE: ${target_audience || 'general'}

Generate suggestions for integrating real-world examples including:

1. CURRENT EVENTS (5-7 recent examples):
   - Event description
   - How it relates to lesson concepts
   - Discussion questions
   - Source/reference
   - Timeliness (how recent)

2. INDUSTRY APPLICATIONS (5-7 examples):
   - Real company/organization using this concept
   - Specific use case
   - Impact/results
   - What students can learn
   - Career relevance

3. HISTORICAL CONTEXT (3-5 examples):
   - Historical event/milestone
   - Lesson connection
   - Evolution of the concept
   - Why it matters today

4. CASE STUDIES (3-5 detailed scenarios):
   - Scenario title
   - Background context
   - Problem/challenge
   - How lesson concepts apply
   - Discussion points
   - Learning outcomes

5. INTEGRATION SUGGESTIONS:
   - When to introduce each example
   - How to facilitate discussion
   - Activities around examples
   - Assessment opportunities

Make suggestions current (2024-2026), diverse, and engaging for ${target_audience || 'all learners'}.`;

    const schema = {
      type: "object",
      properties: {
        current_events: {
          type: "array",
          items: {
            type: "object",
            properties: {
              event_title: { type: "string" },
              description: { type: "string" },
              lesson_connection: { type: "string" },
              discussion_questions: { type: "array", items: { type: "string" } },
              source: { type: "string" },
              date: { type: "string" },
              relevance_score: { type: "string" }
            }
          }
        },
        industry_applications: {
          type: "array",
          items: {
            type: "object",
            properties: {
              company_organization: { type: "string" },
              use_case: { type: "string" },
              impact: { type: "string" },
              learning_points: { type: "array", items: { type: "string" } },
              career_relevance: { type: "string" }
            }
          }
        },
        historical_context: {
          type: "array",
          items: {
            type: "object",
            properties: {
              event_milestone: { type: "string" },
              lesson_connection: { type: "string" },
              evolution: { type: "string" },
              modern_relevance: { type: "string" }
            }
          }
        },
        case_studies: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              background: { type: "string" },
              challenge: { type: "string" },
              concept_application: { type: "string" },
              discussion_points: { type: "array", items: { type: "string" } },
              learning_outcomes: { type: "array", items: { type: "string" } }
            }
          }
        },
        integration_guide: {
          type: "array",
          items: {
            type: "object",
            properties: {
              suggestion: { type: "string" },
              timing: { type: "string" },
              activity_type: { type: "string" }
            }
          }
        }
      }
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema,
      add_context_from_internet: true
    });

    return Response.json(result);
  } catch (error) {
    console.error('Real-world examples generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});