using Bookify_Backend.Entities;

namespace Bookify_Backend.Repositories.Interfaces;

/// <summary>
/// Shop repository interface with shop-specific queries
/// </summary>
public interface IShopRepository
{
    // Basic CRUD
    Task<Shop?> GetByIdAsync(int id);
    Task<IEnumerable<Shop>> GetAllAsync();
    Task<Shop> AddAsync(Shop entity);
    Task UpdateAsync(Shop entity);
    Task DeleteAsync(Shop entity);
    Task<bool> ExistsAsync(int id);
    Task<int> CountAsync();

    // Shop-specific queries
    /// <summary>
    /// Get shop by ID with details (event, products)
    /// </summary>
    Task<Shop?> GetByIdWithDetailsAsync(int id);

    /// <summary>
    /// Get shop by event ID
    /// </summary>
    Task<Shop?> GetShopByEventIdAsync(int eventId);

    /// <summary>
    /// Get all active (status=true) shops
    /// </summary>
    Task<IEnumerable<Shop>> GetAllActiveAsync(int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Get shop by name
    /// </summary>
    Task<Shop?> GetByNameAsync(string name);

    /// <summary>
    /// Check if event already has a shop
    /// </summary>
    Task<bool> EventHasShopAsync(int eventId);

    /// <summary>
    /// Get shops by organization (through events)
    /// </summary>
    Task<IEnumerable<Shop>> GetShopsByOrganizationAsync(int orgId, int pageNumber = 1, int pageSize = 20);
}

