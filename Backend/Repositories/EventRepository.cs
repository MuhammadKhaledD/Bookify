﻿using Bookify_Backend.DataBase;
using Bookify_Backend.Entities;
using Bookify_Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookify_Backend.Repositories;

/// <summary>
/// Event-specific repository with custom queries
/// </summary>
public class EventRepository : IEventRepository
{
    private readonly DBContext _context;
    private readonly DbSet<Event> _dbSet;

    public EventRepository(DBContext context)
    {
        _context = context;
        _dbSet = context.Set<Event>();
    }

    #region Basic CRUD

    public async Task<Event?> GetByIdAsync(int id)
        => await _dbSet.FindAsync(id);

    public async Task<IEnumerable<Event>> GetAllAsync()
        => await _dbSet
            .Include(e => e.org)
            .Include(e => e.category)
            .Include(e => e.tickets.Where(t => !t.IsDeleted))
            .ToListAsync();

    public async Task<Event> AddAsync(Event entity)
    {
        var entry = await _dbSet.AddAsync(entity);
        return entry.Entity;
    }

    public Task UpdateAsync(Event entity)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Event entity)
    {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(int id)
        => await _dbSet.AnyAsync(e => e.Id == id);

    public async Task<int> CountAsync()
        => await _dbSet.CountAsync();

    #endregion

    #region Core Query Methods

    /// <summary>
    /// Get event by ID with all related data
    /// </summary>
    public async Task<Event?> GetEventByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(e => e.org)
            .Include(e => e.category)
            .Include(e => e.tickets.Where(t => !t.IsDeleted))
            .FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);
    }

    /// <summary>
    /// Get active events with pagination
    /// </summary>
    public async Task<IEnumerable<Event>> GetAllActiveEventsAsync(int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(e => e.org)
            .Include(e => e.category)
            .Include(e => e.tickets.Where(t => !t.IsDeleted))
            .Where(e => !e.IsDeleted && e.Status == "Active")
            .OrderByDescending(e => e.EventDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    /// <summary>
    /// Get upcoming events (future events)
    /// </summary>
    public async Task<IEnumerable<Event>> GetUpcomingEventsAsync(int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(e => e.org)
            .Include(e => e.category)
            .Include(e => e.tickets.Where(t => !t.IsDeleted))
            .Where(e => !e.IsDeleted && e.Status == "Active" && e.EventDate > DateTime.UtcNow)
            .OrderBy(e => e.EventDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    /// <summary>
    /// Get events by category
    /// </summary>
    public async Task<IEnumerable<Event>> GetEventsByCategoryAsync(int categoryId, int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(e => e.org)
            .Include(e => e.category)
            .Include(e => e.tickets.Where(t => !t.IsDeleted))
            .Where(e => !e.IsDeleted && e.Status == "Active" && e.CategoryId == categoryId)
            .OrderByDescending(e => e.EventDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    /// <summary>
    /// Get events by organization (for organizer dashboard)
    /// </summary>
    public async Task<IEnumerable<Event>> GetEventsByOrganizationAsync(int orgId, int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(e => e.org)
            .Include(e => e.category)
            .Include(e => e.tickets.Where(t => !t.IsDeleted))
            .Where(e => !e.IsDeleted && e.OrgId == orgId)
            .OrderByDescending(e => e.AddedOn)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    /// <summary>
    /// Get events by multiple organizations
    /// </summary>
    public async Task<IEnumerable<Event>> GetEventsByOrganizationsAsync(IEnumerable<int> orgIds, int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(e => e.org)
            .Include(e => e.category)
            .Include(e => e.tickets.Where(t => !t.IsDeleted))
            .Where(e => !e.IsDeleted && orgIds.Contains(e.OrgId))
            .OrderByDescending(e => e.AddedOn)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    /// <summary>
    /// Search events with filters (simplified - let service layer handle complex filtering)
    /// </summary>
    public async Task<IEnumerable<Event>> SearchEventsAsync(
        string? searchTerm = null,
        int? categoryId = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        string? location = null,
        string? status = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        int pageNumber = 1,
        int pageSize = 20)
    {
        var query = BuildSearchQuery(searchTerm, categoryId, startDate, endDate, location, status, minPrice, maxPrice);

        return await query
            .OrderByDescending(e => e.EventDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    #endregion

    #region Count Methods

    public async Task<int> GetActiveEventsCountAsync()
        => await _dbSet.CountAsync(e => !e.IsDeleted && e.Status == "Active");

    public async Task<int> GetUpcomingEventsCountAsync()
        => await _dbSet.CountAsync(e => !e.IsDeleted && e.Status == "Active" && e.EventDate > DateTime.UtcNow);

    public async Task<int> GetEventsByCategoryCountAsync(int categoryId)
        => await _dbSet.CountAsync(e => !e.IsDeleted && e.Status == "Active" && e.CategoryId == categoryId);

    public async Task<int> GetEventsByOrganizationCountAsync(int orgId)
        => await _dbSet.CountAsync(e => !e.IsDeleted && e.OrgId == orgId);

    public async Task<int> GetEventsByOrganizationsCountAsync(IEnumerable<int> orgIds)
        => await _dbSet.CountAsync(e => !e.IsDeleted && orgIds.Contains(e.OrgId));

    public async Task<int> GetSearchEventsCountAsync(
        string? searchTerm = null,
        int? categoryId = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        string? location = null,
        string? status = null,
        decimal? minPrice = null,
        decimal? maxPrice = null)
    {
        return await BuildSearchQuery(searchTerm, categoryId, startDate, endDate, location, status, minPrice, maxPrice).CountAsync();
    }

    #endregion

    #region Admin Methods

    public async Task<IEnumerable<Event>> GetAllEventsAdminAsync(int pageNumber = 1, int pageSize = 20)
    {
        return await _dbSet
            .Include(e => e.org)
            .Include(e => e.category)
            .OrderByDescending(e => e.AddedOn)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetAllEventsCountAsync()
        => await _dbSet.CountAsync();

    #endregion

    #region Helper Methods

    public async Task<bool> IsUserOrganizerOfEventAsync(int eventId, string userId)
    {
        return await _dbSet
            .Where(e => e.Id == eventId && !e.IsDeleted)
            .AnyAsync(e => e.org.organization_organizers.Any(oo => oo.UserId == userId && !oo.IsDeleted));
    }

    /// <summary>
    /// Private helper to build search query (reused by search and count)
    /// </summary>
    private IQueryable<Event> BuildSearchQuery(
        string? searchTerm,
        int? categoryId,
        DateTime? startDate,
        DateTime? endDate,
        string? location,
        string? status,
        decimal? minPrice,
        decimal? maxPrice)
    {
        var query = _dbSet
            .Include(e => e.org)
            .Include(e => e.category)
            .Include(e => e.tickets.Where(t => !t.IsDeleted))
            .Where(e => !e.IsDeleted);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(e =>
                e.Title.ToLower().Contains(term) ||
                e.Description.ToLower().Contains(term) ||
                e.org.Name.ToLower().Contains(term));
        }

        if (categoryId.HasValue)
            query = query.Where(e => e.CategoryId == categoryId.Value);

        if (startDate.HasValue)
            query = query.Where(e => e.EventDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(e => e.EventDate <= endDate.Value);

        if (!string.IsNullOrWhiteSpace(location))
        {
            var loc = location.ToLower();
            query = query.Where(e =>
                (e.LocationName != null && e.LocationName.ToLower().Contains(loc)) ||
                e.LocationAddress.ToLower().Contains(loc));
        }

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(e => e.Status == status);

        if (minPrice.HasValue)
            query = query.Where(e => e.tickets.Any(t => t.Price >= minPrice.Value));

        if (maxPrice.HasValue)
            query = query.Where(e => e.tickets.Any(t => t.Price <= maxPrice.Value));

        return query;
    }

    #endregion
}

