using Bookify_Backend.Entities;

namespace Bookify_Backend.Repositories.Interfaces;

/// <summary>
/// Store repository interface with store-specific queries
/// </summary>
public interface IStoreRepository
{
    // Basic CRUD
    Task<Store?> GetByIdAsync(int id);
    Task<IEnumerable<Store>> GetAllAsync();
    Task<Store> AddAsync(Store entity);
    Task UpdateAsync(Store entity);
    Task DeleteAsync(Store entity);
    Task<bool> ExistsAsync(int id);
    Task<int> CountAsync();

    // Store-specific queries
    /// <summary>
    /// Get store by ID with details (organization, products)
    /// </summary>
    Task<Store?> GetByIdWithDetailsAsync(int id);

    /// <summary>
    /// Get store by organization ID
    /// </summary>
    Task<Store?> GetStoreByOrganizationIdAsync(int orgId);

    /// <summary>
    /// Get all active (status=true) stores
    /// </summary>
    Task<IEnumerable<Store>> GetAllActiveAsync(int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Get store by name
    /// </summary>
    Task<Store?> GetByNameAsync(string name);

    /// <summary>
    /// Check if organization already has a store
    /// </summary>
    Task<bool> OrganizationHasStoreAsync(int orgId);

    /// <summary>
    /// Get active stores count
    /// </summary>
    Task<int> GetActiveCountAsync();
}

