import { useState } from "react";
import { Review, reviewApi } from "@/lib/api";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { isAdmin } from "@/utils/roles";
import { ReviewForm } from "./ReviewForm";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReviewListProps {
    reviews: Review[];
    onReviewsChange?: () => void;
    averageRating?: number;
    totalReviews?: number;
}

export function ReviewList({ reviews, onReviewsChange, averageRating, totalReviews }: ReviewListProps) {
    const { user } = useSelector((state: RootState) => state.auth);
    const userRoles = (user as any)?.roles || [];
    const isAdminUser = isAdmin(userRoles);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [deleteReviewId, setDeleteReviewId] = useState<number | null>(null);
    const { toast } = useToast();

    const handleDelete = async (reviewId: number) => {
        try {
            await reviewApi.delete(reviewId);
            toast({
                title: "Review Deleted",
                description: "The review has been deleted successfully.",
            });
            setDeleteReviewId(null);
            if (onReviewsChange) {
                onReviewsChange();
            }
        } catch (error: any) {
            console.error("Delete review error:", error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete review.",
                variant: "destructive",
            });
        }
    };

    const canEdit = (review: Review) => {
        return user?.id === review.userId;
    };

    const canDelete = (review: Review) => {
        return user?.id === review.userId || isAdminUser;
    };

    // Calculate average if not provided
    const displayRating = averageRating !== undefined
        ? averageRating
        : reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

    const displayTotal = totalReviews !== undefined ? totalReviews : reviews.length;

    return (
        <div className="space-y-6">
            {/* Overall Rating Section */}
            {reviews.length > 0 && (
                <div className="p-6 border rounded-lg bg-card">
                    <h3 className="text-lg font-semibold mb-3">Overall Rating</h3>
                    <div className="flex items-center gap-4">
                        <div className="text-4xl font-bold">{displayRating.toFixed(1)}</div>
                        <div>
                            <StarRating rating={Math.round(displayRating)} readonly size="lg" />
                            <p className="text-sm text-muted-foreground mt-1">
                                Based on {displayTotal} {displayTotal === 1 ? "review" : "reviews"}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No reviews yet. Be the first to review!</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.reviewId}>
                            {editingReview?.reviewId === review.reviewId ? (
                                <ReviewForm
                                    eventId={review.eventId || undefined}
                                    productId={review.productId || undefined}
                                    existingReview={{
                                        reviewId: review.reviewId,
                                        rating: review.rating,
                                        comment: review.comment,
                                    }}
                                    onSuccess={() => {
                                        setEditingReview(null);
                                        if (onReviewsChange) {
                                            onReviewsChange();
                                        }
                                    }}
                                    onCancel={() => setEditingReview(null)}
                                />
                            ) : (
                                <div className="p-4 border rounded-lg bg-card">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold">{review.userName}</p>
                                            <StarRating rating={review.rating} readonly size="sm" />
                                        </div>
                                        {user && (
                                            <div className="flex gap-2">
                                                {canEdit(review) && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setEditingReview(review)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {canDelete(review) && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => setDeleteReviewId(review.reviewId)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {review.comment && (
                                        <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteReviewId !== null} onOpenChange={() => setDeleteReviewId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Review</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this review? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteReviewId && handleDelete(deleteReviewId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
