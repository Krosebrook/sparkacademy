import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Loader2, Users, CheckCircle } from "lucide-react";

export default function SmartPeerMatcher({ userEmail, courseId }) {
    const [matches, setMatches] = useState(null);
    const [isMatching, setIsMatching] = useState(false);
    const [selectedPeer, setSelectedPeer] = useState(null);

    useEffect(() => {
        findMatches();
    }, [userEmail, courseId]);

    const findMatches = async () => {
        setIsMatching(true);
        try {
            const [allEnrollments, course, userEnrollment] = await Promise.all([
                base44.entities.Enrollment.filter({ course_id: courseId }),
                base44.entities.Course.get(courseId),
                base44.entities.Enrollment.filter({ student_email: userEmail, course_id: courseId })
            ]);

            const currentUserEnrollment = userEnrollment[0];
            if (!currentUserEnrollment) {
                setIsMatching(false);
                return;
            }

            const otherStudents = allEnrollments.filter(e => e.student_email !== userEmail);

            const prompt = `You are an AI matching system. Find the best peer review partners for this student.

STUDENT PROFILE:
- Email: ${userEmail}
- Completion: ${currentUserEnrollment.completion_percentage}%
- Points: ${currentUserEnrollment.points_earned || 0}
- Current Streak: ${currentUserEnrollment.current_streak_days || 0} days
- Recent Progress: ${JSON.stringify(currentUserEnrollment.progress?.slice(-3) || [])}

COURSE: ${course.title}

OTHER STUDENTS:
${otherStudents.map(s => `- ${s.student_email}: Completion ${s.completion_percentage}%, Points ${s.points_earned || 0}`).join('\n')}

Find 3-5 best matches based on:
1. Similar progress level (not too far ahead or behind)
2. Complementary skills
3. Active engagement
4. Different enough to provide diverse perspectives

For each match, explain why they're a good fit.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        matches: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    email: { type: "string" },
                                    match_score: { type: "number" },
                                    compatibility_reasons: { type: "array", items: { type: "string" } },
                                    complementary_strengths: { type: "array", items: { type: "string" } },
                                    suggested_focus: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            // Enrich with actual enrollment data
            const enrichedMatches = result.matches.map(match => {
                const enrollment = otherStudents.find(e => e.student_email === match.email);
                return { ...match, enrollment };
            });

            setMatches(enrichedMatches);
        } catch (error) {
            console.error("Error finding matches:", error);
        } finally {
            setIsMatching(false);
        }
    };

    const requestPeerReview = async (peerEmail) => {
        try {
            const course = await base44.entities.Course.get(courseId);
            const currentLesson = course.lessons?.[0]; // You'd determine this based on progress
            
            await base44.entities.PeerReview.create({
                course_id: courseId,
                lesson_order: currentLesson?.order || 1,
                submitter_email: userEmail,
                reviewer_email: peerEmail,
                submission_content: "Pending submission",
                is_completed: false
            });

            setSelectedPeer(peerEmail);
            alert("Peer review request sent!");
        } catch (error) {
            console.error("Error creating peer review:", error);
            alert("Failed to send request. Please try again.");
        }
    };

    if (isMatching) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">Finding your best peer matches...</p>
                </CardContent>
            </Card>
        );
    }

    if (!matches || matches.length === 0) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600">No peer matches available yet</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Your Best Peer Matches
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {matches.map((match, idx) => (
                        <div key={idx} className="p-4 border-2 rounded-lg hover:border-blue-300 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                        {match.email[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{match.email.split('@')[0]}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge className="bg-blue-100 text-blue-800">
                                                {match.match_score}% match
                                            </Badge>
                                            <span className="text-xs text-slate-600">
                                                {match.enrollment?.completion_percentage}% complete
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {selectedPeer !== match.email && (
                                    <Button 
                                        size="sm"
                                        onClick={() => requestPeerReview(match.email)}
                                    >
                                        Request Review
                                    </Button>
                                )}
                                {selectedPeer === match.email && (
                                    <Badge className="bg-green-100 text-green-800">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Requested
                                    </Badge>
                                )}
                            </div>

                            <div className="space-y-2 text-sm">
                                <div>
                                    <p className="font-semibold text-slate-900 mb-1">Why this match:</p>
                                    <ul className="space-y-0.5">
                                        {match.compatibility_reasons?.map((reason, ridx) => (
                                            <li key={ridx} className="text-slate-700">• {reason}</li>
                                        ))}
                                    </ul>
                                </div>

                                {match.complementary_strengths?.length > 0 && (
                                    <div>
                                        <p className="font-semibold text-slate-900 mb-1">Their strengths:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {match.complementary_strengths.map((strength, sidx) => (
                                                <Badge key={sidx} variant="outline" className="text-xs">
                                                    {strength}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="p-2 bg-blue-50 rounded">
                                    <p className="text-xs text-blue-900">
                                        <span className="font-semibold">Focus:</span> {match.suggested_focus}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Button onClick={findMatches} variant="outline" className="w-full">
                Refresh Matches
            </Button>
        </div>
    );
}