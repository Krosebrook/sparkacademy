import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { question, context, course_id, lesson_topic } = await req.json();

    // Get student's learning context
    const [employeeProfile, skillsPathway, enrollments] = await Promise.all([
      base44.entities.EmployeeProfile.filter({ employee_email: user.email }).then(r => r[0]),
      base44.entities.SkillsPathway.filter({ employee_id: user.email, status: 'active' }).then(r => r[0]),
      course_id ? base44.entities.Enrollment.filter({ student_email: user.email, course_id }) : Promise.resolve([])
    ]);

    const prompt = `You are an expert AI tutor for INTInc's corporate AI training platform. Provide clear, helpful, and personalized responses to employee questions.

STUDENT CONTEXT:
- Role: ${employeeProfile?.current_role || 'Not specified'}
- Department: ${employeeProfile?.department || 'Not specified'}
- AI Experience: ${employeeProfile?.ai_experience_level || 'beginner'}
- Learning Pathway: ${skillsPathway?.pathway_name || 'General AI literacy'}
${lesson_topic ? `- Current Topic: ${lesson_topic}` : ''}

STUDENT QUESTION:
${question}

${context ? `ADDITIONAL CONTEXT:\n${context}` : ''}

Provide:
1. A clear, concise answer tailored to their experience level
2. Practical examples relevant to their role/department
3. Follow-up suggestions for deeper learning
4. Related concepts they should explore

Be encouraging, supportive, and adapt your explanation to their background.`;

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt
    });

    return Response.json({
      answer: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI tutor error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});