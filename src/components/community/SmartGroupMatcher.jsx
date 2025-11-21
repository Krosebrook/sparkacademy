import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SmartGroupMatcher({ userEmail, courseId }) {
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        analyzeAndRecommend();
    }, [userEmail, courseId]);

    const analyzeAndRecommend = async () => {
        setIsAnalyzing(true);
        try {
            const [enrollments, existingGroups, course] = await Promise.all([
                base44.entities.Enrollment.filter({ course_id: courseId }),
                base44.entities.StudyGroup.filter({ course_id: courseId }),
                base44.entities.Course.get(courseId)
            ]);

            const userEnrollment = enrollments.find(e => e.student_email === userEmail);
            if (!userEnrollment) {
                setIsAnalyzing(false);
                return;
            }

            const prompt = `You are an AI study group matchmaker. Analyze this student and recommend study groups.

STUDENT PROFILE:
- Email: ${userEmail}
- Progress: ${userEnrollment.completion_percentage}%
- Streak: ${userEnrollment.current_streak_days || 0} days
- Points: ${userEnrollment.points_earned || 0}

COURSE: ${course.title}

EXISTING STUDY GROUPS:
${existingGroups.map(g => `
- ${g.name}: ${g.members?.length || 0}/${g.max_members} members, ${g.is_public ? 'Public' : 'Private'}
  Members progress: ${g.members?.map(m => {
    const e = enrollments.find(enr => enr.student_email === m.email);
    return e?.completion_percentage || 0;
  }).join(', ')}%
`).join('\n')}

Recommend:
1. Which existing groups to join (consider compatibility, progress level, group size)
2. Whether to create a new group (if no good matches)
3. Ideal group composition for this student

Analyze learning style, progress pace, and engagement level.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        recommended_groups: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    group_id: { type: "string" },
                                    group_name: { type: "string" },
                                    match_score: { type: "number" },
                                    reasons: { type: "array", items: { type: "string" } },
                                    expected_benefits: { type: "string" }
                                }
                            }
                        },
                        should_create_new: { type: "boolean" },
                        new_group_suggestion: {
                            type: "object",
                            properties: {
                                suggested_name: { type: "string" },
                                suggested_focus: { type: "string" },
                                ideal_member_profile: { type: "string" }
                            }
                        }
                    }
                }
            });

            // Enrich with actual group data
            const enrichedRecommendations = {
                ...result,
                recommended_groups: result.recommended_groups?.map(rec => {
                    const group = existingGroups.find(g => g.id === rec.group_id);
                    return { ...rec, group };
                }).filter(r => r.group) || []
            };

            setRecommendations(enrichedRecommendations);
        } catch (error) {
            console.error("Error analyzing groups:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const joinGroup = async (groupId) => {
        try {
            const group = await base44.entities.StudyGroup.get(groupId);
            const user = await base44.auth.me();
            
            if (group.members?.length >= group.max_members) {
                alert("This group is full");
                return;
            }

            const updatedMembers = [
                ...(group.members || []),
                {
                    email: userEmail,
                    name: user.full_name,
                    joined_date: new Date().toISOString(),
                    role: "member"
                }
            ];

            await base44.entities.StudyGroup.update(groupId, {
                members: updatedMembers
            });

            navigate(createPageUrl("StudyGroups"));
        } catch (error) {
            console.error("Error joining group:", error);
            alert("Failed to join group. Please try again.");
        }
    };

    if (isAnalyzing) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">Analyzing study groups for you...</p>
                </CardContent>
            </Card>
        );
    }

    if (!recommendations) return null;

    return (
        <div className="space-y-4">
            {recommendations.recommended_groups?.length > 0 && (
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-purple-600" />
                            Recommended Study Groups
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recommendations.recommended_groups.map((rec, idx) => (
                            <div key={idx} className="p-4 border-2 rounded-lg hover:border-purple-300 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-bold text-lg">{rec.group_name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge className="bg-purple-100 text-purple-800">
                                                {rec.match_score}% match
                                            </Badge>
                                            <span className="text-xs text-slate-600">
                                                {rec.group?.members?.length || 0}/{rec.group?.max_members} members
                                            </span>
                                        </div>
                                    </div>
                                    <Button 
                                        size="sm"
                                        onClick={() => joinGroup(rec.group_id)}
                                        disabled={rec.group?.members?.length >= rec.group?.max_members}
                                    >
                                        Join Group
                                    </Button>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div>
                                        <p className="font-semibold text-slate-900 mb-1">Why this group:</p>
                                        <ul className="space-y-0.5">
                                            {rec.reasons?.map((reason, ridx) => (
                                                <li key={ridx} className="text-slate-700">• {reason}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="p-2 bg-purple-50 rounded">
                                        <p className="text-xs text-purple-900">
                                            <span className="font-semibold">Expected benefits:</span> {rec.expected_benefits}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {recommendations.should_create_new && (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardHeader>
                        <CardTitle className="text-green-700">Create Your Own Group</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-slate-700">
                            No perfect match found? We recommend creating a new study group!
                        </p>
                        
                        <div className="p-3 bg-white border border-green-200 rounded-lg">
                            <h5 className="font-semibold text-sm mb-1">Suggested Name:</h5>
                            <p className="text-sm text-slate-700">{recommendations.new_group_suggestion?.suggested_name}</p>
                        </div>

                        <div className="p-3 bg-white border border-green-200 rounded-lg">
                            <h5 className="font-semibold text-sm mb-1">Focus:</h5>
                            <p className="text-sm text-slate-700">{recommendations.new_group_suggestion?.suggested_focus}</p>
                        </div>

                        <div className="p-3 bg-white border border-green-200 rounded-lg">
                            <h5 className="font-semibold text-sm mb-1">Look for members who:</h5>
                            <p className="text-sm text-slate-700">{recommendations.new_group_suggestion?.ideal_member_profile}</p>
                        </div>

                        <Button 
                            onClick={() => navigate(createPageUrl("StudyGroups"))}
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Study Group
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Button onClick={analyzeAndRecommend} variant="outline" className="w-full">
                Refresh Recommendations
            </Button>
        </div>
    );
}