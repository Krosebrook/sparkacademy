import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId } = await req.json();
        
        const course = await base44.entities.Course.get(courseId);
        if (!course || course.created_by !== user.email) {
            return Response.json({ error: 'Course not found or access denied' }, { status: 403 });
        }

        // Generate xAPI statements for course structure
        const xapiStatements = {
            course: {
                id: `https://base44.app/courses/${courseId}`,
                definition: {
                    name: { "en-US": course.title },
                    description: { "en-US": course.description },
                    type: "http://adlnet.gov/expapi/activities/course",
                    moreInfo: `https://base44.app/courses/${courseId}`,
                    extensions: {
                        "https://base44.app/extensions/category": course.category,
                        "https://base44.app/extensions/level": course.level,
                        "https://base44.app/extensions/duration": course.duration_hours
                    }
                }
            },
            lessons: course.lessons?.map((lesson, idx) => ({
                id: `https://base44.app/courses/${courseId}/lessons/${idx}`,
                definition: {
                    name: { "en-US": lesson.title },
                    description: { "en-US": lesson.content?.substring(0, 200) || "Course lesson" },
                    type: "http://adlnet.gov/expapi/activities/lesson",
                    extensions: {
                        "https://base44.app/extensions/order": lesson.order,
                        "https://base44.app/extensions/duration": lesson.duration_minutes
                    }
                }
            })) || [],
            sampleStatements: [
                {
                    actor: {
                        mbox: "mailto:student@example.com",
                        name: "Example Student"
                    },
                    verb: {
                        id: "http://adlnet.gov/expapi/verbs/attempted",
                        display: { "en-US": "attempted" }
                    },
                    object: {
                        id: `https://base44.app/courses/${courseId}`,
                        definition: {
                            name: { "en-US": course.title },
                            type: "http://adlnet.gov/expapi/activities/course"
                        }
                    }
                },
                {
                    actor: {
                        mbox: "mailto:student@example.com",
                        name: "Example Student"
                    },
                    verb: {
                        id: "http://adlnet.gov/expapi/verbs/completed",
                        display: { "en-US": "completed" }
                    },
                    object: {
                        id: `https://base44.app/courses/${courseId}/lessons/0`,
                        definition: {
                            name: { "en-US": course.lessons?.[0]?.title || "Lesson" },
                            type: "http://adlnet.gov/expapi/activities/lesson"
                        }
                    },
                    result: {
                        completion: true,
                        success: true,
                        duration: "PT30M"
                    }
                }
            ]
        };

        return Response.json({
            xapi_version: "1.0.3",
            course_metadata: xapiStatements,
            endpoint_info: {
                statements_endpoint: "https://your-lrs.com/xapi/statements",
                auth_type: "Basic or OAuth2",
                note: "Configure your LRS endpoint to receive xAPI statements from Base44"
            }
        });
        
    } catch (error) {
        console.error('Error generating xAPI package:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});