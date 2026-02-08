import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all courses and enrollment data
    const allCourses = await base44.asServiceRole.entities.Course.list();
    const enrollments = await base44.asServiceRole.entities.Enrollment.list();
    const skillGaps = await base44.asServiceRole.entities.SkillGapAnalysis.list();

    // Calculate trending courses
    const enrollmentCounts = {};
    enrollments.forEach(e => {
      enrollmentCounts[e.course_id] = (enrollmentCounts[e.course_id] || 0) + 1;
    });

    const prompt = `Analyze these courses and create curated collections for a learning platform.

Courses:
${allCourses.map(c => `ID: ${c.id}, Title: ${c.title}, Category: ${c.category}, Level: ${c.level}, Tags: ${c.tags?.join(', ')}, Enrollments: ${enrollmentCounts[c.id] || 0}`).join('\n')}

Skill Gap Data:
${JSON.stringify(skillGaps.slice(0, 10))}

Create collections for:
1. Trending Now - Most popular courses this month
2. Essential Skills - Must-have foundational courses
3. Career Accelerators - Advanced courses for career growth
4. Quick Wins - Short courses for immediate impact
5. Skill Gap Closers - Courses addressing common gaps
6. Industry Hot Topics - Emerging technology & trends

For each collection, select 5-8 courses with clear rationale.`;

    const collections = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          collections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                icon: { type: 'string' },
                course_ids: { type: 'array', items: { type: 'string' } },
                rationale: { type: 'string' },
                target_audience: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Enrich with course data
    const enrichedCollections = collections.collections.map(col => ({
      ...col,
      courses: col.course_ids.map(id => allCourses.find(c => c.id === id)).filter(Boolean)
    }));

    return Response.json({ collections: enrichedCollections });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});