import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { studentEmail, sendEmail = false } = await req.json();
        const targetEmail = studentEmail || user.email;

        // Gather student data
        const enrollments = await base44.entities.Enrollment.filter({ student_email: targetEmail });
        const feedback = await base44.entities.CourseFeedback.filter({ student_email: targetEmail });
        const allCourses = await base44.entities.Course.filter({ is_published: true });
        
        // Get enrolled course IDs to exclude
        const enrolledCourseIds = enrollments.map(e => e.course_id);
        const availableCourses = allCourses.filter(c => !enrolledCourseIds.includes(c.id));

        if (availableCourses.length === 0) {
            return Response.json({ recommendations: [], message: 'No new courses to recommend' });
        }

        // Build student profile for AI
        const completedCourses = await Promise.all(
            enrollments
                .filter(e => e.completion_percentage === 100)
                .map(e => base44.entities.Course.get(e.course_id))
        );

        const inProgressCourses = await Promise.all(
            enrollments
                .filter(e => e.completion_percentage > 0 && e.completion_percentage < 100)
                .map(e => base44.entities.Course.get(e.course_id))
        );

        // Calculate skill gaps
        const completedSkills = completedCourses
            .flatMap(c => c?.skills_taught || [])
            .filter(Boolean);
        
        const interestCategories = [
            ...completedCourses.map(c => c?.category),
            ...inProgressCourses.map(c => c?.category),
            ...feedback.filter(f => f.rating >= 4).map(f => {
                const course = allCourses.find(c => c.id === f.course_id);
                return course?.category;
            })
        ].filter(Boolean);

        const categoryFrequency = interestCategories.reduce((acc, cat) => {
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {});

        const prompt = `Analyze this student's learning profile and recommend 5 courses from the available list.

STUDENT PROFILE:
- Completed Courses (${completedCourses.length}): ${completedCourses.map(c => c?.title).join(', ') || 'None'}
- In Progress (${inProgressCourses.length}): ${inProgressCourses.map(c => c?.title).join(', ') || 'None'}
- Skills Acquired: ${completedSkills.join(', ') || 'None'}
- Interest Categories: ${Object.entries(categoryFrequency).map(([cat, count]) => `${cat} (${count})`).join(', ') || 'None'}
- Feedback Patterns: ${feedback.length} reviews, avg rating ${feedback.length > 0 ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1) : 'N/A'}

AVAILABLE COURSES (${availableCourses.length}):
${availableCourses.slice(0, 50).map(c => `
- ID: ${c.id}
  Title: ${c.title}
  Category: ${c.category}
  Level: ${c.level}
  Skills: ${c.skills_taught?.join(', ') || 'N/A'}
  Rating: ${c.rating}/5
`).join('\n')}

Recommend 5 courses that:
1. Match student's interests and build on completed skills
2. Fill skill gaps for career progression
3. Are appropriate difficulty level (not too easy/hard)
4. Have good ratings and quality
5. Provide variety and growth opportunities

For each recommendation, provide a compelling reason.`;

        const result = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    recommendations: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                course_id: { type: "string" },
                                reason: { type: "string" },
                                confidence_score: { type: "number" },
                                factors: { 
                                    type: "array",
                                    items: { type: "string" }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Save recommendations to database
        const savedRecommendations = [];
        for (const rec of result.recommendations || []) {
            // Check if recommendation already exists
            const existing = await base44.entities.CourseRecommendation.filter({
                student_email: targetEmail,
                course_id: rec.course_id
            });

            if (existing.length === 0) {
                const saved = await base44.entities.CourseRecommendation.create({
                    student_email: targetEmail,
                    course_id: rec.course_id,
                    reason: rec.reason,
                    confidence_score: rec.confidence_score || 80,
                    factors: rec.factors || [],
                    viewed: false,
                    clicked: false,
                    enrolled: false,
                    dismissed: false,
                    email_sent: false
                });
                savedRecommendations.push(saved);
            }
        }

        // Send email notification if requested
        if (sendEmail && savedRecommendations.length > 0) {
            const topRecs = savedRecommendations.slice(0, 3);
            const recCourses = await Promise.all(
                topRecs.map(r => base44.entities.Course.get(r.course_id))
            );

            const emailBody = `
<h2>New Course Recommendations for You!</h2>
<p>Based on your learning history and interests, we've found some courses you might love:</p>

${recCourses.map((course, idx) => `
<div style="margin: 20px 0; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px;">
    <h3>${course.title}</h3>
    <p>${course.description}</p>
    <p><strong>Why this course?</strong> ${topRecs[idx].reason}</p>
    <p>⭐ ${course.rating}/5 | ${course.level} level</p>
    <a href="https://your-app.com/course?id=${course.id}" style="color: #8b5cf6;">View Course →</a>
</div>
`).join('')}

<p>Visit your dashboard to see all recommendations and provide feedback!</p>
`;

            await base44.integrations.Core.SendEmail({
                to: targetEmail,
                subject: '🎯 New Course Recommendations Just for You',
                body: emailBody
            });

            // Mark as email sent
            for (const rec of savedRecommendations) {
                await base44.entities.CourseRecommendation.update(rec.id, { email_sent: true });
            }
        }

        return Response.json({
            success: true,
            count: savedRecommendations.length,
            recommendations: savedRecommendations
        });

    } catch (error) {
        console.error('Error generating recommendations:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});