import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, CheckCircle } from "lucide-react";

export default function FeedbackForm({ courseId, courseTitle, onSubmitted }) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const userData = await base44.auth.me();
        setUser(userData);
        
        const existingFeedback = await base44.entities.CourseFeedback.filter({
            course_id: courseId,
            student_email: userData.email
        });
        
        if (existingFeedback.length > 0) {
            setIsSubmitted(true);
        }
    };

    const handleSubmit = async () => {
        if (!rating || !feedbackText.trim()) return;
        
        setIsSubmitting(true);
        try {
            const feedback = await base44.entities.CourseFeedback.create({
                course_id: courseId,
                student_email: user.email,
                student_name: user.full_name,
                rating,
                feedback_text: feedbackText,
                submission_date: new Date().toISOString(),
                is_analyzed: false
            });

            setIsSubmitted(true);
            if (onSubmitted) onSubmitted(feedback);
        } catch (error) {
            console.error("Error submitting feedback:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-8 text-center">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Thank You!</h3>
                    <p className="text-slate-600">Your feedback has been submitted and will help improve this course.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle>Share Your Feedback</CardTitle>
                <p className="text-sm text-slate-600">Help improve {courseTitle} for future students</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Rate this course
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`h-8 w-8 ${
                                        star <= (hoveredRating || rating)
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-slate-300"
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Your detailed feedback
                    </label>
                    <Textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="What did you like? What could be improved? Any suggestions?"
                        className="min-h-32"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        Your feedback will be analyzed by AI to help identify areas for improvement
                    </p>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !rating || !feedbackText.trim()}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        "Submit Feedback"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}