import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { assignment_content, student_response, rubric } = await req.json();

    const employeeProfile = await base44.entities.EmployeeProfile.filter({ 
      employee_email: user.email 
    }).then(r => r[0]);

    const prompt = `You are an AI teaching assistant providing personalized feedback on student assignments.

STUDENT PROFILE:
- AI Experience: ${employeeProfile?.ai_experience_level || 'beginner'}
- Role: ${employeeProfile?.current_role || 'Professional'}

ASSIGNMENT:
${assignment_content}

STUDENT RESPONSE:
${student_response}

${rubric ? `GRADING RUBRIC:\n${rubric}` : ''}

Provide comprehensive feedback:
1. Overall assessment and strengths
2. Areas for improvement with specific examples
3. Score or grade (if rubric provided)
4. Actionable next steps
5. Encouraging comments

Be constructive, specific, and tailored to their experience level.`;

    const schema = {
      type: "object",
      properties: {
        overall_assessment: { type: "string" },
        strengths: { type: "array", items: { type: "string" } },
        areas_for_improvement: {
          type: "array",
          items: {
            type: "object",
            properties: {
              area: { type: "string" },
              feedback: { type: "string" },
              example: { type: "string" }
            }
          }
        },
        score: { type: "number" },
        next_steps: { type: "array", items: { type: "string" } },
        encouraging_message: { type: "string" }
      }
    };

    const feedback = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    return Response.json(feedback);
  } catch (error) {
    console.error('Assignment feedback error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});