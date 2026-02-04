using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;

public class ReviewService
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ReviewService> _logger;

    public ReviewService(
        IReviewRepository reviewRepository,
        IUnitOfWork unitOfWork,
        ILogger<ReviewService> logger)
    {
        _reviewRepository = reviewRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<(bool Success, string Message, ReviewResponesDTO? Review)> CreateReviewAsync(CreateReviewDTO dto)
    {
        try
        {
            if(dto.ProductId == 0)
                dto.ProductId = null;
            if(dto.EventId == 0)
                dto.EventId = null;
            // Validate that either EventId or ProductId is provided
            if (!dto.EventId.HasValue && !dto.ProductId.HasValue )
            {
                    return (false, "Either EventId or ProductId must be provided", null);
            }
            if (dto.EventId.HasValue && dto.ProductId.HasValue)
            {
                return (false, "Only one of EventId or ProductId should be provided", null);
            }
            if(dto.UserId == null)
            {
                return (false, "UserId must be provided", null);
            }

            if (dto.Rating < 1 || dto.Rating > 5)
            {
                return (false, "Rating must be between 1 and 5", null);
            }

            
            // Check if user already reviewed this event/product
            if (dto.EventId.HasValue)
            {
                var hasReviewed = await _reviewRepository.HasUserReviewedEventAsync(dto.UserId, dto.EventId.Value);
                if (hasReviewed)
                {
                    return (false, "You have already reviewed this event", null);
                }
            }

            if (dto.ProductId.HasValue)
            {
                var hasReviewed = await _reviewRepository.HasUserReviewedProductAsync(dto.UserId, dto.ProductId.Value);
                if (hasReviewed)
                {
                    return (false, "You have already reviewed this product", null);
                }
            }

            var review = new Review(
                userId: dto.UserId,
                rating: dto.Rating,
                comment: dto.Comment,
                eventId: dto.EventId,
                productId: dto.ProductId,
                reviewType: dto.ReviewType
            );

            var createdReview = await _reviewRepository.CreateReviewAsync(review);
            await _unitOfWork.SaveChangesAsync();

            var reviewrespone = new ReviewResponesDTO
            {
                ReviewId = createdReview.Id,
                UserId = createdReview.UserId,
                Rating = createdReview.Rating,
                Comment = createdReview.Comment,
                ReviewType = createdReview.ReviewType,
                ProductId = createdReview.ProductId,
                EventId = createdReview.EventId,
            };
            return (true, "Review created successfully", reviewrespone);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating review");
            return (false, "An error occurred while creating the review", null);
        }
    }

    public async Task<(bool Success, string Message, ReviewResponesDTO? Review)> GetReviewByIdAsync(int id)
    {
        try
        {
            var review = await _reviewRepository.GetReviewByIdAsync(id);
            
            if (review == null)
            {
                return (false, "Review not found", null);
            }
            var reviewrespone = new ReviewResponesDTO
            {
                ReviewId = review.Id,
                UserId = review.UserId,
                Rating = review.Rating,
                Comment = review.Comment,
                ReviewType = review.ReviewType,
                ProductId = review.ProductId,
                EventId = review.EventId,
                UserName = review.user.UserName
            };
            return (true, "Review retrieved successfully", reviewrespone);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving review");
            return (false, "An error occurred while retrieving the review", null);
        }
    }

    public async Task<(bool Success, string Message, IEnumerable<ReviewResponesDTO>? Reviews)> GetReviewsByEventIdAsync(int eventId)
    {
        try
        {
            var reviews = await _reviewRepository.GetActiveReviewsByEventIdAsync(eventId, pageNumber: 1, pageSize: int.MaxValue);

            var reviewList = new List<ReviewResponesDTO>();
            foreach(var review in reviews)
            {
                var reviewrespone = new ReviewResponesDTO
                {
                    ReviewId = review.Id,
                    UserId = review.UserId,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    ReviewType = review.ReviewType,
                    ProductId = review.ProductId,
                    EventId = review.EventId,
                    UserName = review.user.UserName
                };
                reviewList.Add(reviewrespone);
            }
            return (true, "Reviews retrieved successfully", reviewList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving reviews for event {EventId}", eventId);
            return (false, "An error occurred while retrieving reviews", null);
        }
    }

    public async Task<(bool Success, string Message, IEnumerable<ReviewResponesDTO>? Reviews)> GetReviewsByProductIdAsync(int productId)
    {
        try
        {
            var reviews = await _reviewRepository.GetActiveReviewsByProductIdAsync(productId, pageNumber: 1, pageSize: int.MaxValue);
            var reviewList = new List<ReviewResponesDTO>();
            foreach (var review in reviews)
            {
                var reviewrespone = new ReviewResponesDTO
                {
                    ReviewId = review.Id,
                    UserId = review.UserId,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    ReviewType = review.ReviewType,
                    ProductId = review.ProductId,
                    EventId = review.EventId,
                    UserName = review.user.UserName
                };
                reviewList.Add(reviewrespone);
            }
            return (true, "Reviews retrieved successfully", reviewList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving reviews for product {ProductId}", productId);
            return (false, "An error occurred while retrieving reviews", null);
        }
    }
    public async Task<(bool Success, string Message)> UpdateReviewAsync(int id, UpdateReviewDTO dto)
    {
        try
        {
            var existingReview = await _reviewRepository.GetReviewByIdAsync(id);
            
            if (existingReview == null)
            {
                return (false, "Review not found");
            }

            // Verify ownership
            if (existingReview.UserId != dto.UserId)
            {
                return (false, "You can only update your own reviews");
            }
            if(dto.Rating != null && dto.Rating < 1 || dto.Rating > 5)
            {
                return (false, "Rating must be between 1 and 5");
            }
            var newrating = dto.Rating ?? existingReview.Rating;
            // Create updated review (using reflection or create new instance)
            existingReview.UpdateReview(
                 newrating,
                 dto.Comment
            );

            int result = await _unitOfWork.SaveChangesAsync();

            if (result < 0)
            {
                return (false, "Failed to update review");
            }

            return (true, "Review updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating review");
            return (false, "An error occurred while updating the review");
        }
    }

    public async Task<(bool Success, string Message)> DeleteReviewAsync(int id)
    {
        try
        {
            var deleted = await _reviewRepository.DeleteReviewAsync(id);
            
            if (!deleted)
            {
                return (false, "Review not found or already deleted");
            }

            await _unitOfWork.SaveChangesAsync();
            return (true, "Review deleted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting review");
            return (false, "An error occurred while deleting the review");
        }
    }
}