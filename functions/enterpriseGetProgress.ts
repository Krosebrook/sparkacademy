import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify API key from header
        const apiKey = req.headers.get('X-API-Key');
        if (!apiKey || apiKey !== Deno.env.get('ENTERPRISE_API_KEY')) {
            return Response.json({ error: 'Invalid API key' }, { status: 401 });
        }

        const url = new URL(req.url);
        const userEmail = url.searchParams.get('user_email');
        const courseId = url.searchParams.get('course_id');
        const organizationId = url.searchParams.get('organization_id');
        
        let query = {};
        
        if (userEmail) {
            query.student_email = userEmail;
        }
        if (courseId) {
            query.course_id = courseId;
        }
        
        // Get enrollments
        const enrollments = await base44.asServiceRole.entities.Enrollment.filter(query);
        
        // Enrich with course and user data
        const progressData = await Promise.all(enrollments.map(async (enrollment) => {
            const course = await base44.asServiceRole.entities.Course.get(enrollment.course_id);
            const users = await base44.asServiceRole.entities.User.filter({ email: enrollment.student_email });
            const user = users[0];
            
            // Filter by organization if specified
            if (organizationId && user?.organization_id !== organizationId) {
                return null;
            }
            
            // Calculate detailed progress
            const totalLessons = course?.lessons?.length || 0;
            const completedLessons = enrollment.progress?.filter(p => p.completed).length || 0;
            const quizzesTaken = enrollment.progress?.filter(p => p.quiz_score !== undefined).length || 0;
            const averageQuizScore = quizzesTaken > 0
                ? enrollment.progress
                    .filter(p => p.quiz_score !== undefined)
                    .reduce((sum, p) => sum + p.quiz_score, 0) / quizzesTaken
                : null;
            
            return {
                user: {
                    email: enrollment.student_email,
                    full_name: user?.full_name,
                    organization_id: user?.organization_id
                },
                course: {
                    id: course.id,
                    title: course.title,
                    category: course.category,
                    level: course.level
                },
                progress: {
                    enrollment_date: enrollment.enrollment_date,
                    completion_percentage: enrollment.completion_percentage,
                    total_lessons: totalLessons,
                    completed_lessons: completedLessons,
                    quizzes_taken: quizzesTaken,
                    average_quiz_score: averageQuizScore,
                    certificate_earned: enrollment.certificate_earned,
                    points_earned: enrollment.points_earned,
                    current_streak_days: enrollment.current_streak_days,
                    last_activity: enrollment.updated_date
                },
                lesson_details: enrollment.progress?.map(p => ({
                    lesson_order: p.lesson_order,
                    completed: p.completed,
                    completed_date: p.completed_date,
                    quiz_score: p.quiz_score,
                    quiz_passed: p.quiz_passed
                })) || []
            };
        }));
        
        // Filter out nulls (organization filtered out)
        const filteredProgress = progressData.filter(p => p !== null);
        
        return Response.json({
            success: true,
            total_records: filteredProgress.length,
            data: filteredProgress,
            metadata: {
                generated_at: new Date().toISOString(),
                filters_applied: {
                    user_email: userEmail || 'all',
                    course_id: courseId || 'all',
                    organization_id: organizationId || 'all'
                }
            }
        });
        
    } catch (error) {
        console.error('Error fetching progress:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});