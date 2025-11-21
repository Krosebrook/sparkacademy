import React from "react";
import { Star } from "lucide-react";

export default function CourseRatingDisplay({ rating, reviewsCount, size = "sm" }) {
    if (!rating && !reviewsCount) return null;

    const displayRating = rating || 0;
    const fullStars = Math.floor(displayRating);
    const hasHalfStar = displayRating % 1 >= 0.5;

    const starSize = size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3 w-3";
    const textSize = size === "lg" ? "text-base" : size === "md" ? "text-sm" : "text-xs";

    return (
        <div className="flex items-center gap-1">
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${starSize} ${
                            star <= fullStars
                                ? "fill-amber-400 text-amber-400"
                                : star === fullStars + 1 && hasHalfStar
                                ? "fill-amber-400 text-amber-400 opacity-50"
                                : "text-slate-300"
                        }`}
                    />
                ))}
            </div>
            <span className={`${textSize} font-semibold text-slate-700`}>
                {displayRating.toFixed(1)}
            </span>
            {reviewsCount > 0 && (
                <span className={`${textSize} text-slate-500`}>
                    ({reviewsCount})
                </span>
            )}
        </div>
    );
}