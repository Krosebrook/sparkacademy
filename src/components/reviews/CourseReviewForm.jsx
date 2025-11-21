import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";

export default function CourseReviewForm({ courseId, courseName, onSubmitted }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitReview = async () => {
        if (rating === 0 || !feedback.trim()) {
            alert("Please provide both a rating and feedback");
            return;
        }

        setIsSubmitting(true);
        try {
            const user = await base44.auth.me();
            
            await base44.entities.CourseFeedback.create({
                course_id: courseId,
                student_email: user.email,
                student_name: user.full_name,
                rating,
                feedback_text: feedback,
                submission_date: new Date().toISOString()
            });

            // Update course rating
            const allFeedback = await base44.entities.CourseFeedback.filter({ course_id: courseId });
            const avgRating = allFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / allFeedback.length;
            
            await base44.entities.Course.update(courseId, {
                rating: avgRating,
                reviews_count: allFeedback.length
            });

            alert("Review submitted successfully!");
            setRating(0);
            setFeedback("");
            if (onSubmitted) onSubmitted();
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle>Review: {courseName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-semibold mb-2 block">Your Rating</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`h-8 w-8 ${
                                        star <= (hoverRating || rating)
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-slate-300"
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-sm font-semibold mb-2 block">Your Feedback</label>
                    <Textarea
                        placeholder="Share your experience with this course..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={6}
                    />
                </div>

                <Button
                    onClick={submitReview}
                    disabled={isSubmitting || rating === 0 || !feedback.trim()}
                    className="w-full"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        "Submit Review"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}