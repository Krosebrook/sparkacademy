import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { topic } = await req.json();

    const prompt = `Create diverse assessments for: ${topic}

Generate:
1. Essay with prompt and rubric
2. Coding challenge with requirements and grading
3. Peer review task with guidelines

Format:
{
  "essay": {
    "prompt": "...",
    "rubric": [{"criterion": "...", "points": 0, "description": "..."}]
  },
  "coding": {
    "challenge": "...",
    "requirements": ["..."],
    "grading": [{"aspect": "...", "weight": 0}]
  },
  "peer_review": {
    "task": "...",
    "guidelines": ["..."]
  }
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          essay: {
            type: "object",
            properties: {
              prompt: { type: "string" },
              rubric: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    criterion: { type: "string" },
                    points: { type: "number" },
                    description: { type: "string" }
                  }
                }
              }
            }
          },
          coding: {
            type: "object",
            properties: {
              challenge: { type: "string" },
              requirements: {
                type: "array",
                items: { type: "string" }
              },
              grading: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    aspect: { type: "string" },
                    weight: { type: "number" }
                  }
                }
              }
            }
          },
          peer_review: {
            type: "object",
            properties: {
              task: { type: "string" },
              guidelines: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Assessment generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});