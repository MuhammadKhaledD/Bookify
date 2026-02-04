import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./StarRating";
import { reviewApi, CreateReviewRequest, UpdateReviewRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface ReviewFormProps {
    eventId?: number;
    productId?: number;
    existingReview?: {
        reviewId: number;
        rating: number;
        comment: string;
    };
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function ReviewForm({ eventId, productId, existingReview, onSuccess, onCancel }: ReviewFormProps) {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [comment, setComment] = useState(existingReview?.comment || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast({
                title: "Rating Required",
                description: "Please select a rating before submitting.",
                variant: "destructive",
            });
            return;
        }

        if (!eventId && !productId) {
            toast({
                title: "Error",
                description: "Event or Product ID is required.",
                variant: "destructive",
            });
            return;
        }

        if (!user?.id) {
            toast({
                title: "Error",
                description: "You must be logged in to submit a review.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            if (existingReview) {
                // Update existing review
                const updateData: UpdateReviewRequest = {
                    userId: user.id,
                    rating,
                    comment
                };
                const response = await reviewApi.update(existingReview.reviewId, updateData);
                console.log("Update response:", response);

                toast({
                    title: "Review Updated",
                    description: "Your review has been updated successfully.",
                });
            } else {
                // Create new review
                const createData: CreateReviewRequest = {
                    userId: user.id,  // Add userId from Redux store
                    rating,
                    comment,
                    reviewType: eventId ? "Event" : "Product",
                };

                if (eventId) {
                    createData.eventId = eventId;
                } else if (productId) {
                    createData.productId = productId;
                }

                const response = await reviewApi.create(createData);
                console.log("Create response:", response);

                toast({
                    title: "Review Submitted",
                    description: "Thank you for your review!",
                });
            }

            // Reset form
            setRating(0);
            setComment("");

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error("Review submission error:", error);
            console.error("Error response:", error.response);
            console.error("Error data:", error.response?.data);

            // Check if it's actually a success (handle various response formats)
            const isSuccess =
                error.response?.status === 200 ||
                error.response?.status === 201 ||
                error.response?.data?.success === true ||
                error.response?.data?.success === "true";

            if (isSuccess) {
                toast({
                    title: existingReview ? "Review Updated" : "Review Submitted",
                    description: existingReview ? "Your review has been updated successfully." : "Thank you for your review!",
                });

                // Reset form
                setRating(0);
                setComment("");

                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast({
                    title: "Error",
                    description: error.response?.data?.message || error.message || "Failed to submit review. Please try again.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
            <div>
                <label className="text-sm font-medium mb-2 block">Your Rating</label>
                <StarRating rating={rating} onRatingChange={setRating} size="lg" />
            </div>

            <div>
                <label className="text-sm font-medium mb-2 block">Your Review (Optional)</label>
                <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={4}
                    className="resize-none"
                />
            </div>

            <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
                </Button>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}
