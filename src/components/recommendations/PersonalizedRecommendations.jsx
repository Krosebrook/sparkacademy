import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, X, ThumbsUp, ThumbsDown, Loader2, RefreshCw, BookOpen, TrendingUp } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function PersonalizedRecommendations({ userEmail }) {
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState([]);
    const [courses, setCourses] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [ratingDialog, setRatingDialog] = useState(null);
    const [ratingValue, setRatingValue] = useState(null);
    const [ratingFeedback, setRatingFeedback] = useState('');

    useEffect(() => {
        loadRecommendations();
    }, [userEmail]);

    const loadRecommendations = async () => {
        setIsLoading(true);
        try {
            const recs = await base44.entities.CourseRecommendation.filter({ 
                student_email: userEmail,
                dismissed: false
            });
            
            const sortedRecs = recs.sort((a, b) => b.confidence_score - a.confidence_score).slice(0, 6);
            setRecommendations(sortedRecs);

            // Fetch course details
            const courseData = {};
            for (const rec of sortedRecs) {
                const course = await base44.entities.Course.get(rec.course_id);
                courseData[rec.course_id] = course;
            }
            setCourses(courseData);

            // Mark as viewed
            for (const rec of sortedRecs) {
                if (!rec.viewed) {
                    await base44.entities.CourseRecommendation.update(rec.id, { viewed: true });
                }
            }
        } catch (error) {
            console.error('Error loading recommendations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateNewRecommendations = async () => {
        setIsGenerating(true);
        try {
            await base44.functions.invoke('generateRecommendations', { 
                studentEmail: userEmail,
                sendEmail: false
            });
            toast.success('New recommendations generated!');
            await loadRecommendations();
        } catch (error) {
            toast.error('Failed to generate recommendations');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCourseClick = async (rec) => {
        await base44.entities.CourseRecommendation.update(rec.id, { clicked: true });
        navigate(createPageUrl('CourseViewer') + `?id=${rec.course_id}`);
    };

    const handleDismiss = async (recId) => {
        await base44.entities.CourseRecommendation.update(recId, { dismissed: true });
        setRecommendations(recs => recs.filter(r => r.id !== recId));
        toast.success('Recommendation dismissed');
    };

    const openRatingDialog = (rec) => {
        setRatingDialog(rec);
        setRatingValue(rec.student_rating || null);
        setRatingFeedback(rec.rating_feedback || '');
    };

    const submitRating = async () => {
        if (!ratingValue) {
            toast.error('Please select a rating');
            return;
        }

        try {
            await base44.entities.CourseRecommendation.update(ratingDialog.id, {
                student_rating: ratingValue,
                rating_feedback: ratingFeedback
            });
            
            setRecommendations(recs => recs.map(r => 
                r.id === ratingDialog.id 
                    ? { ...r, student_rating: ratingValue, rating_feedback: ratingFeedback }
                    : r
            ));
            
            toast.success('Thank you for your feedback!');
            setRatingDialog(null);
            setRatingValue(null);
            setRatingFeedback('');
        } catch (error) {
            toast.error('Failed to save rating');
        }
    };

    if (isLoading) {
        return (
            <Card className="border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
                    <p className="text-slate-600">Loading recommendations...</p>
                </CardContent>
            </Card>
        );
    }

    if (recommendations.length === 0) {
        return (
            <Card className="border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                    <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        No recommendations yet
                    </h3>
                    <p className="text-slate-600 mb-4">
                        Complete a few courses to get personalized recommendations
                    </p>
                    <Button onClick={generateNewRecommendations} disabled={isGenerating}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate Recommendations
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    <h2 className="text-2xl font-bold text-slate-900">Recommended for You</h2>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={generateNewRecommendations}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <RefreshCw className="w-4 h-4" />
                    )}
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((rec) => {
                    const course = courses[rec.course_id];
                    if (!course) return null;

                    return (
                        <Card key={rec.id} className="border-2 border-purple-100 hover:border-purple-300 transition-all relative group">
                            <button
                                onClick={() => handleDismiss(rec.id)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                            </button>

                            <CardHeader>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <Badge className="bg-purple-100 text-purple-800">
                                        {rec.confidence_score}% match
                                    </Badge>
                                </div>
                                <CardTitle className="text-lg">{course.title}</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <div className="bg-purple-50 p-3 rounded-lg">
                                    <p className="text-xs font-semibold text-purple-900 mb-1">
                                        Why this course?
                                    </p>
                                    <p className="text-sm text-purple-800">{rec.reason}</p>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Badge variant="outline">{course.level}</Badge>
                                    <Badge variant="outline">{course.category}</Badge>
                                    {course.rating > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            <span>{course.rating.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>

                                {rec.factors && rec.factors.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {rec.factors.slice(0, 3).map((factor, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                {factor}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleCourseClick(rec)}
                                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                                        size="sm"
                                    >
                                        <BookOpen className="w-4 h-4 mr-1" />
                                        View Course
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openRatingDialog(rec)}
                                        className={rec.student_rating ? "border-green-300" : ""}
                                    >
                                        {rec.student_rating ? (
                                            <ThumbsUp className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <Star className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={!!ratingDialog} onOpenChange={() => setRatingDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rate this Recommendation</DialogTitle>
                        <DialogDescription>
                            Help us improve recommendations by rating how relevant this was
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                How useful is this recommendation?
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setRatingValue(val)}
                                        className={`p-3 rounded-lg border-2 transition-all ${
                                            ratingValue === val
                                                ? 'border-purple-600 bg-purple-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <Star
                                            className={`w-6 h-6 ${
                                                ratingValue >= val
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-slate-300'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Additional feedback (optional)
                            </label>
                            <Textarea
                                placeholder="Tell us why this rating..."
                                value={ratingFeedback}
                                onChange={(e) => setRatingFeedback(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setRatingDialog(null)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={submitRating}
                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                            >
                                Submit Rating
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}