using Bookify_Backend.Entities;

namespace Bookify_Backend.Repositories.Interfaces;

/// <summary>
/// Organization repository interface with organization-specific queries
/// </summary>
public interface IOrganizationRepository
{
    // Basic CRUD
    Task<Organization?> GetByIdAsync(int id);
    Task<IEnumerable<Organization>> GetAllAsync();
    Task<Organization> AddAsync(Organization entity);
    Task UpdateAsync(Organization entity);
    Task DeleteAsync(Organization entity);
    Task<bool> ExistsAsync(int id);
    Task<int> CountAsync();

    // Organization-specific queries
    /// <summary>
    /// Get all active (non-deleted) organizations
    /// </summary>
    Task<IEnumerable<Organization>> GetAllActiveAsync(int pageNumber = 1, int pageSize = 20);

    /// <summary>
    /// Get organization by ID with related data (events, store, organizers)
    /// </summary>
    Task<Organization?> GetByIdWithDetailsAsync(int id);

    /// <summary>
    /// Get organization by name
    /// </summary>
    Task<Organization?> GetByNameAsync(string name);

    /// <summary>
    /// Get organizations by organizer user ID
    /// </summary>
    Task<IEnumerable<Organization>> GetOrganizationsByOrganizerAsync(string userId);

    /// <summary>
    /// Get organization IDs by organizer user ID
    /// </summary>
    Task<IEnumerable<int>> GetOrganizationIdsByOrganizerAsync(string userId);

    /// <summary>
    /// Check if organization name exists
    /// </summary>
    Task<bool> NameExistsAsync(string name);

    /// <summary>
    /// Get active organizations count
    /// </summary>
    Task<int> GetActiveCountAsync();
}

