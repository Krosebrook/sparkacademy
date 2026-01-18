import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { objectives, target_audience } = await req.json();

    const prompt = `Create a comprehensive course syllabus:

Learning Objectives: ${objectives}
Target Audience: ${target_audience}

Generate:
- Course title and description
- 4-8 modules with titles, topics, and duration

Format:
{
  "course_title": "...",
  "course_description": "...",
  "modules": [{
    "module_number": 0,
    "title": "...",
    "duration": "...",
    "topics": ["..."]
  }]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          course_title: { type: "string" },
          course_description: { type: "string" },
          modules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                module_number: { type: "number" },
                title: { type: "string" },
                duration: { type: "string" },
                topics: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Syllabus generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});