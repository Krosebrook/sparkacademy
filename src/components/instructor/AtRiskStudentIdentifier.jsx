import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Mail, User, BookOpen } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AtRiskStudentIdentifier({ courses, enrollments }) {
    const [atRiskStudents, setAtRiskStudents] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [emailMessage, setEmailMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    const analyzeStudents = async () => {
        setIsAnalyzing(true);
        try {
            const studentData = enrollments.map(enrollment => {
                const course = courses.find(c => c.id === enrollment.course_id);
                const lastActivity = new Date(enrollment.last_activity_date || 0);
                const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
                
                const avgQuizScore = enrollment.progress
                    ?.filter(p => p.quiz_score !== undefined)
                    .reduce((sum, p, _, arr) => sum + p.quiz_score / arr.length, 0) || 0;

                const completedLessons = enrollment.progress?.filter(p => p.completed).length || 0;
                const totalLessons = course?.lessons?.length || 1;
                const progressRate = (completedLessons / totalLessons) * 100;

                return {
                    student_email: enrollment.student_email,
                    course_title: course?.title || "Unknown",
                    course_id: enrollment.course_id,
                    completion_percentage: enrollment.completion_percentage || 0,
                    days_since_activity: Math.round(daysSinceActivity),
                    avg_quiz_score: avgQuizScore.toFixed(1),
                    progress_rate: progressRate.toFixed(1),
                    current_streak: enrollment.current_streak_days || 0,
                    completed_lessons: completedLessons,
                    total_lessons: totalLessons
                };
            });

            const potentiallyAtRisk = studentData.filter(s => 
                s.days_since_activity > 7 || 
                s.avg_quiz_score < 60 || 
                s.completion_percentage < 30 ||
                s.current_streak === 0
            );

            if (potentiallyAtRisk.length === 0) {
                setAtRiskStudents([]);
                setIsAnalyzing(false);
                return;
            }

            const prompt = `Analyze these student engagement metrics and identify students at risk of dropping out:

${potentiallyAtRisk.map(s => `Student: ${s.student_email}
Course: ${s.course_title}
- Completion: ${s.completion_percentage}%
- Days Since Last Activity: ${s.days_since_activity}
- Avg Quiz Score: ${s.avg_quiz_score}%
- Progress: ${s.completed_lessons}/${s.total_lessons} lessons
- Current Streak: ${s.current_streak} days
`).join("\n")}

For each at-risk student, provide:
1. Risk level (high/medium/low)
2. Primary issues (2-3 key problems)
3. Intervention strategies (3-5 specific, personalized recommendations)
4. Suggested message template for outreach`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        at_risk_students: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    student_email: { type: "string" },
                                    risk_level: { type: "string", enum: ["high", "medium", "low"] },
                                    primary_issues: { type: "array", items: { type: "string" } },
                                    intervention_strategies: { type: "array", items: { type: "string" } },
                                    suggested_message: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            const enrichedData = result.at_risk_students.map(student => {
                const originalData = potentiallyAtRisk.find(s => s.student_email === student.student_email);
                return { ...student, ...originalData };
            });

            setAtRiskStudents(enrichedData);
        } catch (error) {
            console.error("Error analyzing students:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const sendInterventionEmail = async () => {
        setIsSending(true);
        try {
            await base44.integrations.Core.SendEmail({
                to: selectedStudent.student_email,
                subject: `We're Here to Help - ${selectedStudent.course_title}`,
                body: emailMessage
            });
            
            setSelectedStudent(null);
            setEmailMessage("");
        } catch (error) {
            console.error("Error sending email:", error);
        } finally {
            setIsSending(false);
        }
    };

    const getRiskColor = (level) => {
        const colors = {
            high: "bg-red-100 text-red-800 border-red-300",
            medium: "bg-amber-100 text-amber-800 border-amber-300",
            low: "bg-blue-100 text-blue-800 border-blue-300"
        };
        return colors[level] || "bg-slate-100 text-slate-800";
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        At-Risk Student Analysis
                    </CardTitle>
                    <Button
                        onClick={analyzeStudents}
                        disabled={isAnalyzing}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Identify At-Risk Students
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {atRiskStudents.length === 0 && !isAnalyzing ? (
                    <div className="text-center py-8 text-slate-500">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p>Click the button above to analyze student engagement</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {atRiskStudents.map((student, idx) => (
                            <div key={idx} className={`p-4 border-2 rounded-lg ${getRiskColor(student.risk_level)}`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3">
                                        <User className="h-5 w-5 mt-1" />
                                        <div>
                                            <h4 className="font-bold text-slate-900">{student.student_email}</h4>
                                            <p className="text-sm text-slate-700 flex items-center gap-1 mt-1">
                                                <BookOpen className="h-3 w-3" />
                                                {student.course_title}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className={getRiskColor(student.risk_level)}>
                                        {student.risk_level} risk
                                    </Badge>
                                </div>

                                <div className="grid md:grid-cols-4 gap-3 mb-3 text-sm">
                                    <div>
                                        <p className="text-xs text-slate-600">Completion</p>
                                        <p className="font-semibold">{student.completion_percentage}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-600">Last Active</p>
                                        <p className="font-semibold">{student.days_since_activity}d ago</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-600">Avg Quiz Score</p>
                                        <p className="font-semibold">{student.avg_quiz_score}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-600">Streak</p>
                                        <p className="font-semibold">{student.current_streak} days</p>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <h5 className="text-sm font-semibold text-slate-900 mb-2">Primary Issues:</h5>
                                    <ul className="space-y-1">
                                        {student.primary_issues?.map((issue, i) => (
                                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                                <span className="text-red-600">•</span>
                                                {issue}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mb-3">
                                    <h5 className="text-sm font-semibold text-slate-900 mb-2">Intervention Strategies:</h5>
                                    <ul className="space-y-1">
                                        {student.intervention_strategies?.map((strategy, i) => (
                                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                                <span className="text-green-600">✓</span>
                                                {strategy}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            onClick={() => {
                                                setSelectedStudent(student);
                                                setEmailMessage(student.suggested_message);
                                            }}
                                            size="sm"
                                            className="w-full"
                                        >
                                            <Mail className="w-4 h-4 mr-2" />
                                            Send Intervention Email
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Send Intervention Email</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-slate-600 mb-1">To: {selectedStudent?.student_email}</p>
                                                <p className="text-sm text-slate-600">Course: {selectedStudent?.course_title}</p>
                                            </div>
                                            <Textarea
                                                value={emailMessage}
                                                onChange={(e) => setEmailMessage(e.target.value)}
                                                className="min-h-64"
                                                placeholder="Compose your message..."
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setSelectedStudent(null)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={sendInterventionEmail}
                                                    disabled={isSending}
                                                    className="bg-violet-600 hover:bg-violet-700"
                                                >
                                                    {isSending ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Sending...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Mail className="w-4 h-4 mr-2" />
                                                            Send Email
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}