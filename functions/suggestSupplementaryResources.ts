import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { course_content, topic } = await req.json();

    const prompt = `Based on this course content about "${topic}", suggest relevant supplementary learning resources:

Course Content Summary:
${course_content}

Suggest:
- Articles and blogs
- Video tutorials
- Interactive tools/platforms
- Books or documentation
- Practice exercises
- Real-world case studies

For each resource, provide title, type, description, and estimated difficulty level.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          resources: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                type: { 
                  type: "string",
                  enum: ["article", "video", "tool", "book", "exercise", "case_study"]
                },
                description: { type: "string" },
                difficulty: {
                  type: "string",
                  enum: ["beginner", "intermediate", "advanced"]
                },
                estimated_time: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Resource suggestion error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});