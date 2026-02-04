using Bookify_Backend.Entities;

namespace Bookify_Backend.Repositories.Interfaces;

/// <summary>
/// OrganizationOrganizer repository interface with organizer-specific queries
/// </summary>
public interface IOrganizationOrganizerRepository
{
    // Basic CRUD
    Task<OrganizationOrganizer?> GetByIdAsync(string userId, int orgId);
    Task<IEnumerable<OrganizationOrganizer>> GetAllAsync();
    Task<OrganizationOrganizer> AddAsync(OrganizationOrganizer entity);
    Task UpdateAsync(OrganizationOrganizer entity);
    Task DeleteAsync(OrganizationOrganizer entity);
    Task<bool> ExistsAsync(string userId, int orgId);
    Task<int> CountAsync();

    // OrganizationOrganizer-specific queries
    /// <summary>
    /// Get all organizers by organization ID
    /// </summary>
    Task<IEnumerable<OrganizationOrganizer>> GetOrganizersByOrganizationAsync(int orgId);

    /// <summary>
    /// Get all organizations by user ID
    /// </summary>
    Task<IEnumerable<OrganizationOrganizer>> GetOrganizationsByUserAsync(string userId);

    /// <summary>
    /// Get active organizers by organization ID
    /// </summary>
    Task<IEnumerable<OrganizationOrganizer>> GetActiveOrganizersByOrganizationAsync(int orgId);

    /// <summary>
    /// Check if user is organizer of an organization
    /// </summary>
    Task<bool> IsUserOrganizerOfOrganizationAsync(string userId, int orgId);

    /// <summary>
    /// Get organization IDs for a user
    /// </summary>
    Task<IEnumerable<int>> GetOrganizationIdsForUserAsync(string userId);

    Task<IEnumerable<OrganizationOrganizer>> GetByUserIdAsync(string userId);
}

