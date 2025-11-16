import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Award, Download, Mail, CheckCircle } from "lucide-react";

export default function BulkCertificateGenerator({ courses }) {
    const [eligibleStudents, setEligibleStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [generatingFor, setGeneratingFor] = useState(null);

    useEffect(() => {
        loadEligibleStudents();
    }, [courses]);

    const loadEligibleStudents = async () => {
        setIsLoading(true);
        try {
            const allEnrollments = await base44.entities.Enrollment.list();
            const allCertificates = await base44.entities.Certificate.list();

            const eligible = allEnrollments
                .filter(e => {
                    const course = courses.find(c => c.id === e.course_id);
                    const hasCertificate = allCertificates.some(cert => 
                        cert.course_id === e.course_id && cert.student_email === e.student_email
                    );
                    return course && e.completion_percentage === 100 && !hasCertificate;
                })
                .map(e => {
                    const course = courses.find(c => c.id === e.course_id);
                    return {
                        enrollment: e,
                        course: course,
                        student_email: e.student_email,
                        course_title: course.title,
                        course_id: course.id,
                        completion_date: e.updated_date
                    };
                });

            setEligibleStudents(eligible);
        } catch (error) {
            console.error("Error loading eligible students:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateCertificate = async (student) => {
        setGeneratingFor(student.student_email);
        try {
            const response = await base44.functions.invoke('generateCourseCertificate', {
                course_id: student.course_id,
                student_email: student.student_email
            });

            if (response.data?.certificate) {
                await base44.integrations.Core.SendEmail({
                    to: student.student_email,
                    subject: `Your Course Completion Certificate - ${student.course_title}`,
                    body: `Congratulations on completing ${student.course_title}!

Your certificate is now available. You can download it here:
${response.data.certificate.certificate_url}

Verification Code: ${response.data.certificate.verification_code}

Keep learning and growing!`
                });

                await loadEligibleStudents();
            }
        } catch (error) {
            console.error("Error generating certificate:", error);
        } finally {
            setGeneratingFor(null);
        }
    };

    const generateAllCertificates = async () => {
        for (const student of eligibleStudents) {
            await generateCertificate(student);
        }
    };

    if (isLoading) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-violet-600" />
                        Certificate Generator
                    </CardTitle>
                    {eligibleStudents.length > 0 && (
                        <Button
                            onClick={generateAllCertificates}
                            disabled={generatingFor !== null}
                            size="sm"
                            className="bg-violet-600 hover:bg-violet-700"
                        >
                            <Award className="w-4 h-4 mr-2" />
                            Generate All ({eligibleStudents.length})
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {eligibleStudents.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <p className="font-semibold">All caught up!</p>
                        <p className="text-sm">All eligible students have received their certificates.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {eligibleStudents.map((student, idx) => (
                            <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:border-violet-300 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{student.student_email}</h4>
                                        <p className="text-sm text-slate-600">{student.course_title}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Completed: {new Date(student.completion_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => generateCertificate(student)}
                                        disabled={generatingFor !== null}
                                        size="sm"
                                    >
                                        {generatingFor === student.student_email ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Award className="w-4 h-4 mr-2" />
                                                Generate & Send
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}