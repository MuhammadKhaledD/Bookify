using Bookify_Backend.Entities;

namespace Bookify_Backend.Repositories.Interfaces;

/// <summary>
/// Review repository interface with review-specific queries
/// </summary>
public interface IReviewRepository
{
    // Basic CRUD
    Task<Review?> GetByIdAsync(int id);
    Task<IEnumerable<Review>> GetAllAsync();
    Task<Review> AddAsync(Review entity);
    Task UpdateAsync(Review entity);
    Task DeleteAsync(Review entity);
    Task<bool> ExistsAsync(int id);
    Task<int> CountAsync();

    // Review-specific queries
    /// <summary>
    /// Get review by ID with details (user, event, product)
    /// </summary>
    Task<Review?> GetByIdWithDetailsAsync(int id);

    /// <summary>
    /// Get reviews by event ID
    /// </summary>
    Task<IEnumerable<Review>> GetReviewsByEventIdAsync(int eventId, int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Get reviews by product ID
    /// </summary>
    Task<IEnumerable<Review>> GetReviewsByProductIdAsync(int productId, int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Get reviews by user ID
    /// </summary>
    Task<IEnumerable<Review>> GetReviewsByUserIdAsync(string userId, int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Get average rating for an event
    /// </summary>
    Task<float> GetAverageRatingForEventAsync(int eventId);

    /// <summary>
    /// Get average rating for a product
    /// </summary>
    Task<float> GetAverageRatingForProductAsync(int productId);

    /// <summary>
    /// Get active (non-deleted) reviews for event
    /// </summary>
    Task<IEnumerable<Review>> GetActiveReviewsByEventIdAsync(int eventId, int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Get active (non-deleted) reviews for product
    /// </summary>
    Task<IEnumerable<Review>> GetActiveReviewsByProductIdAsync(int productId, int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Check if user has reviewed an event
    /// </summary>
    Task<bool> HasUserReviewedEventAsync(string userId, int eventId);

    /// <summary>
    /// Check if user has reviewed a product
    /// </summary>
    Task<bool> HasUserReviewedProductAsync(string userId, int productId);

    /// <summary>
    /// Get reviews count for event
    /// </summary>
    Task<int> GetReviewsCountForEventAsync(int eventId);

    /// <summary>
    /// Get reviews count for product
    /// </summary>
    Task<int> GetReviewsCountForProductAsync(int productId);
    
    Task<Review> CreateReviewAsync(Review review);
    Task<Review?> GetReviewByIdAsync(int id);
    Task<IEnumerable<Review>> GetAllReviewsAsync(int pageNumber = 1, int pageSize = 20);
    Task<Review?> UpdateReviewAsync(Review review);
    Task<bool> DeleteReviewAsync(int id);
}

