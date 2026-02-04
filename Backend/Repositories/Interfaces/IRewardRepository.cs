using Bookify_Backend.Entities;

namespace Bookify_Backend.Repositories.Interfaces;

/// <summary>
/// Reward repository interface with reward-specific queries
/// </summary>
public interface IRewardRepository
{
    // Basic CRUD
    Task<Reward?> GetByIdAsync(int id);
    Task<IEnumerable<Reward>> GetAllAsync();
    Task<Reward> AddAsync(Reward entity);
    Task UpdateAsync(Reward entity);
    Task DeleteAsync(Reward entity);
    Task<bool> ExistsAsync(int id);
    Task<int> CountAsync();

    // Reward-specific queries
    /// <summary>
    /// Get reward by ID with details (product, ticket)
    /// </summary>
    Task<Reward?> GetByIdWithDetailsAsync(int id);

    /// <summary>
    /// Get all active (non-deleted, status=true) rewards
    /// </summary>
    Task<IEnumerable<Reward>> GetAllActiveAsync(int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Get rewards by type
    /// </summary>
    Task<IEnumerable<Reward>> GetRewardsByTypeAsync(string rewardType, int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Get rewards within points range
    /// </summary>
    Task<IEnumerable<Reward>> GetRewardsByPointsRangeAsync(int minPoints, int maxPoints, int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Get rewards that haven't expired
    /// </summary>
    Task<IEnumerable<Reward>> GetNonExpiredRewardsAsync(int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Get rewards by product ID
    /// </summary>
    Task<IEnumerable<Reward>> GetRewardsByProductIdAsync(int productId);

    /// <summary>
    /// Get rewards by ticket ID
    /// </summary>
    Task<IEnumerable<Reward>> GetRewardsByTicketIdAsync(int ticketId);

    /// <summary>
    /// Get active rewards count
    /// </summary>
    Task<int> GetActiveCountAsync();

    /// <summary>
    /// Get rewards redeemable with given points
    /// </summary>
    Task<IEnumerable<Reward>> GetRewardsRedeemableWithPointsAsync(int points, int pageNumber = 1, int pageSize = 20);
}

