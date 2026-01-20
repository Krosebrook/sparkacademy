import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch student data
    const [enrollments, certificates, badges, courses] = await Promise.all([
      base44.asServiceRole.entities.Enrollment.filter({ student_email: user.email }).catch(() => []),
      base44.asServiceRole.entities.Certificate.filter({ student_email: user.email }).catch(() => []),
      base44.asServiceRole.entities.UserBadge.filter({ user_email: user.email }).catch(() => []),
      base44.asServiceRole.entities.Course.list().catch(() => [])
    ]);

    const completedCourses = certificates.map(cert => {
      const course = courses.find(c => c.id === cert.course_id);
      return {
        id: cert.course_id,
        title: course?.title || 'Unknown Course',
        category: course?.category || 'general',
        level: course?.level || 'intermediate',
        completion_date: cert.issued_date
      };
    });

    const inProgressCourses = enrollments.filter(e => 
      e.completion_percentage > 0 && e.completion_percentage < 100
    ).map(e => {
      const course = courses.find(c => c.id === e.course_id);
      return {
        title: course?.title || 'Unknown',
        category: course?.category || 'general',
        progress: e.completion_percentage
      };
    });

    const prompt = `Analyze this student's learning journey and provide AI-powered portfolio building suggestions:

COMPLETED COURSES (${completedCourses.length}):
${completedCourses.map(c => `- ${c.title} (${c.category}, ${c.level})`).join('\n') || 'None yet'}

IN-PROGRESS COURSES (${inProgressCourses.length}):
${inProgressCourses.map(c => `- ${c.title} (${c.progress}% complete)`).join('\n') || 'None'}

BADGES EARNED: ${badges.length}

Generate comprehensive portfolio building suggestions:

1. PORTFOLIO HEADLINE (1 compelling sentence)
   - Showcase their unique value proposition
   - Based on skills acquired

2. BIO SUGGESTIONS (2-3 versions):
   - Short version (2-3 sentences)
   - Medium version (4-5 sentences)
   - Professional summary highlighting journey

3. PROJECT IDEAS (5-7 projects):
   - Based on completed courses and skills
   - Realistic, portfolio-worthy projects
   - Include: title, description, technologies, difficulty, estimated time
   - Mix beginner-friendly and advanced projects

4. SKILLS TO HIGHLIGHT (10-15 skills):
   - Categorized (technical, soft skills, tools)
   - Proficiency level based on courses
   - Priority ranking for visibility

5. PRESENTATION TIPS (5-7 actionable tips):
   - How to structure portfolio
   - What to emphasize
   - Visual presentation ideas
   - Industry best practices

6. ACHIEVEMENT SHOWCASE IDEAS:
   - How to present certificates
   - How to highlight badges
   - Metrics to include

Make suggestions specific, actionable, and tailored to their learning path.`;

    const schema = {
      type: "object",
      properties: {
        portfolio_headline: { type: "string" },
        bio_suggestions: {
          type: "object",
          properties: {
            short: { type: "string" },
            medium: { type: "string" },
            professional: { type: "string" }
          }
        },
        project_ideas: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              technologies: { type: "array", items: { type: "string" } },
              difficulty: { type: "string" },
              estimated_hours: { type: "number" },
              why_build_it: { type: "string" }
            }
          }
        },
        skills_to_highlight: {
          type: "array",
          items: {
            type: "object",
            properties: {
              skill_name: { type: "string" },
              category: { type: "string" },
              proficiency: { type: "string" },
              priority: { type: "string" }
            }
          }
        },
        presentation_tips: {
          type: "array",
          items: {
            type: "object",
            properties: {
              tip: { type: "string" },
              category: { type: "string" }
            }
          }
        },
        achievement_showcase: {
          type: "object",
          properties: {
            certificates_display: { type: "string" },
            badges_display: { type: "string" },
            metrics_to_include: { type: "array", items: { type: "string" } }
          }
        }
      }
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    return Response.json(result);
  } catch (error) {
    console.error('Portfolio suggestions error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});