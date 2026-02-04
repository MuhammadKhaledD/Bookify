﻿using Bookify_Backend.Entities;

namespace Bookify_Backend.Repositories.Interfaces;

/// <summary>
/// Event-specific repository interface with custom queries
/// </summary>
public interface IEventRepository
{
    // Basic CRUD
    Task<Event?> GetByIdAsync(int id);
    Task<IEnumerable<Event>> GetAllAsync();
    Task<Event> AddAsync(Event entity);
    Task UpdateAsync(Event entity);
    Task DeleteAsync(Event entity);
    Task<bool> ExistsAsync(int id);
    Task<int> CountAsync();

    // Complex queries for events
    
    /// <summary>
    /// Get all active events with related data (Organization, Category, Tickets)
    /// </summary>
    Task<IEnumerable<Event>> GetAllActiveEventsAsync(int pageNumber = 1, int pageSize = 20);
    
    /// <summary>
    /// Get event by ID with related data
    /// </summary>
    Task<Event?> GetEventByIdWithDetailsAsync(int id);
    
    /// <summary>
    /// Get upcoming active events
    /// </summary>
    Task<IEnumerable<Event>> GetUpcomingEventsAsync(int pageNumber = 1, int pageSize = 20);
    
    /// <summary>
    /// Get events by category
    /// </summary>
    Task<IEnumerable<Event>> GetEventsByCategoryAsync(int categoryId, int pageNumber = 1, int pageSize = 20);
    
    /// <summary>
    /// Get events by organization ID
    /// </summary>
    Task<IEnumerable<Event>> GetEventsByOrganizationAsync(int orgId, int pageNumber = 1, int pageSize = 20);
    
    /// <summary>
    /// Get events by multiple organization IDs (for organizers with multiple orgs)
    /// </summary>
    Task<IEnumerable<Event>> GetEventsByOrganizationsAsync(IEnumerable<int> orgIds, int pageNumber = 1, int pageSize = 20);
    
    /// <summary>
    /// Search events with filters
    /// </summary>
    Task<IEnumerable<Event>> SearchEventsAsync(
        string? searchTerm = null,
        int? categoryId = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        string? location = null,
        string? status = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        int pageNumber = 1,
        int pageSize = 20);
    
    /// <summary>
    /// Get count of all active events
    /// </summary>
    Task<int> GetActiveEventsCountAsync();
    
    /// <summary>
    /// Get count of upcoming events
    /// </summary>
    Task<int> GetUpcomingEventsCountAsync();
    
    /// <summary>
    /// Get count of events by category
    /// </summary>
    Task<int> GetEventsByCategoryCountAsync(int categoryId);
    
    /// <summary>
    /// Get count of events by organization
    /// </summary>
    Task<int> GetEventsByOrganizationCountAsync(int orgId);
    
    /// <summary>
    /// Get count of events by multiple organizations
    /// </summary>
    Task<int> GetEventsByOrganizationsCountAsync(IEnumerable<int> orgIds);
    
    /// <summary>
    /// Get count of search results
    /// </summary>
    Task<int> GetSearchEventsCountAsync(
        string? searchTerm = null,
        int? categoryId = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        string? location = null,
        string? status = null,
        decimal? minPrice = null,
        decimal? maxPrice = null);
    
    /// <summary>
    /// Get all events including deleted (admin only)
    /// </summary>
    Task<IEnumerable<Event>> GetAllEventsAdminAsync(int pageNumber = 1, int pageSize = 20);
    
    /// <summary>
    /// Get count of all events including deleted
    /// </summary>
    Task<int> GetAllEventsCountAsync();
    
    /// <summary>
    /// Check if user is organizer of event's organization
    /// </summary>
    Task<bool> IsUserOrganizerOfEventAsync(int eventId, string userId);
}

