using Bookify_Backend.Entities;

namespace Bookify_Backend.Repositories.Interfaces;

/// <summary>
/// Redemption repository interface with redemption-specific queries
/// </summary>
public interface IRedemptionRepository
{
    // Basic CRUD
    Task<Redemption?> GetByIdAsync(int id);
    Task<IEnumerable<Redemption>> GetAllAsync();
    Task<Redemption> AddAsync(Redemption entity);
    Task UpdateAsync(Redemption entity);
    Task DeleteAsync(Redemption entity);
    Task<bool> ExistsAsync(int id);
    Task<int> CountAsync();
    
    Task<IEnumerable<Redemption>> GetRedemptionsByProductIdAsync(int productId);
    Task<IEnumerable<Redemption>> GetRedemptionsByTicketIdAsync(int ticketId);

    // Redemption-specific queries
    /// <summary>
    /// Get redemption by ID with details (user, reward)
    /// </summary>
    Task<Redemption?> GetByIdWithDetailsAsync(int id);

    /// <summary>
    /// Get redemptions by user ID
    /// </summary>
    Task<IEnumerable<Redemption>> GetRedemptionsByUserIdAsync(string userId, int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Get redemptions by reward ID
    /// </summary>
    Task<IEnumerable<Redemption>> GetRedemptionsByRewardIdAsync(int rewardId, int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Get redemptions by status
    /// </summary>
    Task<IEnumerable<Redemption>> GetRedemptionsByStatusAsync(string status, int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Get user's total redeemed points
    /// </summary>
    Task<int> GetTotalPointsRedeemedByUserAsync(string userId);

    /// <summary>
    /// Get redemptions count by user
    /// </summary>
    Task<int> GetRedemptionsCountByUserAsync(string userId);

    /// <summary>
    /// Get redemptions within date range
    /// </summary>
    Task<IEnumerable<Redemption>> GetRedemptionsByDateRangeAsync(DateTime startDate, DateTime endDate, int pageNumber = 1, int pageSize = 20);
}

