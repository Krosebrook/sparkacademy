import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { topic, type, course_id } = await req.json();

    let prompt = '';
    let schema = {};

    if (type === 'peer_review') {
      prompt = `Generate peer review prompts for: "${topic}"

Create 5 thoughtful prompts that guide students to provide constructive feedback.`;

      schema = {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          prompts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                guidance: { type: "string" }
              }
            }
          }
        }
      };
    } else if (type === 'rubric') {
      prompt = `Generate an assessment rubric for: "${topic}"

Create 4-5 criteria with 4 performance levels each.`;

      schema = {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          criteria: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                levels: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      points: { type: "number" }
                    }
                  }
                }
              }
            }
          }
        }
      };
    } else if (type === 'scenario') {
      prompt = `Generate scenario-based assessment questions for: "${topic}"

Create 3 realistic scenarios that test application of knowledge.`;

      schema = {
        type: "object",
        properties: {
          title: { type: "string" },
          scenarios: {
            type: "array",
            items: {
              type: "object",
              properties: {
                scenario: { type: "string" },
                question: { type: "string" },
                expected_approach: { type: "string" }
              }
            }
          }
        }
      };
    } else {
      prompt = `Generate a portfolio project for: "${topic}"

Design a comprehensive project with requirements and deliverables.`;

      schema = {
        type: "object",
        properties: {
          title: { type: "string" },
          project: {
            type: "object",
            properties: {
              description: { type: "string" },
              requirements: {
                type: "array",
                items: { type: "string" }
              },
              deliverables: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        }
      };
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    return Response.json(result);
  } catch (error) {
    console.error('Advanced assessment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});